"""
Resume PDF generation service
Converts uploaded resume to professional PDF
"""

from pathlib import Path
from typing import Optional
import uuid
from dataclasses import dataclass

from ai.client import AIClient
from ai.prompts.resume_pdf import RESUME_PDF_PROMPT, RESUME_PDF_COMPACT_PROMPT
from services.pdf_generator import generate_pdf_from_html


@dataclass
class ResumePDF:
    pdf_path: str
    html_content: str
    pages: int


class ResumePDFService:
    """
    Service for generating professional PDF from uploaded resume.
    Not tailored - just formats existing content beautifully.
    """

    def __init__(self, ai_client: AIClient, output_dir: str = "./uploads/pdfs"):
        self.ai = ai_client
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def generate_resume_pdf(
        self,
        resume_text: str,
        user_info: dict,
        compact: bool = False
    ) -> ResumePDF:
        """
        Generate professional PDF from resume content.

        Args:
            resume_text: The parsed resume content
            user_info: Dict with name, email, phone, location, linkedin, github
            compact: If True, generate 1-page compact version
        """

        # Select prompt
        if compact:
            prompt = RESUME_PDF_COMPACT_PROMPT.format(
                resume_text=resume_text[:5000]
            )
        else:
            prompt = RESUME_PDF_PROMPT.format(
                resume_text=resume_text[:5000],
                full_name=user_info.get('name', ''),
                email=user_info.get('email', ''),
                phone=user_info.get('phone', ''),
                location=user_info.get('location', ''),
                linkedin=user_info.get('linkedin', ''),
                github=user_info.get('github', ''),
                website=user_info.get('website', '')
            )

        # Generate HTML
        html_content = await self.ai.generate(prompt)

        # Save HTML temporarily
        html_filename = f"resume_{uuid.uuid4().hex[:8]}.html"
        html_path = self.output_dir / html_filename
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Convert to PDF
        pdf_filename = f"resume_{uuid.uuid4().hex[:8]}.pdf"
        pdf_path = self.output_dir / pdf_filename

        generate_pdf_from_html(html_content, str(pdf_path))

        # Estimate pages (rough heuristic)
        word_count = len(resume_text.split())
        pages = max(1, word_count // 400)  # ~400 words per page

        # Cleanup HTML
        html_path.unlink(missing_ok=True)

        return ResumePDF(
            pdf_path=str(pdf_path),
            html_content=html_content,
            pages=pages
        )

    async def generate_cv_pdf(
        self,
        cv_html: str,
        filename: Optional[str] = None
    ) -> str:
        """
        Convert generated CV HTML to PDF.
        Used for tailored CVs.
        """

        if not filename:
            filename = f"cv_{uuid.uuid4().hex[:8]}.pdf"

        pdf_path = self.output_dir / filename

        generate_pdf_from_html(cv_html, str(pdf_path))

        return str(pdf_path)

    async def generate_cover_letter_pdf(
        self,
        cover_letter_html: str,
        filename: Optional[str] = None
    ) -> str:
        """
        Convert cover letter HTML to PDF.
        """

        if not filename:
            filename = f"cover_letter_{uuid.uuid4().hex[:8]}.pdf"

        pdf_path = self.output_dir / filename

        generate_pdf_from_html(cover_letter_html, str(pdf_path))

        return str(pdf_path)
