"""
CV generation service
"""

from typing import Optional, List
import uuid
from dataclasses import dataclass
from pathlib import Path

from ai.client import AIClient
from ai.prompts.cv_generation import CV_GENERATION_PROMPT, KEYWORD_EXTRACTION_PROMPT
from services.resume_pdf_service import ResumePDFService


@dataclass
class CVResult:
    html_content: str
    pdf_path: Optional[str]
    ats_score: float
    keyword_matches: int


class CVService:
    """
    Service for generating ATS-optimized CVs tailored to specific jobs.
    """

    def __init__(self, ai_client: AIClient, pdf_service: ResumePDFService):
        self.ai = ai_client
        self.pdf_service = pdf_service

    async def generate(
        self,
        resume_text: str,
        job_description: str,
        evaluation_data: dict,
        template: Optional[str] = None
    ) -> CVResult:
        """
        Generate tailored CV.

        Args:
            resume_text: Original resume content
            job_description: Job description
            evaluation_data: From EvaluationService
            template: Optional template override

        Returns:
            CVResult with HTML, PDF path, and scores
        """

        # Extract keywords
        keywords = await self._extract_keywords(job_description)

        # Build prompt
        prompt = CV_GENERATION_PROMPT.format(
            cv_text=resume_text[:4000],
            job_description=job_description[:3000],
            archetype=evaluation_data.get("archetype", ""),
            match_score=evaluation_data.get("global_score", 0),
            keywords=", ".join(keywords),
            personalization_plan=json.dumps(evaluation_data.get("block_e", {})),
            gaps=json.dumps(evaluation_data.get("block_b", {}).get("gaps", []))
        )

        # Generate HTML
        html_content = await self.ai.generate(prompt)

        # Calculate ATS score
        ats_score = await self._calculate_ats_score(html_content, job_description)

        # Count keyword matches
        keyword_matches = self._count_keyword_matches(html_content, keywords)

        # Generate PDF
        pdf_path = await self.pdf_service.generate_cv_pdf(
            html_content,
            filename=f"cv_{uuid.uuid4().hex[:8]}.pdf"
        )

        return CVResult(
            html_content=html_content,
            pdf_path=pdf_path,
            ats_score=ats_score,
            keyword_matches=keyword_matches
        )

    async def _extract_keywords(self, job_description: str) -> List[str]:
        """Extract key keywords from JD"""

        prompt = KEYWORD_EXTRACTION_PROMPT.format(
            job_description=job_description[:2000]
        )

        try:
            response = await self.ai.generate_json(prompt)
            return response.get("priority_keywords", [])
        except:
            # Fallback to simple extraction
            return self._simple_keyword_extraction(job_description)

    def _simple_keyword_extraction(self, job_description: str) -> List[str]:
        """Fallback keyword extraction"""
        # Common tech keywords
        tech_keywords = [
            "python", "javascript", "typescript", "react", "node",
            "aws", "azure", "gcp", "docker", "kubernetes",
            "machine learning", "ai", "data science", "sql",
            "fastapi", "django", "flask", "nextjs", "vue"
        ]

        jd_lower = job_description.lower()
        found = [kw for kw in tech_keywords if kw in jd_lower]
        return found[:10]

    async def _calculate_ats_score(
        self,
        cv_html: str,
        job_description: str
    ) -> float:
        """
        Calculate ATS compatibility score.
        Simple heuristic based on keyword presence.
        """

        # Extract keywords from JD
        keywords = self._simple_keyword_extraction(job_description)

        # Count matches in CV
        cv_lower = cv_html.lower()
        matches = sum(1 for kw in keywords if kw in cv_lower)

        # Score: 0-100
        if len(keywords) == 0:
            return 70.0

        score = (matches / len(keywords)) * 100
        return min(100, max(60, score))  # Clamp between 60-100

    def _count_keyword_matches(self, cv_html: str, keywords: List[str]) -> int:
        """Count how many keywords appear in CV"""
        cv_lower = cv_html.lower()
        return sum(1 for kw in keywords if kw.lower() in cv_lower)
