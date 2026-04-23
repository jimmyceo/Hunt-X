"""
Cover letter model
"""

from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship

from models.base import BaseModel


class CoverLetter(BaseModel):
    __tablename__ = "cover_letters"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    cv_id = Column(ForeignKey("cvs.id"), nullable=False, index=True)
    evaluation_id = Column(ForeignKey("evaluations.id"), nullable=False, index=True)

    html_content = Column(Text)
    pdf_path = Column(String(500))
    word_count = Column(Integer)

    hiring_manager_name = Column(String(255))

    # Relationships
    user = relationship("User", back_populates="cover_letters")
    cv = relationship("CV", back_populates="cover_letters")
    evaluation = relationship("Evaluation", back_populates="cover_letters")

    def __repr__(self):
        return f"<CoverLetter(id={self.id}, word_count={self.word_count})>"
