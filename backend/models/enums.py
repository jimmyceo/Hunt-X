"""
Enums and constants for Hunt-X subscription system
"""
from enum import Enum


class SubscriptionTier(str, Enum):
    """Subscription tiers available in Hunt-X"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    TEAM = "team"


class SubscriptionStatus(str, Enum):
    """Status of a subscription"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"


class Feature(str, Enum):
    """Trackable features for usage"""
    JOB_SCAN = "job.scan"
    CV_GENERATE = "cv.generate"
    RESUME_UPLOAD = "resume.upload"
    RESUME_ANALYZE = "resume.analyze"
    COVER_LETTER_GENERATE = "cover_letter.generate"
    INTERVIEW_PREP = "interview.prep"
    API_REQUEST = "api.request"
    EXPORT_PDF = "export.pdf"
    EXPORT_DOCX = "export.docx"


class SubscriptionEventType(str, Enum):
    """Types of subscription events for audit logs"""
    CREATED = "subscription.created"
    UPGRADED = "subscription.upgraded"
    DOWNGRADED = "subscription.downgraded"
    CANCELLED = "subscription.cancelled"
    REACTIVATED = "subscription.reactivated"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    CREDITS_RESET = "credits.reset"


# Plan configurations
PLAN_CONFIGS = {
    SubscriptionTier.FREE: {
        "name": "Free",
        "price_monthly_cents": 0,
        "price_yearly_cents": 0,
        "limits": {
            Feature.JOB_SCAN: 5,
            Feature.CV_GENERATE: 1,
            Feature.RESUME_UPLOAD: 2,
            Feature.RESUME_ANALYZE: 2,
            Feature.COVER_LETTER_GENERATE: 0,
            Feature.INTERVIEW_PREP: 0,
            Feature.API_REQUEST: 0,
            Feature.EXPORT_PDF: 1,
            Feature.EXPORT_DOCX: 0,
        },
        "features": [
            "5_job_scans",
            "1_cv_generation",
            "basic_resume_analysis",
            "email_support",
        ],
    },
    SubscriptionTier.STARTER: {
        "name": "Starter",
        "price_monthly_cents": 900,
        "price_yearly_cents": 9000,
        "limits": {
            Feature.JOB_SCAN: 20,
            Feature.CV_GENERATE: 5,
            Feature.RESUME_UPLOAD: 10,
            Feature.RESUME_ANALYZE: 10,
            Feature.COVER_LETTER_GENERATE: 5,
            Feature.INTERVIEW_PREP: 0,
            Feature.API_REQUEST: 0,
            Feature.EXPORT_PDF: 10,
            Feature.EXPORT_DOCX: 10,
        },
        "features": [
            "20_job_scans",
            "5_cv_generations",
            "full_resume_analysis",
            "5_cover_letters",
            "priority_email_support",
        ],
    },
    SubscriptionTier.PRO: {
        "name": "Pro",
        "price_monthly_cents": 2900,
        "price_yearly_cents": 29000,
        "limits": {
            Feature.JOB_SCAN: -1,  # Unlimited
            Feature.CV_GENERATE: -1,
            Feature.RESUME_UPLOAD: -1,
            Feature.RESUME_ANALYZE: -1,
            Feature.COVER_LETTER_GENERATE: -1,
            Feature.INTERVIEW_PREP: -1,
            Feature.API_REQUEST: 1000,
            Feature.EXPORT_PDF: -1,
            Feature.EXPORT_DOCX: -1,
        },
        "features": [
            "unlimited_job_scans",
            "unlimited_cv_generations",
            "advanced_ai_resume_scoring",
            "unlimited_cover_letters",
            "interview_prep_and_mock_questions",
            "application_tracker",
            "priority_chat_support",
            "api_access",
        ],
    },
    SubscriptionTier.TEAM: {
        "name": "Team",
        "price_monthly_cents": 4900,
        "price_yearly_cents": 49000,
        "limits": {
            Feature.JOB_SCAN: -1,
            Feature.CV_GENERATE: -1,
            Feature.RESUME_UPLOAD: -1,
            Feature.RESUME_ANALYZE: -1,
            Feature.COVER_LETTER_GENERATE: -1,
            Feature.INTERVIEW_PREP: -1,
            Feature.API_REQUEST: 10000,
            Feature.EXPORT_PDF: -1,
            Feature.EXPORT_DOCX: -1,
        },
        "features": [
            "everything_in_pro",
            "up_to_5_team_members",
            "shared_job_boards",
            "team_analytics_dashboard",
            "dedicated_account_manager",
            "white_label_exports",
            "admin_analytics",
        ],
    },
}


def get_plan_config(tier: SubscriptionTier) -> dict:
    """Get configuration for a subscription tier"""
    return PLAN_CONFIGS.get(tier, PLAN_CONFIGS[SubscriptionTier.FREE])


def get_feature_limit(tier: SubscriptionTier, feature: Feature) -> int:
    """Get the limit for a specific feature in a tier"""
    config = get_plan_config(tier)
    return config["limits"].get(feature, 0)


def is_unlimited(tier: SubscriptionTier, feature: Feature) -> bool:
    """Check if a feature is unlimited for a tier"""
    limit = get_feature_limit(tier, feature)
    return limit == -1
