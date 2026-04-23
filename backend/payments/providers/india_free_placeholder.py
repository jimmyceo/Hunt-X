"""
India Free Tier Provider (Placeholder)

To implement:
1. Copy this file to india_free.py
2. Implement PaymentProvider abstract methods
3. Add to PaymentRouter.PROVIDER_MAP

This provider would:
- Offer 5 free job evaluations per month
- No payment collection
- Track usage via CreditBalance
- Prompt upgrade to Stripe India after limit
"""

from payments import PaymentProvider, PaymentProviderType, SubscriptionTier
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class IndiaFreeProvider(PaymentProvider):
    """
    Free tier for Indian market.

    Features:
    - 5 job evaluations per month at no cost
    - UPI upgrade option to paid tiers via Stripe India
    - No credit card required
    """

    # Monthly free quota
    FREE_MONTHLY_JOBS = 5

    @property
    def provider_type(self) -> PaymentProviderType:
        return PaymentProviderType.INDIA_FREE

    async def create_checkout(
        self,
        user_id: str,
        tier: SubscriptionTier,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        For Try tier: Just redirect to success (no payment)
        For paid tiers: Return error (should use Stripe India)
        """

        if tier == SubscriptionTier.TRY:
            # Free tier - just activate
            return {
                "checkout_url": success_url,
                "session_id": f"FREE_{user_id}_{datetime.utcnow().timestamp()}",
                "provider": self.provider_type.value,
                "metadata": {
                    "tier": "try",
                    "free": True,
                    "monthly_quota": self.FREE_MONTHLY_JOBS
                }
            }

        # For paid tiers, redirect to Stripe India
        raise ValueError(
            "Paid tiers not available via Free provider. "
            "Use IndiaRazorpayProvider or StripeProvider."
        )

    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """Free tier is always 'paid'"""

        if session_id.startswith("FREE_"):
            parts = session_id.split("_")
            user_id = parts[1] if len(parts) > 1 else None

            return {
                "success": True,
                "user_id": user_id,
                "tier": SubscriptionTier.TRY.value,
                "transaction_id": session_id,
                "amount_paid": 0,
                "currency": "inr",
                "paid_at": datetime.utcnow()
            }

        return {"success": False}

    async def cancel_subscription(self, user_id: str) -> bool:
        """Free tier has nothing to cancel"""
        return True

    async def get_invoices(self, user_id: str) -> list:
        """Free tier has no invoices"""
        return []

    def handle_webhook(self, payload: bytes, signature: Optional[str]) -> Dict[str, Any]:
        """Free tier has no webhooks"""
        return {"event_type": "none"}

    def is_payment_method_available(self, user_region: str) -> bool:
        """Only available in India"""
        return user_region == "IN"

    # ============ India-Specific Methods ============

    async def check_quota(self, user_id: str) -> Dict[str, Any]:
        """
        Check user's monthly free quota.

        Returns:
            {
                "used": int,
                "total": int,
                "remaining": int,
                "resets_at": datetime
            }
        """

        from services.subscription_service import SubscriptionService
        from models.enums import Feature

        sub_service = SubscriptionService(self.db)

        # Check job evaluation credits
        access = sub_service.check_feature_access(user_id, Feature.JOB_EVALUATION)

        return {
            "used": access.get("total", 0) - access.get("remaining", 0),
            "total": self.FREE_MONTHLY_JOBS,
            "remaining": access.get("remaining", 0),
            "resets_at": datetime.utcnow() + timedelta(days=30)
        }

    async def prompt_upgrade(self, user_id: str) -> Dict[str, Any]:
        """
        Return upgrade options when user hits limit.

        Returns Stripe India checkout URL for paid tiers.
        """

        # TODO: Create Stripe India checkout session
        # stripe_provider = StripeIndiaProvider(self.db, self.config)
        # return await stripe_provider.create_checkout(user_id, tier, ...)

        return {
            "can_upgrade": True,
            "upgrade_options": [
                {"tier": "active", "price_inr": 999, "jobs": 40},
                {"tier": "aggressive", "price_inr": 2499, "jobs": 100},
            ],
            "checkout_url": None  # TODO: Generate via Stripe India
        }
