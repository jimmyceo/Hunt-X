"""
Resume Roaster service
Analyzes resumes across 4 dimensions and provides AI feedback.
"""

from typing import List
from dataclasses import dataclass
from ai.client import AIClient


@dataclass
class ScoreItem:
    category: str
    score: int  # 1-10
    label: str
    summary: str


@dataclass
class Suggestion:
    category: str
    severity: str  # high, medium, low
    title: str
    description: str
    example: str


@dataclass
class RoastResult:
    overall_score: int
    overall_label: str
    scores: List[ScoreItem]
    suggestions: List[Suggestion]
    highlights: List[str]
    tone: str


ROAST_PROMPT = """You are a world-class resume reviewer. Analyze the following resume and provide a detailed critique.

TONE: {tone}
- "gentle": Encouraging, supportive language. Frame weaknesses as opportunities. Use phrases like "consider adding" and "you might strengthen this by".
- "direct": Brutally honest, no sugar-coating. Use phrases like "This is weak" and "Fix this immediately".

RESUME:
{resume_text}

Respond ONLY with valid JSON matching this schema:
{{
  "overall_score": 0-10,
  "overall_label": "One-word label like Excellent/Good/Needs Work/Poor",
  "scores": [
    {{
      "category": "ATS",
      "score": 0-10,
      "label": "Brief label",
      "summary": "2-3 sentence analysis of keyword density, formatting compatibility with ATS systems, and section structure"
    }},
    {{
      "category": "Impact",
      "score": 0-10,
      "label": "Brief label",
      "summary": "2-3 sentence analysis of quantifiable achievements, action verbs, and outcome-oriented language"
    }},
    {{
      "category": "Clarity",
      "score": 0-10,
      "label": "Brief label",
      "summary": "2-3 sentence analysis of readability, conciseness, and information hierarchy"
    }},
    {{
      "category": "Formatting",
      "score": 0-10,
      "label": "Brief label",
      "summary": "2-3 sentence analysis of layout consistency, section organization, and visual hierarchy"
    }}
  ],
  "suggestions": [
    {{
      "category": "ATS|Impact|Clarity|Formatting",
      "severity": "high|medium|low",
      "title": "Short action-oriented title",
      "description": "Detailed explanation in the chosen tone",
      "example": "A concrete before/after example"
    }}
  ],
  "highlights": [
    "2-3 things the resume does well, as bullet strings"
  ]
}}

Rules:
- Scores 8-10: Exceptional (rare, top 5%)
- Scores 6-7: Solid with room to improve
- Scores 4-5: Needs significant work
- Scores 1-3: Major issues
- Provide 5-7 specific suggestions
- Every suggestion must have a concrete example showing before/after or specific wording
- Be specific. Never say "improve X" without saying exactly how.
"""


class RoasterService:
    """Service for roasting resumes with AI feedback."""

    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    async def roast(self, resume_text: str, tone: str = "gentle") -> RoastResult:
        """Analyze a resume and return scores + suggestions."""

        prompt = ROAST_PROMPT.format(
            resume_text=resume_text[:6000],
            tone=tone
        )

        response = await self.ai.generate_json(prompt)

        scores = [
            ScoreItem(
                category=s.get("category", ""),
                score=s.get("score", 0),
                label=s.get("label", ""),
                summary=s.get("summary", "")
            )
            for s in response.get("scores", [])
        ]

        suggestions = [
            Suggestion(
                category=s.get("category", ""),
                severity=s.get("severity", "medium"),
                title=s.get("title", ""),
                description=s.get("description", ""),
                example=s.get("example", "")
            )
            for s in response.get("suggestions", [])
        ]

        return RoastResult(
            overall_score=response.get("overall_score", 0),
            overall_label=response.get("overall_label", ""),
            scores=scores,
            suggestions=suggestions,
            highlights=response.get("highlights", []),
            tone=tone
        )
