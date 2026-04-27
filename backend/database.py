"""
Database configuration - delegates to models.base to avoid duplicate engines.
"""

from models.base import engine, SessionLocal, get_db, Base

# Re-export for compatibility
__all__ = ["engine", "SessionLocal", "get_db", "Base"]

def init_db():
    """Initialize database tables"""
    # Import all models to ensure they're registered with Base
    from models import (
        User, Resume, Evaluation, CV, CoverLetter,
        InterviewPrep, ChatSession, ChatMessage,
        ScrapedJob, SavedJob,
        SubscriptionPlan, UserSubscription, SubscriptionEvent,
        CreditBalance, UsageLog
    )
    Base.metadata.create_all(bind=engine)
