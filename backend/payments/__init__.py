"""
Payment Provider Abstraction Layer

This module provides a unified interface for multiple payment providers.
Currently implements Stripe. Future providers: India (Free/Razorpay), bKash.

Usage:
    from payments.router import PaymentRouter

    router = PaymentRouter(db)
    provider = router.get_provider(user_region="global")  # or "india", "bangladesh"
    checkout_url = await provider.create_checkout(user_id, plan_tier)
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from enum import Enum

class PaymentProviderType(str, Enum):
    """Supported payment providers"""
    STRIPE = "stripe"
    INDIA_FREE = "india_free"      # Future: Free tier for India
    INDIA_RAZORPAY = "india_razorpay"  # Future: Razorpay for India
    BANGLADESH_BKASH = "bangladesh_bkash"  # Future: bKash
    BANGLADESH_SSLCOMMERZ = "bangladesh_sslcommerz"  # Future: SSLCommerz

# NOTE: SubscriptionTier is imported from models.enums in payment_v2.py
# Kept here for backward compatibility with existing StripeProvider code
# that references payments.SubscriptionTier directly.
from models.enums import SubscriptionTier

class PaymentProvider(ABC):
    """
    Abstract base class for all payment providers.

    To add a new provider (e.g., bKash):
    1. Create class inheriting from PaymentProvider
    2. Implement all abstract methods
    3. Register in PaymentRouter.PROVIDER_MAP
    """

    def __init__(self, db: Any, config: Dict[str, Any]):
        self.db = db
        self.config = config

    @property
    @abstractmethod
    def provider_type(self) -> PaymentProviderType:
        """Return the provider type identifier"""
        pass

    @abstractmethod
    async def create_checkout(
        self,
        user_id: str,
        tier: SubscriptionTier,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create a checkout session for user to complete payment.

        Returns:
            {
                "checkout_url": str,      # URL to redirect user
                "session_id": str,        # Provider-specific session ID
                "provider": str,          # Provider type
                "metadata": dict          # Additional provider-specific data
            }
        """
        pass

    @abstractmethod
    async def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """
        Verify if payment was completed successfully.

        Returns:
            {
                "success": bool,
                "user_id": str,
                "tier": str,
                "transaction_id": str,
                "amount_paid": int,       # Amount in cents/smallest unit
                "currency": str,
                "paid_at": datetime
            }
        """
        pass

    @abstractmethod
    async def cancel_subscription(self, user_id: str) -> bool:
        """Cancel user's active subscription"""
        pass

    @abstractmethod
    async def get_invoices(self, user_id: str) -> list:
        """Get payment history for user"""
        pass

    @abstractmethod
    def handle_webhook(self, payload: bytes, signature: Optional[str]) -> Dict[str, Any]:
        """
        Process webhook from payment provider.

        Returns event data for routing to handlers.
        """
        pass

    @abstractmethod
    def is_payment_method_available(self, user_region: str) -> bool:
        """Check if this provider supports the given region"""
        pass


class RegionConfig:
    """
    Configuration for region-based payment routing.

    REGION_MAP: Maps country codes to preferred providers
    TIER_PRICING: Pricing per region (to support local currency later)
    """

    # Country code -> Provider priority list
    REGION_MAP = {
        "default": [PaymentProviderType.STRIPE],
        "IN": [PaymentProviderType.INDIA_FREE, PaymentProviderType.STRIPE],  # India
        "BD": [PaymentProviderType.BANGLADESH_BKASH, PaymentProviderType.STRIPE],  # Bangladesh
        "US": [PaymentProviderType.STRIPE],
        "EU": [PaymentProviderType.STRIPE],
    }

    # Pricing per region (EUR base, can extend for local currency)
    TIER_PRICING = {
        "default": {
            SubscriptionTier.FREE: {"amount": 0, "currency": "eur"},
            SubscriptionTier.STARTER: {"amount": 900, "currency": "eur"},   # €9
            SubscriptionTier.PRO: {"amount": 2900, "currency": "eur"},      # €29
            SubscriptionTier.TEAM: {"amount": 4900, "currency": "eur"},       # €49
        },
        # Future: India pricing in INR
        # "IN": {
        #     SubscriptionTier.FREE: {"amount": 0, "currency": "inr"},
        #     SubscriptionTier.STARTER: {"amount": 79900, "currency": "inr"},
        #     ...
        # },
        # Future: Bangladesh pricing in BDT
        # "BD": {
        #     SubscriptionTier.STARTER: {"amount": 100000, "currency": "bdt"},
        #     ...
        # },
    }

    @classmethod
    def get_providers_for_region(cls, country_code: str) -> list:
        """Get prioritized list of providers for region"""
        return cls.REGION_MAP.get(country_code, cls.REGION_MAP["default"])

    @classmethod
    def get_pricing(cls, country_code: str, tier: SubscriptionTier) -> Dict[str, Any]:
        """Get pricing for tier in region"""
        pricing_tier = cls.TIER_PRICING.get(country_code, cls.TIER_PRICING["default"])
        return pricing_tier.get(tier, {"amount": 0, "currency": "eur"})


class PaymentRouter:
    """
    Routes payment requests to appropriate provider based on region.

    Usage:
        router = PaymentRouter(db)
        provider = router.get_provider_for_user(user_id, ip_address="1.1.1.1")
        result = await provider.create_checkout(...)
    """

    def __init__(self, db: Any):
        self.db = db
        self._providers = {}

    def _get_provider_class(self, provider_type: PaymentProviderType):
        """Lazy load provider classes"""
        if provider_type == PaymentProviderType.STRIPE:
            from payments.providers import StripeProvider
            return StripeProvider

        raise ValueError(f"Provider {provider_type} not implemented")

    def get_provider(self, provider_type: PaymentProviderType) -> PaymentProvider:
        """Get or create provider instance"""
        if provider_type not in self._providers:
            provider_class = self._get_provider_class(provider_type)
            self._providers[provider_type] = provider_class(
                db=self.db,
                config=self._get_provider_config(provider_type)
            )
        return self._providers[provider_type]

    def get_provider_for_user(
        self,
        user_id: str,
        ip_address: Optional[str] = None,
        country_override: Optional[str] = None
    ) -> PaymentProvider:
        """
        Determine best provider for user based on region.

        Args:
            user_id: User's ID
            ip_address: Client IP for geolocation
            country_override: Manual country selection (e.g., user preference)
        """
        # Determine country
        country = country_override or self._detect_country(ip_address)

        # Get prioritized providers for region
        providers = RegionConfig.get_providers_for_region(country)

        # Return first available provider
        for provider_type in providers:
            try:
                provider = self.get_provider(provider_type)
                if provider.is_payment_method_available(country):
                    return provider
            except ValueError:
                # Provider not implemented yet, skip
                continue

        # Fallback to Stripe
        return self.get_provider(PaymentProviderType.STRIPE)

    def _detect_country(self, ip_address: Optional[str]) -> str:
        """
        Detect country from IP address.

        For now: returns "default"
        Future: Use GeoIP2 or similar service
        """
        # TODO: Implement IP geolocation
        # Example with GeoIP2:
        # import geoip2.database
        # reader = geoip2.database.Reader('GeoLite2-Country.mmdb')
        # response = reader.country(ip_address)
        # return response.country.iso_code

        return "default"

    def _get_provider_config(self, provider_type: PaymentProviderType) -> Dict[str, Any]:
        """Get configuration for provider from environment"""
        import os

        configs = {
            PaymentProviderType.STRIPE: {
                "api_key": os.getenv("STRIPE_SECRET_KEY"),
                "webhook_secret": os.getenv("STRIPE_WEBHOOK_SECRET"),
                "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY"),
            },
            # Future configs:
            # PaymentProviderType.BANGLADESH_BKASH: {
            #     "app_key": os.getenv("BKASH_APP_KEY"),
            #     "app_secret": os.getenv("BKASH_APP_SECRET"),
            #     "base_url": os.getenv("BKASH_BASE_URL"),
            # },
        }

        return configs.get(provider_type, {})

    async def route_checkout_request(
        self,
        user_id: str,
        tier: SubscriptionTier,
        ip_address: Optional[str] = None,
        country_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        High-level method to create checkout with automatic provider selection.

        This is the main entry point for checkout creation.
        """
        provider = self.get_provider_for_user(user_id, ip_address, country_override)

        # Get region-appropriate pricing
        country = country_override or self._detect_country(ip_address)
        pricing = RegionConfig.get_pricing(country, tier)

        # Create checkout
        result = await provider.create_checkout(
            user_id=user_id,
            tier=tier,
            success_url=f"{self._get_base_url()}/dashboard?payment=success",
            cancel_url=f"{self._get_base_url()}/pricing?cancelled"
        )

        # Add region/pricing metadata
        result["region"] = country
        result["pricing"] = pricing
        result["provider_type"] = provider.provider_type.value

        return result

    def _get_base_url(self) -> str:
        """Get application base URL"""
        import os
        return os.getenv("FRONTEND_URL", "https://hunt-x.app")


class PaymentError(Exception):
    """Base exception for payment errors"""
    pass

class ProviderNotAvailableError(PaymentError):
    """Raised when requested provider is not available for region"""
    pass

class CheckoutCreationError(PaymentError):
    """Raised when checkout session creation fails"""
    pass
