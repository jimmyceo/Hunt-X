"""
Cover letter API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from services.cover_letter_service import CoverLetterService
from dependencies import get_cover_letter_service, get_current_user, get_db
from models import Resume, Evaluation, CoverLetter as CoverLetterModel
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/cover-letter", tags=["cover-letter"])


class GenerateCoverLetterRequest(BaseModel):
    evaluation_id: str
    hiring_manager_name: Optional[str] = None
    short_version: bool = False


class CoverLetterResponse(BaseModel):
    html_content: str
    pdf_url: Optional[str]
    word_count: int


@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: GenerateCoverLetterRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
    cover_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """Generate tailored cover letter for a job."""
    # Fetch evaluation
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == request.evaluation_id,
        Evaluation.user_id == user.id
    ).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # Fetch resume
    resume = db.query(Resume).filter(
        Resume.id == evaluation.resume_id
    ).first()
    if not resume or not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume not found or empty")

    # Generate cover letter
    cover_letter = await cover_service.generate_cover_letter(
        resume_text=resume.raw_text,
        job_description=evaluation.job_description,
        evaluation_data={
            "archetype": evaluation.archetype,
            "company": evaluation.company,
            "role": evaluation.role
        },
        user_info={
            "name": user.name,
            "email": user.email,
            "phone": user.phone or "",
            "linkedin": user.linkedin_url or "",
            "github": user.github_url or ""
        },
        hiring_manager_name=request.hiring_manager_name,
        short_version=request.short_version
    )

    # Generate PDF
    pdf_path = await cover_service.generate_cover_letter_pdf(
        cover_letter,
        filename=f"cover_letter_{request.evaluation_id}.pdf"
    )

    # Save to DB
    db_cover = CoverLetterModel(
        user_id=user.id,
        resume_id=resume.id,
        evaluation_id=evaluation.id,
        html_content=cover_letter.html_content,
        pdf_path=pdf_path
    )
    db.add(db_cover)
    db.commit()

    return CoverLetterResponse(
        html_content=cover_letter.html_content,
        pdf_url=pdf_path,
        word_count=cover_letter.word_count
    )


@router.get("/list")
async def list_cover_letters(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's cover letters."""
    letters = db.query(CoverLetterModel).filter(
        CoverLetterModel.user_id == user.id
    ).order_by(CoverLetterModel.created_at.desc()).all()
    return [
        {
            "id": str(letter.id),
            "html_content": letter.html_content,
            "pdf_url": letter.pdf_path,
            "created_at": letter.created_at.isoformat()
        }
        for letter in letters
    ]


@router.get("/{cover_id}/download")
async def download_cover_letter(
    cover_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download cover letter as PDF."""
    from fastapi.responses import FileResponse
    letter = db.query(CoverLetterModel).filter(
        CoverLetterModel.id == cover_id,
        CoverLetterModel.user_id == user.id
    ).first()
    if not letter or not letter.pdf_path:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return FileResponse(
        letter.pdf_path,
        media_type="application/pdf",
        filename="cover_letter.pdf"
    )
