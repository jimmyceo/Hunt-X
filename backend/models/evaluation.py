"""
Evaluation model (6-block A-F)
"""

from sqlalchemy import Column, String, Text, ForeignKey, Integer, Numeric, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class Evaluation(BaseModel):
    __tablename__ = "evaluations"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(ForeignKey("resumes.id"), nullable=False, index=True)

    # Job info
    company = Column(String(255))
    role = Column(String(255))
    job_description = Column(Text)
    job_url = Column(String(500))

    # Block A: Role Summary
    archetype = Column(String(100))
    domain = Column(String(100))
    seniority = Column(String(50))
    remote_policy = Column(String(50))

    # Block B: Match
    matched_requirements = Column(JSON)
    gaps = Column(JSON)

    # Block C: Strategy
    positioning_strategy = Column(Text)

    # Block D: Compensation
    salary_range_min = Column(Integer)
    salary_range_max = Column(Integer)
    market_data = Column(JSON)

    # Blocks E & F
    personalization_plan = Column(JSON)
    interview_plan = Column(JSON)

    # Overall
    global_score = Column(Numeric(2, 1))  # 1.0 - 5.0
    recommendation = Column(Text)

    # Relationships
    user = relationship("User", back_populates="evaluations")
    resume = relationship("Resume", back_populates="evaluations")
    cvs = relationship("CV", back_populates="evaluation")
    cover_letters = relationship("CoverLetter", back_populates="evaluation")
    interview_preps = relationship("InterviewPrep", back_populates="evaluation")
    chat_sessions = relationship("ChatSession", back_populates="evaluation")

    def __repr__(self):
        return f"<Evaluation(id={self.id}, company={self.company}, score={self.global_score})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "company": self.company,
            "role": self.role,
            "archetype": self.archetype,
            "global_score": float(self.global_score) if self.global_score else None,
            "recommendation": self.recommendation,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
