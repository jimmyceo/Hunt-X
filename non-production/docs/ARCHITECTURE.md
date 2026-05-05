# Multi-Region Payment Architecture

## Overview

Extensible payment system supporting Stripe (global) now, with clear paths for India (free/paid) and Bangladesh (bKash) later.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Abstraction                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   STRIPE     │  │    INDIA     │  │  BANGLADESH  │      │
│  │   (Global)   │  │  (Free/UPI)  │  │    (bKash)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  All implement PaymentProvider abstract base class         │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐   ┌──────────────┐
            │ Region Router│   │ Unified API  │
            │ (IP/override)  │   │ (/checkout)  │
            └──────────────┘   └──────────────┘
```

## File Structure

```
backend/payments/
├── __init__.py                      # Core abstractions
│   ├── PaymentProvider (ABC)       # Base class for all providers
│   ├── PaymentRouter                 # Routes to correct provider
│   ├── RegionConfig                  # Region-based pricing
│   └── PaymentError exceptions
│
├── providers/
│   ├── __init__.py                   # Stripe implementation
│   ├── stripe_provider.py           # Full Stripe integration
│   ├── india_free_placeholder.py    # Template for India free tier
│   └── bkash_placeholder.py         # Template for Bangladesh
│
routers/
├── payment_v2.py                    # New unified API
│   ├── POST /checkout               # Auto-routes to provider
│   ├── GET /config                  # Frontend config
│   ├── POST /webhook/{provider}     # Universal webhooks
│   ├── GET /status                  # Subscription status
│   ├── POST /cancel                 # Cancel subscription
│   ├── GET /invoices                # Payment history
│   └── GET /portal                  # Stripe billing portal
│
└── payment.py (legacy)              # Keep for backward compat
```

## Current State (Stripe Only)

### Working Features:
- [x] Checkout session creation
- [x] Webhook handling
- [x] Subscription lifecycle
- [x] Invoice retrieval
- [x] Billing portal
- [x] Tier upgrades/downgrades
- [x] Proration support

### API Endpoints:

```python
# Create checkout (auto-detects region)
POST /api/payment/v2/checkout
{
    "tier": "active",  # try | active | aggressive | unlimited
    "country_override": "US"  # optional
}

# Get status
GET /api/payment/v2/status

# Webhook (universal)
POST /api/payment/v2/webhook/stripe

# Billing portal
POST /api/payment/v2/portal
```

## Adding a New Provider

### Step 1: Create Provider Class

Copy `bkash_placeholder.py` to `bkash_provider.py`:

```python
from payments import PaymentProvider, PaymentProviderType

class BkashProvider(PaymentProvider):
    @property
    def provider_type(self):
        return PaymentProviderType.BANGLADESH_BKASH

    async def create_checkout(self, user_id, tier, success_url, cancel_url):
        # Implement bKash create payment
        pass

    # ... implement other abstract methods
```

### Step 2: Register Provider

In `payments/__init__.py`, add to `PaymentRouter.PROVIDER_MAP`:

```python
PROVIDER_MAP = {
    PaymentProviderType.STRIPE: "payments.providers.stripe_provider.StripeProvider",
    PaymentProviderType.BANGLADESH_BKASH: "payments.providers.bkash_provider.BkashProvider",
}
```

### Step 3: Configure Region

In `RegionConfig.REGION_MAP`:

```python
REGION_MAP = {
    "default": [PaymentProviderType.STRIPE],
    "BD": [PaymentProviderType.BANGLADESH_BKASH, PaymentProviderType.STRIPE],
}
```

### Step 4: Add Pricing

In `RegionConfig.TIER_PRICING`:

```python
"BD": {
    SubscriptionTier.ACTIVE: {"amount": 144000, "currency": "bdt"},  # ৳1,200
}
```

### Step 5: Environment Variables

```bash
# bKash credentials
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_BASE_URL=https://tokenized.pay.bka.sh
```

## Region Detection Strategy

### Current: Manual Override
- User can specify `country_override` in checkout request
- Falls back to Stripe (default)

### Future: Automatic Detection

```python
def _detect_country(self, ip_address: str) -> str:
    # Option 1: GeoIP2 database
    import geoip2.database
    reader = geoip2.database.Reader('GeoLite2-Country.mmdb')
    response = reader.country(ip_address)
    return response.country.iso_code

    # Option 2: IP-API (free tier)
    import requests
    response = requests.get(f"http://ip-api.com/json/{ip_address}")
    return response.json().get("countryCode")
```

## Provider Comparison

| Feature | Stripe | India Free | bKash |
|---------|--------|------------|-------|
| Credit Cards | ✅ | ❌ | ❌ |
| UPI | ❌ | Future | ❌ |
| bKash Wallet | ❌ | ❌ | ✅ |
| Subscriptions | ✅ | ❌* | ❌* |
| Webhooks | ✅ | N/A | ❌ |
| Refunds | ✅ | N/A | ✅ |

*Manual recurring via reminders

## Frontend Integration

### Current (Stripe):

```typescript
// Get config
const config = await fetch('/api/payment/v2/config')
// Returns: { stripe_publishable_key, pricing }

// Create checkout
const response = await fetch('/api/payment/v2/checkout', {
    method: 'POST',
    body: JSON.stringify({ tier: 'active' })
})
// Returns: { checkout_url }

// Redirect to Stripe
window.location = response.checkout_url
```

### Future (Multi-Provider):

```typescript
// Same API works for all providers
const response = await fetch('/api/payment/v2/checkout', {
    method: 'POST',
    body: JSON.stringify({
        tier: 'active',
        country_override: 'BD'  // Forces bKash
    })
})

// Provider field tells frontend how to handle
if (response.provider === 'stripe') {
    window.location = response.checkout_url
} else if (response.provider === 'bangladesh_bkash') {
    // bKash uses special mobile flow
    openBkashApp(response.checkout_url)
}
```

## Migration Path

### Phase 1: Stripe Only (Current)
- [x] Provider abstraction
- [x] Region routing (fallback to Stripe)
- [x] Unified API

### Phase 2: India Free (Future)
- [ ] Implement IndiaFreeProvider
- [ ] Add 5-job monthly quota
- [ ] UPI upgrade prompt

### Phase 3: Bangladesh (Future)
- [ ] Get bKash merchant account
- [ ] Implement BkashProvider
- [ ] Mobile-first checkout UX

### Phase 4: Optimization (Future)
- [ ] Automatic IP geolocation
- [ ] Local currency display
- [ ] Regional compliance (GST/VAT)

## Environment Variables

```bash
# Current (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Future (India)
# None needed for free tier
RAZORPAY_KEY_ID=rzp_test_...  # If adding paid tiers
RAZORPAY_KEY_SECRET=...

# Future (Bangladesh)
BKASH_APP_KEY=...
BKASH_APP_SECRET=...
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh  # or production

# Optional (Geolocation)
GEOIP_DATABASE_PATH=/path/to/GeoLite2-Country.mmdb
```

## Next Steps

1. **Review this architecture** - Confirm it meets your needs
2. **Test Stripe flow** - Verify existing functionality works
3. **Add auth dependency** - Connect to your JWT auth system
4. **Deploy v2 API** - Run alongside legacy for gradual migration
5. **Plan India/Bangladesh** - When ready, implement placeholders

## Key Design Decisions

1. **Single API endpoint** - `/checkout` works regardless of provider
2. **Provider auto-detection** - But can be overridden
3. **Unified webhooks** - `/webhook/{provider}` routes to correct handler
4. **Backward compatibility** - Legacy `/api/payment/*` still works
5. **Currency per region** - Future: EUR → INR/BDT conversion

## Files Ready for Implementation

- [x] `payments/__init__.py` - Core abstractions
- [x] `payments/providers/__init__.py` - Stripe implementation
- [x] `payments/providers/india_free_placeholder.py` - Template
- [x] `payments/providers/bkash_placeholder.py` - Template
- [x] `routers/payment_v2.py` - New unified API
- [ ] `routers/payment.py` - Keep for compatibility

## Questions?

Review the code in each file - they're fully documented. When you're ready to implement India or Bangladesh, just:

1. Copy the placeholder file
2. Fill in the TODOs
3. Register in PROVIDER_MAP
4. Add region config
5. Test!
