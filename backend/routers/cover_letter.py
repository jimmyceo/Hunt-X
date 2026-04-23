"""
Cover letter API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from services.cover_letter_service import CoverLetterService
from dependencies import get_cover_letter_service, get_current_user

router = APIRouter(prefix="/api/cover-letter", tags=["cover-letter"])


class GenerateCoverLetterRequest(BaseModel):
    job_id: str
    resume_id: str
    hiring_manager_name: Optional[str] = None
    short_version: bool = False  # 250 words max


class CoverLetterResponse(BaseModel):
    html_content: str
    pdf_url: Optional[str]
    word_count: int


@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: GenerateCoverLetterRequest,
    user=Depends(get_current_user),
    cover_service: CoverLetterService = Depends(get_cover_letter_service)
):
    """
    Generate tailored cover letter for a job.
    Matches CV design aesthetic.
    """

    # Fetch data from DB
    resume_text = "..."  # Fetch from DB
    job_description = "..."  # Fetch from DB
    evaluation_data = {...}  # Fetch from DB

    cover_letter = await cover_service.generate_cover_letter(
        resume_text=resume_text,
        job_description=job_description,
        evaluation_data=evaluation_data,
        user_info={
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'linkedin': user.linkedin,
            'github': user.github
        },
        hiring_manager_name=request.hiring_manager_name,
        short_version=request.short_version
    )

    # Generate PDF
    pdf_path = await cover_service.generate_cover_letter_pdf(
        cover_letter,
        filename=f"cover_letter_{request.job_id}.pdf"
    )

    return CoverLetterResponse(
        html_content=cover_letter.html_content,
        pdf_url=pdf_path,
        word_count=cover_letter.word_count
    )


@router.post("/{cover_id}/download")
async def download_cover_letter(
    cover_id: str,
    user=Depends(get_current_user)
):
    """Download cover letter as PDF"""
    # Implementation
    return {"pdf_url": "..."}
