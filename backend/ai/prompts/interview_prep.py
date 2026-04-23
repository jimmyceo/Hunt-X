"""
Ported from career-ops Block F: Interview preparation
"""

INTERVIEW_PREP_PROMPT = """You are an expert interview coach. Generate comprehensive interview preparation for this specific job.

## Inputs
CANDIDATE CV:
{cv_text}

JOB DESCRIPTION:
{job_description}

EVALUATION DATA:
- Archetype: {archetype}
- Key Requirements: {key_requirements}
- Matched Skills: {matched_skills}
- Gaps: {gaps}

---

## TASK: Generate Interview Preparation

### 1. STAR+R Stories (6-10 stories)

Map each to a specific requirement from the JD:

For each story:
- **S**ituation: Context (2-3 sentences)
- **T**ask: What needed to be done (1 sentence)
- **A**ction: What YOU did specifically (3-4 sentences, use "I" not "we")
- **R**esult: Quantified outcome (2-3 sentences with metrics)
- **+R** Reflection: What you learned / would do differently (2 sentences)

**Frame based on archetype:**
- FDE: Emphasize speed, client delivery, iteration
- SA: Emphasize architecture decisions, trade-offs
- PM: Emphasize discovery, stakeholder management
- LLMOps: Emphasize metrics, evals, production hardening
- Agentic: Emphasize orchestration, error handling, HITL
- Transformation: Emphasize adoption, change management

### 2. Red Flag Questions

Prepare answers for:
- "Why did you leave your last job?"
- "Tell me about a time you failed"
- "Why should we hire you over someone with more experience?"
- "Where do you see yourself in 5 years?"
- "What's your biggest weakness?"
- "Do you have direct reports?" (if applying to management)
- "Why the career change?" (if pivoting)

### 3. Case Study Recommendation

Recommend ONE project from CV to present:
- Which project
- How to frame it for this role
- 3 key points to emphasize
- Potential questions and answers

### 4. Questions to Ask Them

Generate 5-7 insightful questions:
- Role-specific (day-to-day, team structure)
- Company-specific (strategy, culture, growth)
- Interviewer's experience
- Next steps

### 5. Technical Preparation

Based on JD requirements, suggest:
- Topics to review
- Practice problems (if applicable)
- System design considerations
- Domain-specific prep

---

## OUTPUT FORMAT

Return valid JSON:

{{
  "star_stories": [
    {{
      "requirement": "Performance optimization",
      "title": "Tunexa 3D Performance",
      "situation": "...",
      "task": "...",
      "action": "...",
      "result": "...",
      "reflection": "...",
      "estimated_duration": "2 minutes"
    }}
  ],
  "red_flags": [
    {{
      "question": "Why the career pivot to AI?",
      "answer": "...",
      "key_message": "Self-taught with 50 production agents proves passion"
    }}
  ],
  "case_study": {{
    "project": "FaceSearch",
    "framing": "High-scale real-time system",
    "key_points": ["...", "...", "..."],
    "potential_questions": ["..."]
  }},
  "questions_to_ask": [
    {{
      "category": "Role",
      "question": "...",
      "why_good": "Shows interest in day-to-day"
    }}
  ],
  "technical_prep": {{
    "topics_to_review": ["..."],
    "practice_resources": ["..."]
  }}
}}
"""
