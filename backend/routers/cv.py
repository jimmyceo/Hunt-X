"""
CV router
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from limiter import limiter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db, User, Resume, Evaluation, CV as CVModel
from dependencies import get_current_user, get_cv_service
from services.cv_service import CVService

router = APIRouter(prefix="/api/cv", tags=["cv"])


class GenerateCVRequest(BaseModel):
    evaluation_id: str
    template: Optional[str] = None


class CVResponse(BaseModel):
    id: str
    html_content: str
    pdf_url: Optional[str]
    ats_score: float
    keyword_matches: int
    job_title: str
    company: str
    created_at: str


@router.post("/generate", response_model=CVResponse)
@limiter.limit("20/hour")
async def generate_cv(
    request: Request,
    request_data: GenerateCVRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    cv_service: CVService = Depends(get_cv_service)
):
    """
    Generate tailored CV for a job.
    """

    # Get evaluation
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == request_data.evaluation_id,
        Evaluation.user_id == user.id
    ).first()

    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == evaluation.resume_id
    ).first()

    if not resume or not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume not found or empty")

    # Generate CV
    result = await cv_service.generate(
        resume_text=resume.raw_text,
        job_description=evaluation.job_description,
        evaluation_data={
            "archetype": evaluation.archetype,
            "global_score": float(evaluation.global_score) if evaluation.global_score else 0,
            "block_e": evaluation.personalization_plan,
            "block_b": {"gaps": evaluation.gaps}
        }
    )

    # Save CV
    cv = CVModel(
        user_id=user.id,
        resume_id=resume.id,
        evaluation_id=evaluation.id,
        html_content=result.html_content,
        pdf_path=result.pdf_path,
        job_title=evaluation.role,
        company=evaluation.company,
        ats_score=result.ats_score,
        keyword_matches=result.keyword_matches
    )

    db.add(cv)
    db.commit()
    db.refresh(cv)

    return CVResponse(
        id=str(cv.id),
        html_content=cv.html_content,
        pdf_url=cv.pdf_path,
        ats_score=cv.ats_score,
        keyword_matches=cv.keyword_matches,
        job_title=cv.job_title,
        company=cv.company,
        created_at=cv.created_at.isoformat()
    )


@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get CV details"""

    cv = db.query(CVModel).filter(
        CVModel.id == cv_id,
        CVModel.user_id == user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    return CVResponse(
        id=str(cv.id),
        html_content=cv.html_content,
        pdf_url=cv.pdf_path,
        ats_score=cv.ats_score or 0,
        keyword_matches=cv.keyword_matches or 0,
        job_title=cv.job_title,
        company=cv.company,
        created_at=cv.created_at.isoformat()
    )


@router.get("/", response_model=List[CVResponse])
async def list_cvs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """List user's CVs"""

    cvs = db.query(CVModel).filter(
        CVModel.user_id == user.id
    ).order_by(CVModel.created_at.desc()).limit(limit).all()

    return [
        CVResponse(
            id=str(cv.id),
            html_content=cv.html_content,
            pdf_url=cv.pdf_path,
            ats_score=cv.ats_score or 0,
            keyword_matches=cv.keyword_matches or 0,
            job_title=cv.job_title,
            company=cv.company,
            created_at=cv.created_at.isoformat()
        )
        for cv in cvs
    ]


@router.get("/{cv_id}/download")
async def download_cv(
    cv_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download CV PDF"""

    cv = db.query(CVModel).filter(
        CVModel.id == cv_id,
        CVModel.user_id == user.id
    ).first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    if not cv.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not generated yet")

    from fastapi.responses import FileResponse
    return FileResponse(
        cv.pdf_path,
        media_type="application/pdf",
        filename=f"{cv.job_title.replace(' ', '_')}_CV.pdf"
    )
