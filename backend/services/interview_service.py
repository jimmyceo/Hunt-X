"""
Interview preparation service
Ported from career-ops Block F
"""

from typing import List, Dict, Optional
from dataclasses import dataclass

from ai.client import AIClient
from ai.prompts.interview_prep import INTERVIEW_PREP_PROMPT


@dataclass
class STARStory:
    requirement: str
    title: str
    situation: str
    task: str
    action: str
    result: str
    reflection: str
    estimated_duration: str


@dataclass
class RedFlag:
    question: str
    answer: str
    key_message: str


@dataclass
class CaseStudy:
    project: str
    framing: str
    key_points: List[str]
    potential_questions: List[str]


@dataclass
class QuestionToAsk:
    category: str
    question: str
    why_good: str


@dataclass
class TechnicalPrep:
    topics_to_review: List[str]
    practice_resources: List[str]


@dataclass
class InterviewPrepResult:
    star_stories: List[STARStory]
    red_flags: List[RedFlag]
    case_study: CaseStudy
    questions_to_ask: List[QuestionToAsk]
    technical_prep: TechnicalPrep


class InterviewService:
    """
    Service for generating interview preparation.
    Ported from career-ops Block F.
    """

    def __init__(self, ai_client: AIClient):
        self.ai = ai_client

    async def prepare(
        self,
        resume_text: str,
        job_description: str,
        evaluation_data: dict
    ) -> InterviewPrepResult:
        """
        Generate comprehensive interview preparation.

        Args:
            resume_text: Candidate's resume
            job_description: Job description
            evaluation_data: From EvaluationService (contains blocks B & F)

        Returns:
            InterviewPrepResult with STAR stories, red flags, case study, etc.
        """

        # Extract key data
        key_requirements = [
            m.get("requirement", "")
            for m in evaluation_data.get("block_b", {}).get("matches", [])
        ]
        matched_skills = [
            m.get("cv_evidence", "")
            for m in evaluation_data.get("block_b", {}).get("matches", [])
        ]
        gaps = evaluation_data.get("block_b", {}).get("gaps", [])
        archetype = evaluation_data.get("archetype", "")

        # Build prompt
        prompt = INTERVIEW_PREP_PROMPT.format(
            cv_text=resume_text[:4000],
            job_description=job_description[:3000],
            archetype=archetype,
            key_requirements=key_requirements[:8],  # Top 8
            matched_skills=matched_skills[:5],  # Top 5
            gaps=[g.get("skill", "") for g in gaps[:3]]  # Top 3 gaps
        )

        # Generate
        response = await self.ai.generate_json(prompt)

        return self._parse_interview_prep(response)

    def _parse_interview_prep(self, response: dict) -> InterviewPrepResult:
        """Parse JSON response into InterviewPrepResult"""

        # Parse STAR stories
        star_stories = []
        for story_data in response.get("star_stories", []):
            story = STARStory(
                requirement=story_data.get("requirement", ""),
                title=story_data.get("title", ""),
                situation=story_data.get("situation", story_data.get("S", "")),
                task=story_data.get("task", story_data.get("T", "")),
                action=story_data.get("action", story_data.get("A", "")),
                result=story_data.get("result", story_data.get("R", "")),
                reflection=story_data.get("reflection", story_data.get("R_plus", "")),
                estimated_duration=story_data.get("estimated_duration", "2 minutes")
            )
            star_stories.append(story)

        # Parse red flags
        red_flags = [
            RedFlag(
                question=rf.get("question", ""),
                answer=rf.get("answer", ""),
                key_message=rf.get("key_message", "")
            )
            for rf in response.get("red_flags", [])
        ]

        # Parse case study
        case_data = response.get("case_study", {})
        case_study = CaseStudy(
            project=case_data.get("project", ""),
            framing=case_data.get("framing", ""),
            key_points=case_data.get("key_points", []),
            potential_questions=case_data.get("potential_questions", [])
        )

        # Parse questions to ask
        questions = [
            QuestionToAsk(
                category=q.get("category", ""),
                question=q.get("question", ""),
                why_good=q.get("why_good", "")
            )
            for q in response.get("questions_to_ask", [])
        ]

        # Parse technical prep
        tech_data = response.get("technical_prep", {})
        technical_prep = TechnicalPrep(
            topics_to_review=tech_data.get("topics_to_review", []),
            practice_resources=tech_data.get("practice_resources", [])
        )

        return InterviewPrepResult(
            star_stories=star_stories,
            red_flags=red_flags,
            case_study=case_study,
            questions_to_ask=questions,
            technical_prep=technical_prep
        )

    def get_story_for_requirement(
        self,
        prep: InterviewPrepResult,
        requirement: str
    ) -> Optional[STARStory]:
        """Get the STAR story for a specific requirement"""
        for story in prep.star_stories:
            if requirement.lower() in story.requirement.lower():
                return story
        return prep.star_stories[0] if prep.star_stories else None
