"""
Chat-based application assistance service
Real-time Q&A for job applications
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
import json
from datetime import datetime

from ai.client import AIClient
from ai.prompts.chat_assist import CHAT_CONTEXT_PROMPT, QUICK_ANSWER_PROMPT


@dataclass
class ChatMessage:
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    proof_points: Optional[List[str]] = None


@dataclass
class ChatContext:
    user_id: str
    job_id: str
    resume_text: str
    job_description: str
    company: str
    job_title: str
    archetype: str
    match_score: float
    matched_skills: List[str]
    gaps: List[str]
    company_values: str
    positioning: str
    messages: List[ChatMessage]
    created_at: datetime


class ChatAssistService:
    """
    Service for real-time chat-based application assistance.
    Maintains context across conversation.
    """

    def __init__(self, ai_client: AIClient):
        self.ai = ai_client
        self.active_chats: Dict[str, ChatContext] = {}  # user_id:job_id -> context

    def start_chat(
        self,
        user_id: str,
        job_id: str,
        resume_text: str,
        job_description: str,
        company: str,
        job_title: str,
        evaluation_data: dict
    ) -> ChatContext:
        """Initialize new chat session with full context"""

        context = ChatContext(
            user_id=user_id,
            job_id=job_id,
            resume_text=resume_text,
            job_description=job_description,
            company=company,
            job_title=job_title,
            archetype=evaluation_data.get('archetype', 'unknown'),
            match_score=evaluation_data.get('global_score', 0),
            matched_skills=evaluation_data.get('matched_skills', []),
            gaps=evaluation_data.get('gaps', []),
            company_values=evaluation_data.get('company_values', ''),
            positioning=evaluation_data.get('positioning_strategy', ''),
            messages=[],
            created_at=datetime.utcnow()
        )

        # Store in memory (use Redis in production)
        chat_key = f"{user_id}:{job_id}"
        self.active_chats[chat_key] = context

        return context

    async def ask_question(
        self,
        user_id: str,
        job_id: str,
        question: str
    ) -> ChatMessage:
        """Process user question and return AI answer with context"""

        chat_key = f"{user_id}:{job_id}"
        context = self.active_chats.get(chat_key)

        if not context:
            raise ValueError("Chat not found. Start chat first.")

        # Build chat history string
        history_str = self._format_chat_history(context.messages)

        # Build prompt
        prompt = CHAT_CONTEXT_PROMPT.format(
            cv_text=context.resume_text[:4000],  # Truncate if too long
            job_description=context.job_description[:3000],
            company=context.company,
            job_title=context.job_title,
            archetype=context.archetype,
            match_score=context.match_score,
            matched_skills=", ".join(context.matched_skills[:5]),
            gaps=", ".join(context.gaps[:3]),
            company_values=context.company_values,
            positioning=context.positioning,
            chat_history=history_str,
            user_question=question
        )

        # Get AI response
        response = await self.ai.generate_json(prompt)

        # Create assistant message
        assistant_msg = ChatMessage(
            role='assistant',
            content=response['answer'],
            timestamp=datetime.utcnow(),
            proof_points=response.get('proof_points_used', [])
        )

        # Store messages
        user_msg = ChatMessage(
            role='user',
            content=question,
            timestamp=datetime.utcnow()
        )
        context.messages.append(user_msg)
        context.messages.append(assistant_msg)

        return assistant_msg

    async def quick_answer(
        self,
        resume_text: str,
        job_description: str,
        question: str
    ) -> str:
        """Quick one-off answer without chat context (for simple questions)"""

        prompt = QUICK_ANSWER_PROMPT.format(
            cv_text=resume_text[:3000],
            job_description=job_description[:2000],
            question=question
        )

        return await self.ai.generate(prompt)

    def _format_chat_history(self, messages: List[ChatMessage]) -> str:
        """Format chat history for context window"""

        history = []
        # Only include last 6 messages (3 exchanges) to save tokens
        for msg in messages[-6:]:
            role = "User" if msg.role == 'user' else "Assistant"
            history.append(f"{role}: {msg.content[:200]}...")

        return "\n".join(history) if history else "No previous messages."

    def get_chat_history(
        self,
        user_id: str,
        job_id: str
    ) -> List[ChatMessage]:
        """Retrieve chat history"""

        chat_key = f"{user_id}:{job_id}"
        context = self.active_chats.get(chat_key)

        if context:
            return context.messages
        return []

    def clear_chat(self, user_id: str, job_id: str):
        """Clear chat history"""

        chat_key = f"{user_id}:{job_id}"
        if chat_key in self.active_chats:
            del self.active_chats[chat_key]
