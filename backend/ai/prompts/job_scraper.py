"""
Job scraper prompts for portal scanning
Ported from career-ops scan mode
"""

JOB_ANALYSIS_PROMPT = """Analyze this scraped job posting and extract structured data.

RAW JOB TEXT:
{raw_text}

---

## Extract:

1. **Basic Info**
   - Job title
   - Company name
   - Location (remote/hybrid/onsite)
   - Posting date
   - Application URL

2. **Requirements**
   - Required skills (must-have)
   - Preferred skills (nice-to-have)
   - Years of experience
   - Education requirements

3. **Role Details**
   - Team size
   - Reporting structure
   - Archetype (detect from description)
   - Seniority level

4. **Compensation Signals**
   - Salary mentioned?
   - Equity mentioned?
   - Benefits mentioned?

5. **Red Flags**
   - Vague description
   - Unrealistic requirements
   - Missing key details

6. **Match Score** (if candidate profile provided)
   - Match score 1-5
   - Why matched/not matched

---

Return JSON:
{
  "title": "Senior Backend Engineer",
  "company": "Spotify",
  "location": "Remote (EU)",
  "archetype": "AI_PLATFORM_LLMOps",
  "seniority": "senior",
  "required_skills": ["python", "kubernetes", "..."],
  "preferred_skills": ["go", "..."],
  "salary_mentioned": true,
  "salary_range": "€70-90k",
  "red_flags": [],
  "match_score": 4.2,
  "apply_url": "..."
}
"""

PORTAL_QUERY_GENERATION = """Generate search queries for job portals.

USER PROFILE:
- Target roles: {target_roles}
- Preferred archetypes: {archetypes}
- Location preference: {location}
- Remote policy: {remote_preference}
- Skills: {skills}

Generate optimized queries for:
1. LinkedIn Jobs
2. Indeed
3. Glassdoor
4. AngelList (startups)
5. We Work Remotely
6. Company career pages

Return JSON with queries and boolean operators.
"""

JOB_DEDUPLICATION_PROMPT = """Check if this job is duplicate of existing jobs.

NEW JOB:
{new_job}

EXISTING JOBS (check against):
{existing_jobs}

Compare:
- Same company + similar title?
- Same posting date?
- Same URL or similar?
- Same requirements?

Return: {"is_duplicate": true/false, "match_confidence": 0.95, "matched_job_id": "..."}
"""

QUALITY_SCORE_PROMPT = """Score job posting quality.

JOB TEXT: {job_text}

Score 1-10 on:
- Description clarity
- Requirements specificity
- Compensation transparency
- Company info provided
- Professional presentation

Return: {"score": 7.5, "reasons": ["..."]}
"""
