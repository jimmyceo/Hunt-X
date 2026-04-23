"""
Ported from career-ops CV generation logic
"""

CV_GENERATION_PROMPT = """You are an expert CV writer specializing in ATS-optimized resumes.

## Inputs
CANDIDATE CV (source of truth):
{cv_text}

JOB DESCRIPTION:
{job_description}

EVALUATION DATA:
- Archetype: {archetype}
- Match Score: {match_score}
- Key keywords to include: {keywords}
- Top 5 personalization changes: {personalization_plan}
- Gaps to address: {gaps}

---

## TASK: Generate ATS-Optimized CV

Create a professional CV in clean HTML format that:

1. **Matches Keywords**
   - Include all relevant keywords from JD naturally
   - Match terminology (if JD says "Python" not "py", use "Python")
   - Include both acronyms and full terms ("LLM" and "Large Language Model")

2. **Quantify Achievements**
   - Use specific numbers (50K artists, sub-4s latency, 60 FPS)
   - Format: "Action verb + metric + outcome"
   - Example: "Reduced latency by 82% (2.1s → 380ms)"

3. **ATS Compatibility**
   - No tables, no columns, no fancy formatting
   - Standard section headers: SUMMARY, EXPERIENCE, EDUCATION, SKILLS
   - Bullet points with strong action verbs
   - No em-dashes, smart quotes, or special characters

4. **Tailored for Archetype**
   - If FDE: Emphasize delivery speed and client-facing
   - If SA: Emphasize architecture decisions
   - If PM: Emphasize discovery and metrics
   - If LLMOps: Emphasize evals, metrics, production hardening
   - If Agentic: Emphasize orchestration, error handling
   - If Transformation: Emphasize adoption, change management

5. **Address Gaps Strategically**
   - Frame adjacent experience positively
   - Show learning velocity
   - Include relevant projects that fill gaps

---

## HTML TEMPLATE STRUCTURE

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{name} - CV</title>
  <style>
    body {{ font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }}
    h1 {{ font-size: 24px; margin-bottom: 5px; }}
    .contact {{ font-size: 14px; color: #666; margin-bottom: 20px; }}
    h2 {{ font-size: 18px; border-bottom: 2px solid #333; margin-top: 25px; }}
    .job {{ margin-bottom: 20px; }}
    .job-title {{ font-weight: bold; }}
    .job-meta {{ font-size: 14px; color: #666; }}
    ul {{ margin-top: 5px; }}
    li {{ margin-bottom: 5px; }}
    .skills {{ display: flex; flex-wrap: wrap; gap: 10px; }}
    .skill {{ background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 14px; }}
  </style>
</head>
<body>
  <h1>{full_name}</h1>
  <div class="contact">
    {location} | {email} | {phone} | {linkedin} | {github}
  </div>

  <h2>SUMMARY</h2>
  <p>{tailored_summary}</p>

  <h2>EXPERIENCE</h2>
  {experience_section}

  <h2>PROJECTS</h2>
  {projects_section}

  <h2>EDUCATION</h2>
  {education_section}

  <h2>SKILLS</h2>
  <div class="skills">
    {skills_list}
  </div>
</body>
</html>
```

---

## OUTPUT

Return ONLY the complete HTML. No markdown, no code blocks, just raw HTML.
"""

KEYWORD_EXTRACTION_PROMPT = """
Extract the most important keywords from this job description for ATS optimization.

JOB DESCRIPTION: {job_description}

Return JSON:
{{
  "technical_skills": ["python", "kubernetes", "..."],
  "domain_keywords": ["machine learning", "LLM", "..."],
  "soft_skills": ["leadership", "communication", "..."],
  "tools_platforms": ["aws", "langchain", "..."],
  "certifications": ["aws certified", "..."],
  "priority_keywords": ["top 10 must-have keywords"]
}}
"""
