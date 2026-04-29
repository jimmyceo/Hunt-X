"""
Resume Roaster router
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from limiter import limiter
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import get_db, User
from dependencies import get_current_user

router = APIRouter(prefix="/api/roaster", tags=["roaster"])


class RoastRequest(BaseModel):
    resume_id: str
    tone: str = "gentle"  # gentle | direct


class RoastResponse(BaseModel):
    overall_score: int
    overall_label: str
    scores: list
    suggestions: list
    highlights: list


@router.post("/", response_model=RoastResponse)
@limiter.limit("20/hour")
async def roast_resume(
    request: Request,
    request_data: RoastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Roast a resume and return scores + suggestions"""
    from models import Resume
    from services.roaster_service import RoasterService
    from ai.client import AIClient

    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == request_data.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume has no text content")

    # Roast it
    service = RoasterService(AIClient())
    result = await service.roast(resume.raw_text, tone=request_data.tone)

    return RoastResponse(
        overall_score=result.overall_score,
        overall_label=result.overall_label,
        scores=[
            {
                "category": s.category,
                "score": s.score,
                "label": s.label,
                "summary": s.summary
            }
            for s in result.scores
        ],
        suggestions=[
            {
                "category": s.category,
                "severity": s.severity,
                "title": s.title,
                "description": s.description,
                "example": s.example
            }
            for s in result.suggestions
        ],
        highlights=result.highlights
    )
