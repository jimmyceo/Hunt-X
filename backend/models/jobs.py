"""
Job scraper models
"""

from sqlalchemy import Column, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class ScrapedJob(BaseModel):
    __tablename__ = "scraped_jobs"

    # Source
    portal = Column(String(100))
    external_id = Column(String(255))
    url = Column(String(500), unique=True, index=True)

    # Content
    title = Column(String(255))
    company = Column(String(255))
    location = Column(String(255))
    description = Column(Text)

    # Analysis
    archetype = Column(String(100))
    seniority = Column(String(50))
    required_skills = Column(JSON, default=list)
    salary_range = Column(String(255))
    remote_policy = Column(String(50))

    # Scoring
    quality_score = Column(Float)

    # Deduplication
    content_hash = Column(String(64), unique=True, index=True)

    # Metadata
    posted_date = Column(DateTime)
    scraped_at = Column(DateTime)

    # Relationships
    saved_by = relationship("SavedJob", back_populates="scraped_job")

    def __repr__(self):
        return f"<ScrapedJob(id={self.id}, title={self.title}, company={self.company})>"


class SavedJob(BaseModel):
    __tablename__ = "saved_jobs"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    scraped_job_id = Column(ForeignKey("scraped_jobs.id"), nullable=False, index=True)
    notes = Column(Text)
    status = Column(String(50), default="saved")  # saved, applied, interviewing, etc.

    # Relationships
    user = relationship("User", back_populates="saved_jobs")
    scraped_job = relationship("ScrapedJob", back_populates="saved_by")

    def __repr__(self):
        return f"<SavedJob(user_id={self.user_id}, job_id={self.scraped_job_id})>"
