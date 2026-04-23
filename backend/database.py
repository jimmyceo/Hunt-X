from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Get DATABASE_URL from environment, fallback to SQLite for local dev
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./hunt_x.db')

# Force SQLite only for local development (no DATABASE_URL set or SQLite path)
if not DATABASE_URL or DATABASE_URL.startswith('sqlite'):
    DATABASE_URL = 'sqlite:///./hunt_x.db'
    print(f"Using database: SQLite (local development)")
else:
    # Add SSL mode for Supabase connections if not present
    if 'supabase' in DATABASE_URL and 'sslmode' not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL + "?sslmode=require"
    print(f"Using database: PostgreSQL (production)")

# Configure engine based on database type
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Re-export from models to avoid duplicate definitions
from models.base import Base, engine as models_engine
from models import User, Resume

def init_db():
    """Initialize database tables"""
    # Import all models to ensure they're registered with Base
    from models import (
        CV, CoverLetter, Evaluation, InterviewPrep,
        ChatSession, ChatMessage, ScrapedJob, SavedJob,
        SubscriptionPlan, UserSubscription, SubscriptionEvent,
        CreditBalance, UsageLog
    )
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
