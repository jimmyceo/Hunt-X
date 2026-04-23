"""
Ported from career-ops/modes/oferta.md
6-Block A-F Evaluation system
"""

EVALUATION_PROMPT = """You are an expert career coach and AI job search assistant.

## Inputs
CANDIDATE CV:
{cv_text}

JOB DESCRIPTION:
{job_description}

TARGET ARCHETYPES FROM PROFILE:
{target_archetypes}

---

## TASK: Generate Complete 6-Block Evaluation

### BLOCK A — Role Summary

Detect the archetype from the job description. Options:
- AI_PLATFORM_LLMOps: observability, evals, pipelines, monitoring, reliability
- AGENTIC_AUTOMATION: agent, HITL, orchestration, workflow, multi-agent
- TECHNICAL_AI_PM: PRD, roadmap, discovery, stakeholder, product manager
- AI_SOLUTIONS_ARCHITECT: architecture, enterprise, integration, design
- AI_FORWARD_DEPLOYED: client-facing, deploy, prototype, fast delivery, field
- AI_TRANSFORMATION: change management, adoption, enablement, transformation

Extract:
- Archetype detected (primary and secondary if hybrid)
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority level (junior/mid/senior/principal)
- Remote policy (full/hybrid/onsite/optional)
- Team size (if mentioned)
- TL;DR in 1 compelling sentence

### BLOCK B — Match with CV

Create a detailed table mapping EACH requirement from the JD to:
1. Exact CV lines that match
2. Strength rating (1-5)
3. Whether it's a must-have or nice-to-have

Then identify GAPS:
- For each missing requirement:
  a. Is it a hard blocker or nice-to-have?
  b. Can the candidate demonstrate adjacent experience?
  c. Mitigation strategy (specific phrase for cover letter, quick project, etc.)

### BLOCK C — Level & Strategy

1. Detected level in JD vs candidate's natural level
2. Strategy "sell senior without lying":
   - Specific phrases adapted to archetype
   - Concrete achievements to highlight
   - How to position founder experience as advantage
3. "If downleveled" plan: accept with fair comp, negotiate 6-month review

### BLOCK D — Compensation & Market

Research and provide:
- Salary range for this role (Glassdoor, Levels.fyi, market data)
- Company's reputation for compensation
- Demand trend for this role type
- Equity/RSU expectations if applicable
- Benefits standard for this company type

### BLOCK E — Personalization Plan

Top 5 changes to CV for this specific job:
| Section | Current | Proposed Change | Why |
|---------|---------|-----------------|-----|
| Summary | ... | ... | Match keywords |
| Experience 1 | ... | ... | Highlight relevant project |
| etc. | | |

Top 5 changes to LinkedIn profile to maximize match.

### BLOCK F — Interview Plan

Generate 6-8 STAR+R stories mapped to JD requirements:
- Situation
- Task
- Action
- Result
- **Reflection** (what was learned / would do differently)

Include:
- Red flag questions and how to answer them
- 1 case study to present (which project, how to frame)
- Questions to ask the interviewer

---

## OUTPUT FORMAT

Respond with valid JSON only:

{{
  "block_a": {{
    "archetype": "AI_PLATFORM_LLMOps",
    "secondary_archetype": "AGENTIC_AUTOMATION",
    "domain": "platform",
    "function": "build",
    "seniority": "senior",
    "remote_policy": "hybrid",
    "team_size": "5-10",
    "tldr": "Senior AI Platform Engineer building observability infrastructure for LLM systems"
  }},
  "block_b": {{
    "matches": [
      {{
        "requirement": "Python expertise",
        "cv_evidence": "Built 50 AI agents with Python (cv.md line 45)",
        "strength": 5,
        "must_have": true
      }}
    ],
    "gaps": [
      {{
        "skill": "Kubernetes",
        "blocker": false,
        "adjacent_experience": "Docker containerization in Tunexa project",
        "mitigation": "Frame as 'production deployment experience with Docker, K8s-adjacent' and highlight fast learning curve"
      }}
    ]
  }},
  "block_c": {{
    "detected_level": "senior",
    "candidate_level": "senior",
    "positioning_strategy": "...",
    "downlevel_plan": "..."
  }},
  "block_d": {{
    "salary_range": {{"min": 75000, "max": 95000, "currency": "EUR"}},
    "market_data": "...",
    "equity_expectations": "..."
  }},
  "block_e": {{
    "cv_changes": [
      {{"section": "summary", "current": "...", "proposed": "...", "reason": "..."}}
    ],
    "linkedin_changes": [...]
  }},
  "block_f": {{
    "star_stories": [
      {{
        "requisito": "Performance optimization",
        "story": "Tunexa 3D rendering",
        "situation": "50K buildings to render at 60 FPS",
        "task": "Maintain performance with real-time updates",
        "action": "Implemented spatial grid, LOD culling, InstancedMesh",
        "result": "60 FPS sustained, featured in demo",
        "reflection": "Now profile before optimizing; premature optimization is evil"
      }}
    ],
    "red_flags": [...],
    "case_study": "...",
    "questions_to_ask": [...]
  }},
  "global_score": 4.2,
  "recommendation": "Good match, worth applying"
}}
"""

ARCHETYPE_DETECTION_PROMPT = """
Quick archetype detection from job description.

JOB DESCRIPTION: {job_description}

Which archetype is this? Respond with JSON:
{{
  "primary_archetype": "...",
  "secondary_archetype": "...",
  "confidence": 0.85,
  "key_signals": ["signal1", "signal2"]
}}

Archetypes: AI_PLATFORM_LLMOps, AGENTIC_AUTOMATION, TECHNICAL_AI_PM, AI_SOLUTIONS_ARCHITECT, AI_FORWARD_DEPLOYED, AI_TRANSFORMATION
"""
