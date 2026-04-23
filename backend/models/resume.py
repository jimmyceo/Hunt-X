"""
Resume model
"""

from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class Resume(BaseModel):
    __tablename__ = "resumes"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # File info
    original_filename = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)

    # Parsed content
    raw_text = Column(Text)
    structured_data = Column(JSON)

    # AI analysis
    skills = Column(JSON, default=list)
    experience_years = Column(Float)
    industry_focus = Column(String(255))
    seniority_level = Column(String(50))

    # Generated PDF
    pdf_path = Column(String(500))

    # Relationships
    user = relationship("User", back_populates="resumes")
    evaluations = relationship("Evaluation", back_populates="resume")
    cvs = relationship("CV", back_populates="resume")

    def __repr__(self):
        return f"<Resume(id={self.id}, user_id={self.user_id})>"
