"""
Stripe Payment Provider Implementation

Refactored from routers/payment.py to fit PaymentProvider abstraction.
Maintains backward compatibility with existing Stripe webhooks.
"""

import stripe
from typing import Dict, Any, Optional
from datetime import datetime
from payments import PaymentProvider, PaymentProviderType, SubscriptionTier, CheckoutCreationError


class StripeProvider(PaymentProvider):
    """
    Stripe payment provider for global market.

    Supports:
    - Credit/debit cards
    - SEPA Direct Debit
    - Apple Pay / Google Pay
    - 3D Secure authentication
    """

    def __init__(self, db: Any, config: Dict[str, Any]):
        super().__init__(db, config)

        # Initialize Stripe
        stripe.api_key = config.get("api_key")
        self.webhook_secret = config.get("webhook_secret")
        self.publishable_key = config.get("publishable_key")

        if not stripe.api_key:
            raise ValueError("Stripe API key not configured")

        # Tier to Stripe Price ID mapping
        self.TIER_CONFIG = {
            SubscriptionTier.FREE: {
                "amount": 0,
                "name": "Hunt-X Free",
                "description": "5 job scans, 1 CV per month",
                "mode": "payment"
            },
            SubscriptionTier.STARTER: {
                "amount": 900,  # €9.00
                "name": "Hunt-X Starter",
                "description": "20 job scans, 5 CVs per month",
                "mode": "subscription"
            },
            SubscriptionTier.PRO: {
                "amount": 2900,  # €29.00
                "name": "Hunt-X Pro",
                "description": "Unlimited scans, unlimited CVs, interview prep",
                "mode": "subscription"
            },
            SubscriptionTier.TEAM: {
                "amount": 4900,  # €49.00
                "name": "Hunt-X Team",
                "description": "Everything in Pro + team collaboration",
                "mode": "subscription"
            },
        }

    @property
    def provider_type(self) -> PaymentProviderType:
        return PaymentProviderType.STRIPE

    async def create_checkout(
        self,
        user_id: str,
        tier: SubscriptionTier,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """Create Stripe Checkout session"""

        config = self.TIER_CONFIG.get(tier)
        if not config:
            raise CheckoutCreationError(f"Unknown tier: {tier}")

        # Free tier - no payment needed
        if tier == SubscriptionTier.FREE:
            return {
                "checkout_url": success_url,
                "session_id": "FREE_TRIAL",
                "provider": self.provider_type.value,
                "metadata": {"tier": tier.value, "free": True}
            }

        try:
            # Get user email for Stripe
            from database import User
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise CheckoutCreationError("User not found")

            # Build line item
            line_item = {
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": config["name"],
                        "description": config["description"]
                    },
                    "unit_amount": config["amount"],
                },
                "quantity": 1,
            }

            # Add recurring for subscriptions
            if config["mode"] == "subscription":
                line_item["price_data"]["recurring"] = {"interval": "month"}

            # Create Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[line_item],
                mode=config["mode"],
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user.email,
                metadata={
                    "user_id": user_id,
                    "tier": tier.value,
                    "provider": self.provider_type.value
                }
            )

            return {
                "checkout_url": session.url,
                "session_id": session.id,
                "provider": self.provider_type.value,
                "metadata": {
                    "tier": tier.value,
                    "amount": config["amount"],
                    "currency": "eur"
                }
            }

        except stripe.error.StripeError as e:
            raise CheckoutCreationError(f"Stripe error: {str(e)}")
        except Exception as e:
            raise CheckoutCreationError(f"Failed to create checkout: {str(e)}")

    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """Verify Stripe Checkout session payment status"""

        if session_id == "FREE_TRIAL":
            return {
                "success": True,
                "user_id": None,
                "tier": SubscriptionTier.FREE.value,
                "transaction_id": "FREE",
                "amount_paid": 0,
                "currency": "eur",
                "paid_at": datetime.utcnow()
            }

        try:
            session = stripe.checkout.Session.retrieve(session_id)

            if session.payment_status != "paid":
                return {"success": False}

            return {
                "success": True,
                "user_id": session.metadata.get("user_id"),
                "tier": session.metadata.get("tier"),
                "transaction_id": session.payment_intent,
                "amount_paid": session.amount_total,
                "currency": session.currency,
                "paid_at": datetime.fromtimestamp(session.created)
            }

        except stripe.error.StripeError as e:
            raise CheckoutCreationError(f"Failed to verify payment: {str(e)}")

    async def cancel_subscription(self, user_id: str) -> bool:
        """Cancel Stripe subscription"""

        from models.subscription import UserSubscription

        subscription = self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

        if not subscription or not subscription.stripe_subscription_id:
            return False

        try:
            stripe.Subscription.delete(subscription.stripe_subscription_id)
            return True
        except stripe.error.StripeError:
            return False

    async def get_invoices(self, user_id: str) -> list:
        """Get Stripe invoices for user"""

        from models.subscription import UserSubscription

        subscription = self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

        if not subscription or not subscription.stripe_customer_id:
            return []

        try:
            invoices = stripe.Invoice.list(
                customer=subscription.stripe_customer_id,
                limit=12  # Last 12 invoices
            )

            return [{
                "id": inv.id,
                "amount": inv.amount_paid,
                "currency": inv.currency,
                "status": inv.status,
                "created": datetime.fromtimestamp(inv.created).isoformat(),
                "invoice_pdf": inv.invoice_pdf,
            } for inv in invoices.data]

        except stripe.error.StripeError:
            return []

    def handle_webhook(self, payload: bytes, signature: Optional[str]) -> Dict[str, Any]:
        """
        Process Stripe webhook event.

        Returns standardized event dict for routing to handlers.
        """

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")

        event_type = event["type"]
        event_data = event["data"]["object"]

        # Map Stripe events to standardized format
        standardized = {
            "provider": self.provider_type.value,
            "stripe_event_type": event_type,
            "event_data": event_data
        }

        # Add standardized event type
        if event_type == "checkout.session.completed":
            standardized["event_type"] = "checkout_completed"
            standardized["user_id"] = event_data.get("metadata", {}).get("user_id")
            standardized["tier"] = event_data.get("metadata", {}).get("tier")

        elif event_type == "invoice.paid":
            standardized["event_type"] = "payment_succeeded"
            standardized["subscription_id"] = event_data.get("subscription")

        elif event_type == "customer.subscription.updated":
            standardized["event_type"] = "subscription_updated"
            standardized["subscription_id"] = event_data.get("id")
            standardized["status"] = event_data.get("status")

        elif event_type == "customer.subscription.deleted":
            standardized["event_type"] = "subscription_cancelled"
            standardized["subscription_id"] = event_data.get("id")

        else:
            standardized["event_type"] = "unknown"

        return standardized

    def is_payment_method_available(self, user_region: str) -> bool:
        """
        Stripe is available globally except for sanctioned countries.

        Returns True for most regions.
        """
        # Stripe restricted countries (as of 2024)
        restricted = {"CU", "IR", "KP", "SY", "RU", "BY"}  # Cuba, Iran, NK, Syria, Russia, Belarus

        return user_region not in restricted

    def get_publishable_key(self) -> Optional[str]:
        """Get Stripe publishable key for frontend"""
        return self.publishable_key

    # ============ Stripe-Specific Methods ============

    async def create_portal_session(self, user_id: str, return_url: str) -> Optional[str]:
        """
        Create Stripe Customer Portal session for billing management.

        Returns portal URL or None if user has no Stripe customer.
        """

        from models.subscription import UserSubscription

        subscription = self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

        if not subscription or not subscription.stripe_customer_id:
            return None

        try:
            session = stripe.billing_portal.Session.create(
                customer=subscription.stripe_customer_id,
                return_url=return_url
            )
            return session.url
        except stripe.error.StripeError:
            return None

    async def update_subscription_tier(
        self,
        user_id: str,
        new_tier: SubscriptionTier
    ) -> bool:
        """
        Update subscription to new tier (upgrade/downgrade).

        Stripe handles proration automatically.
        """

        from models.subscription import UserSubscription

        subscription = self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

        if not subscription or not subscription.stripe_subscription_id:
            return False

        config = self.TIER_CONFIG.get(new_tier)
        if not config:
            return False

        try:
            # Get or create Stripe Price for tier
            # In production, you'd store Price IDs and reuse them
            # For now, we create a new price each time

            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": config["name"]
                        },
                        "unit_amount": config["amount"],
                        "recurring": {"interval": "month"}
                    }
                }],
                proration_behavior="create_prorations"
            )
            return True

        except stripe.error.StripeError:
            return False


# Factory function for easy instantiation
def create_stripe_provider(db: Any) -> StripeProvider:
    """Create Stripe provider with config from environment"""
    import os

    config = {
        "api_key": os.getenv("STRIPE_SECRET_KEY"),
        "webhook_secret": os.getenv("STRIPE_WEBHOOK_SECRET"),
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY"),
    }

    return StripeProvider(db, config)
