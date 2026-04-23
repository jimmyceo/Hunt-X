"""
bKash Payment Provider (Placeholder)

To implement:
1. Get bKash merchant credentials:
   - app_key
   - app_secret
   - base_url (sandbox/production)

2. Copy this file to bkash_provider.py
3. Implement PaymentProvider abstract methods
4. Add to PaymentRouter.PROVIDER_MAP

bKash API Documentation:
https://developer.bka.sh/reference/getting-started-with-bkash-checkout

Key differences from Stripe:
- Token-based auth (not API key)
- 2-step payment (create + execute)
- Mobile-first UX
- No subscription support (one-time only)
"""

from payments import PaymentProvider, PaymentProviderType, SubscriptionTier
from typing import Dict, Any, Optional
from datetime import datetime
import requests


class BkashProvider(PaymentProvider):
    """
    bKash payment provider for Bangladesh market.

    Supports:
    - bKash wallet payments
    - One-time payments only (bKash doesn't support subscriptions)
    - Mobile-first checkout flow

    Limitations:
    - No subscription support (implement manual recurring)
    - No native webhook (use callback URLs)
    """

    SANDBOX_URL = "https://tokenized.sandbox.bka.sh"
    PRODUCTION_URL = "https://tokenized.pay.bka.sh"

    def __init__(self, db: Any, config: Dict[str, Any]):
        super().__init__(db, config)

        self.app_key = config.get("app_key")
        self.app_secret = config.get("app_secret")
        self.base_url = config.get("base_url", self.SANDBOX_URL)
        self.is_sandbox = "sandbox" in self.base_url

        self._token = None
        self._token_expires = None

    @property
    def provider_type(self) -> PaymentProviderType:
        return PaymentProviderType.BANGLADESH_BKASH

    def _get_auth_token(self) -> str:
        """Get bKash auth token (valid for 1 hour)"""

        if self._token and self._token_expires > datetime.utcnow():
            return self._token

        # Token endpoint
        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/token/grant"

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "app_key": self.app_key,
            "app_secret": self.app_secret
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()
        self._token = data["id_token"]
        self._token_expires = datetime.utcnow() + timedelta(minutes=50)

        return self._token

    async def create_checkout(
        self,
        user_id: str,
        tier: SubscriptionTier,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create bKash payment.

        bKash flow:
        1. Create payment (gets paymentID)
        2. Redirect user to bKash UI
        3. User completes payment in bKash app
        4. Execute payment with paymentID
        """

        # Get pricing for Bangladesh
        pricing = self._get_pricing(tier)

        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/create"

        headers = {
            "Authorization": f"Bearer {self._get_auth_token()}",
            "X-APP-Key": self.app_key,
            "Content-Type": "application/json"
        }

        # Store in DB to retrieve later
        invoice_number = f"HX-{user_id}-{datetime.utcnow().timestamp()}"

        payload = {
            "mode": "0000",  # Test mode
            "payerReference": user_id,
            "callbackURL": success_url,
            "amount": str(pricing["amount_bdt"] / 100),  # Convert cents to taka
            "currency": "BDT",
            "merchantInvoiceNumber": invoice_number,
            "intent": "sale"
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()

        return {
            "checkout_url": data.get("bkashURL"),  # User redirected here
            "session_id": data.get("paymentID"),     # Store for execute
            "provider": self.provider_type.value,
            "metadata": {
                "tier": tier.value,
                "amount_bdt": pricing["amount_bdt"],
                "invoice_number": invoice_number
            }
        }

    async def execute_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Execute bKash payment after user confirms.

        Call this from your callback handler.
        """

        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/execute"

        headers = {
            "Authorization": f"Bearer {self._get_auth_token()}",
            "X-APP-Key": self.app_key,
            "Content-Type": "application/json"
        }

        payload = {
            "paymentID": payment_id
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        data = response.json()

        return {
            "success": data.get("transactionStatus") == "Completed",
            "transaction_id": data.get("trxID"),
            "amount": data.get("amount"),
            "currency": data.get("currency"),
            "paid_at": datetime.utcnow()
        }

    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """Query payment status"""

        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/payment/status"

        headers = {
            "Authorization": f"Bearer {self._get_auth_token()}",
            "X-APP-Key": self.app_key,
            "Content-Type": "application/json"
        }

        payload = {
            "paymentID": session_id
        }

        response = requests.post(url, json=payload, headers=headers)
        data = response.json()

        return {
            "success": data.get("transactionStatus") == "Completed",
            "user_id": data.get("payerReference"),
            "transaction_id": data.get("trxID"),
            "amount_paid": int(float(data.get("amount", 0)) * 100),  # Convert to cents
            "currency": "bdt",
            "paid_at": datetime.utcnow()
        }

    async def cancel_subscription(self, user_id: str) -> bool:
        """
        bKash doesn't support subscriptions.

        For recurring billing:
        - Store next billing date locally
        - Send reminder before renewal
        - User manually pays again
        """
        return True

    async def get_invoices(self, user_id: str) -> list:
        """Query bKash for transaction history"""
        # bKash API doesn't support query by payer
        # Store transactions locally
        return []

    def handle_webhook(self, payload: bytes, signature: Optional[str]) -> Dict[str, Any]:
        """
        bKash doesn't have webhooks.

        Use callback URL with paymentID instead.
        """
        return {"event_type": "callback_only"}

    def is_payment_method_available(self, user_region: str) -> bool:
        """Only available in Bangladesh"""
        return user_region == "BD"

    def _get_pricing(self, tier: SubscriptionTier) -> Dict[str, int]:
        """Bangladesh pricing in BDT"""

        # Approximate conversion (€1 ≈ ৳120)
        pricing = {
            SubscriptionTier.TRY: {"amount_bdt": 0},
            SubscriptionTier.ACTIVE: {"amount_bdt": 144000},    # ৳1,200 ≈ €12
            SubscriptionTier.AGGRESSIVE: {"amount_bdt": 348000}, # ৳2,900 ≈ €29
            SubscriptionTier.UNLIMITED: {"amount_bdt": 588000},  # ৳4,900 ≈ €49
        }

        return pricing.get(tier, {"amount_bdt": 0})

    # ============ bKash-Specific Methods ============

    async def refund_payment(self, payment_id: str, amount: float) -> bool:
        """Refund a bKash payment"""

        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/payment/refund"

        headers = {
            "Authorization": f"Bearer {self._get_auth_token()}",
            "X-APP-Key": self.app_key,
            "Content-Type": "application/json"
        }

        payload = {
            "paymentID": payment_id,
            "amount": str(amount),
            "trxID": "transaction_id_here",  # Get from DB
            "sku": "refund"
        }

        response = requests.post(url, json=payload, headers=headers)
        return response.status_code == 200

    async def query_balance(self) -> Dict[str, Any]:
        """Query merchant bKash balance"""

        url = f"{self.base_url}/v1.2.0-beta/tokenized/checkout/merchant/balance"

        headers = {
            "Authorization": f"Bearer {self._get_auth_token()}",
            "X-APP-Key": self.app_key,
        }

        response = requests.get(url, headers=headers)
        return response.json()
