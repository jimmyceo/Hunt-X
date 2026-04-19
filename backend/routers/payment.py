from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db, User
from pydantic import BaseModel
import stripe
import os

router = APIRouter(prefix="/api/payment", tags=["payment"])

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

# Price IDs from Stripe Dashboard
ONE_TIME_PRICE = 4900  # €49 in cents
MONTHLY_PRICE = 2900   # €29 in cents

class CheckoutRequest(BaseModel):
    email: str
    plan: str  # 'lifetime' or 'monthly'

@router.post("/create-checkout")
async def create_checkout(req: CheckoutRequest, db: Session = Depends(get_db)):
    """Create Stripe Checkout session for selected plan"""
    
    # Create or get user
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        from uuid import uuid4
        user = User(
            id=str(uuid4()), 
            email=req.email,
            plan='free'
        )
        db.add(user)
        db.commit()
    
    # Determine price and mode
    if req.plan == 'monthly':
        mode = 'subscription'
        price_cents = MONTHLY_PRICE
        product_name = 'Hunt-X Pro Monthly'
        description = 'Unlimited CV generations, AI analysis, tracker (€29/month)'
    else:  # lifetime
        mode = 'payment'
        price_cents = ONE_TIME_PRICE
        product_name = 'Hunt-X Lifetime Pro'
        description = 'Unlimited CV generations, AI analysis, tracker (One-time €49)'
    
    # Create Stripe Checkout session
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': product_name,
                        'description': description
                    },
                    'unit_amount': price_cents,
                    **({'recurring': {'interval': 'month'}} if mode == 'subscription' else {})
                },
                'quantity': 1,
            }],
            mode=mode,
            success_url='https://hunt-x.app/dashboard?payment=success',
            cancel_url='https://hunt-x.app/pricing?cancelled',
            customer_email=req.email,
            metadata={'user_id': user.id, 'plan': req.plan}
        )
        
        return {
            "checkout_url": session.url, 
            "session_id": session.id,
            "plan": req.plan
        }
    
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook for payment confirmation"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(400, "Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    
    # Handle successful payment
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        plan = session['metadata'].get('plan', 'lifetime')
        
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.stripe_payment_status = 'completed'
            user.stripe_customer_id = session.get('customer')
            user.plan = plan
            db.commit()
    
    # Handle subscription cancellation
    if event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        user = db.query(User).filter(
            User.stripe_customer_id == subscription['customer']
        ).first()
        if user:
            user.plan = 'free'
            user.stripe_payment_status = 'cancelled'
            db.commit()
    
    return {"status": "success"}

@router.get("/status/{email}")
async def check_payment_status(email: str, db: Session = Depends(get_db)):
    """Check user's plan and payment status"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "plan": "free",
            "paid": False,
            "cvs_remaining": 1,  # 1 free CV for trial
            "features": ["1 free CV generation", "Basic resume upload"]
        }
    
    # Freemium limits
    free_limits = {
        "cvs_remaining": 1,
        "features": ["1 free CV generation", "Basic resume upload"]
    }
    
    pro_limits = {
        "cvs_remaining": -1,  # unlimited
        "features": [
            "Unlimited CV generations",
            "AI resume analysis", 
            "Application tracker",
            "Priority support"
        ]
    }
    
    is_paid = user.stripe_payment_status == 'completed'
    
    return {
        "plan": user.plan if is_paid else "free",
        "paid": is_paid,
        **(pro_limits if is_paid else free_limits)
    }