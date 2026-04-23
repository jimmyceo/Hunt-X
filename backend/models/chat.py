"""
Chat models
"""

from sqlalchemy import Column, String, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship

from models.base import BaseModel


class ChatSession(BaseModel):
    __tablename__ = "chat_sessions"

    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(String(255))
    evaluation_id = Column(ForeignKey("evaluations.id"), nullable=False, index=True)

    context = Column(JSON)  # Full context for AI

    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    evaluation = relationship("Evaluation", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id})>"


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    session_id = Column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    proof_points = Column(JSON, default=list)
    citations = Column(JSON, default=list)
    confidence = Column(Float)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role={self.role})>"
