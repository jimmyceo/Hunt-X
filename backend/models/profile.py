"""
Profile model for job search targeting
"""

from sqlalchemy import Column, String, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship

from models.base import BaseModel


class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, default="Default Profile")
    target_roles = Column(JSON, default=list)
    preferred_location = Column(String(255))
    min_salary = Column(Integer)
    remote_preference = Column(String(50), default="any")
    primary_resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True)
    is_default = Column(Integer, default=0)  # 1 = default profile

    user = relationship("User", backref="profiles")
    primary_resume = relationship("Resume", foreign_keys=[primary_resume_id])

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "target_roles": self.target_roles or [],
            "preferred_location": self.preferred_location,
            "min_salary": self.min_salary,
            "remote_preference": self.remote_preference,
            "primary_resume_id": self.primary_resume_id,
            "is_default": bool(self.is_default),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
