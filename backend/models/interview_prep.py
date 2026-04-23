"""
Interview preparation model
"""

from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class InterviewPrep(BaseModel):
    __tablename__ = "interview_preps"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    evaluation_id = Column(ForeignKey("evaluations.id"), nullable=False, index=True)

    star_stories = Column(JSON)
    red_flags = Column(JSON)
    case_study = Column(JSON)
    questions_to_ask = Column(JSON, default=list)
    technical_prep = Column(JSON)

    # Relationships
    user = relationship("User", back_populates="interview_preps")
    evaluation = relationship("Evaluation", back_populates="interview_preps")

    def __repr__(self):
        return f"<InterviewPrep(id={self.id}, evaluation_id={self.evaluation_id})>"
