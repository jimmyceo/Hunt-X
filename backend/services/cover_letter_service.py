"""
Cover letter generation service
Creates tailored cover letters matching CV design
"""

from typing import Optional
import uuid
from dataclasses import dataclass
from datetime import datetime

from ai.client import AIClient
from ai.prompts.cover_letter import COVER_LETTER_PROMPT, COVER_LETTER_SHORT_PROMPT
from services.resume_pdf_service import ResumePDFService


@dataclass
class CoverLetter:
    html_content: str
    pdf_path: Optional[str] = None
    word_count: int = 0


class CoverLetterService:
    """
    Service for generating tailored cover letters.
    Matches CV design aesthetic.
    """

    def __init__(
        self,
        ai_client: AIClient,
        pdf_service: ResumePDFService
    ):
        self.ai = ai_client
        self.pdf_service = pdf_service

    async def generate_cover_letter(
        self,
        resume_text: str,
        job_description: str,
        evaluation_data: dict,
        user_info: dict,
        hiring_manager_name: Optional[str] = None,
        short_version: bool = False
    ) -> CoverLetter:
        """
        Generate tailored cover letter.

        Args:
            resume_text: Candidate's CV
            job_description: Target job
            evaluation_data: From evaluation service
            user_info: Name, email, etc.
            hiring_manager_name: If known
            short_version: 250 words max if True
        """

        company = evaluation_data.get('company', 'the company')
        job_title = evaluation_data.get('job_title', 'the position')

        # Select proof points from evaluation
        top_skills = evaluation_data.get('top_skills', [])[:3]
        proof_points = self._extract_proof_points(resume_text, top_skills)

        # Build prompt
        if short_version:
            prompt = COVER_LETTER_SHORT_PROMPT.format(
                cv_text=resume_text[:3000],
                job_description=job_description[:2000]
            )
        else:
            prompt = COVER_LETTER_PROMPT.format(
                cv_text=resume_text[:4000],
                job_description=job_description[:3000],
                archetype=evaluation_data.get('archetype', ''),
                top_skills=", ".join(top_skills),
                gaps=", ".join(evaluation_data.get('gaps', [])[:2]),
                company_values=evaluation_data.get('company_values', ''),
                proof_points=", ".join(proof_points),
                full_name=user_info.get('name', ''),
                email=user_info.get('email', ''),
                phone=user_info.get('phone', ''),
                linkedin=user_info.get('linkedin', ''),
                github=user_info.get('github', ''),
                current_date=datetime.now().strftime("%B %d, %Y"),
                company_name=company,
                hiring_manager_name=hiring_manager_name or "Hiring Manager",
                company_address=user_info.get('company_address', company)
            )

        # Generate HTML
        html_content = await self.ai.generate(prompt)

        # Count words
        word_count = len(html_content.split())

        return CoverLetter(
            html_content=html_content,
            word_count=word_count
        )

    async def generate_cover_letter_pdf(
        self,
        cover_letter: CoverLetter,
        filename: Optional[str] = None
    ) -> str:
        """Generate PDF from cover letter"""

        return await self.pdf_service.generate_cover_letter_pdf(
            cover_letter.html_content,
            filename
        )

    def _extract_proof_points(
        self,
        resume_text: str,
        skills: list
    ) -> list:
        """Extract specific metrics and achievements from resume"""

        # Look for patterns like "X by Y%" or "X users/customers"
        import re

        proof_points = []

        # Number patterns
        patterns = [
            r'(\d+[Kk]?)\s+(users?|customers?|artists?|buildings?)',
            r'(\d+%|\d+ percent)',
            r'(reduced|improved|increased|cut).*?(\d+%|\d+\s*ms)',
            r'(sub-\d+s|under\s*\d+\s*(seconds?|minutes?))'
        ]

        for pattern in patterns:
            matches = re.findall(pattern, resume_text, re.IGNORECASE)
            for match in matches[:3]:  # Limit to top 3
                if isinstance(match, tuple):
                    proof_points.append(" ".join(match))
                else:
                    proof_points.append(match)

        return proof_points[:5]  # Return top 5
