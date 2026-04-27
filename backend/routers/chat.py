"""
Chat API endpoints
WebSocket or REST for real-time application assistance
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from services.chat_assist_service import ChatAssistService, ChatMessage
from dependencies import get_chat_service, get_current_user, get_db

router = APIRouter(prefix="/api/chat", tags=["chat"])


class StartChatRequest(BaseModel):
    job_id: str
    resume_id: str


class ChatMessageResponse(BaseModel):
    role: str
    content: str
    timestamp: datetime
    proof_points: Optional[List[str]] = None


class AskQuestionRequest(BaseModel):
    question: str


class ChatSessionResponse(BaseModel):
    job_id: str
    company: str
    job_title: str
    match_score: float
    message_count: int


@router.post("/start", response_model=ChatSessionResponse)
async def start_chat(
    request: StartChatRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_service: ChatAssistService = Depends(get_chat_service)
):
    """
    Start a new chat session for job application assistance.
    Requires previous evaluation data.
    """
    from models import Resume, Evaluation

    # Fetch resume
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == user.id
    ).first()
    if not resume or not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume not found or empty")

    # Fetch evaluation by job_id (treating job_id as evaluation_id for now)
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == request.job_id,
        Evaluation.user_id == user.id
    ).first()

    job_description = evaluation.job_description if evaluation else ""
    company = evaluation.company if evaluation else ""
    job_title = evaluation.role if evaluation else ""
    evaluation_data = {
        "company": company,
        "job_title": job_title,
        "archetype": evaluation.archetype if evaluation else "",
        "global_score": float(evaluation.global_score) if evaluation and evaluation.global_score else 0,
    }

    context = chat_service.start_chat(
        user_id=user.id,
        job_id=request.job_id,
        resume_text=resume.raw_text,
        job_description=job_description,
        company=company,
        job_title=job_title,
        evaluation_data=evaluation_data
    )

    return ChatSessionResponse(
        job_id=context.job_id,
        company=context.company,
        job_title=context.job_title,
        match_score=context.match_score,
        message_count=0
    )


@router.post("/{job_id}/ask", response_model=ChatMessageResponse)
async def ask_question(
    job_id: str,
    request: AskQuestionRequest,
    user=Depends(get_current_user),
    chat_service: ChatAssistService = Depends(get_chat_service)
):
    """
    Ask a question about the job application.
    Returns context-aware answer based on resume and job description.
    """

    try:
        response = await chat_service.ask_question(
            user_id=user.id,
            job_id=job_id,
            question=request.question
        )

        return ChatMessageResponse(
            role=response.role,
            content=response.content,
            timestamp=response.timestamp,
            proof_points=response.proof_points
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{job_id}/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    job_id: str,
    user=Depends(get_current_user),
    chat_service: ChatAssistService = Depends(get_chat_service)
):
    """Get chat history for a job"""

    messages = chat_service.get_chat_history(user.id, job_id)

    return [
        ChatMessageResponse(
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp,
            proof_points=msg.proof_points
        )
        for msg in messages
    ]


@router.delete("/{job_id}")
async def clear_chat(
    job_id: str,
    user=Depends(get_current_user),
    chat_service: ChatAssistService = Depends(get_chat_service)
):
    """Clear chat history"""

    chat_service.clear_chat(user.id, job_id)
    return {"status": "cleared"}


@router.post("/quick-answer")
async def quick_answer(
    question: str,
    resume_id: str,
    job_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_service: ChatAssistService = Depends(get_chat_service)
):
    """
    Quick one-off answer without chat context.
    For simple questions.
    """
    from models import Resume, Evaluation

    # Fetch resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user.id
    ).first()
    if not resume or not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume not found or empty")

    # Fetch evaluation
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == job_id,
        Evaluation.user_id == user.id
    ).first()
    job_description = evaluation.job_description if evaluation else ""

    answer = await chat_service.quick_answer(
        resume_text=resume.raw_text,
        job_description=job_description,
        question=question
    )

    return {"answer": answer}
