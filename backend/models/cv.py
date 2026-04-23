"""
CV model (generated)
"""

from sqlalchemy import Column, String, Text, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship

from models.base import BaseModel


class CV(BaseModel):
    __tablename__ = "cvs"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(ForeignKey("resumes.id"), nullable=False, index=True)
    evaluation_id = Column(ForeignKey("evaluations.id"), nullable=False, index=True)

    # Content
    html_content = Column(Text)
    pdf_path = Column(String(500))

    # Metadata
    job_title = Column(String(255))
    company = Column(String(255))
    ats_score = Column(Float)
    keyword_matches = Column(Integer)

    # Relationships
    user = relationship("User", back_populates="cvs")
    resume = relationship("Resume", back_populates="cvs")
    evaluation = relationship("Evaluation", back_populates="cvs")
    cover_letters = relationship("CoverLetter", back_populates="cv")

    def __repr__(self):
        return f"<CV(id={self.id}, job_title={self.job_title})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "job_title": self.job_title,
            "company": self.company,
            "ats_score": self.ats_score,
            "keyword_matches": self.keyword_matches,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
