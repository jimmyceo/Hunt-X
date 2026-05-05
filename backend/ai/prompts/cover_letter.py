"""
Cover letter generation
Same visual design as CV, 1 page max
"""

COVER_LETTER_PROMPT = """You are an expert cover letter writer. Create a compelling, tailored cover letter.

## Inputs
CANDIDATE CV:
{cv_text}

JOB DESCRIPTION:
{job_description}

EVALUATION DATA:
- Archetype: {archetype}
- Top 3 matched skills: {top_skills}
- Key gaps to address: {gaps}
- Company values: {company_values}
- Hiring manager insights: {hiring_manager_notes}

SPECIFIC PROOF POINTS TO HIGHLIGHT:
{proof_points}

---

## TASK: Generate Cover Letter

Structure:
1. **Hook Paragraph** (2-3 sentences)
   - Specific mention of company/role
   - Why THIS role (not generic)
   - Connection to company's mission/work

2. **Match Paragraph** (3-4 sentences)
   - Map 2-3 top requirements to specific CV evidence
   - Quote metrics: "Reduced latency by 82%"
   - Reference projects by name

3. **Value Paragraph** (3-4 sentences)
   - What you bring that's unique
   - Address any gaps as learning opportunities
   - Show you've researched the company

4. **Closing** (2 sentences)
   - Call to action
   - Enthusiasm

Rules:
- 1 page max (400-500 words)
- No clichés: "passionate", "perfect fit", "dream job"
- Specific evidence, not generic claims
- Match company tone (formal vs casual)
- Include case study URL if available

---

## HTML TEMPLATE

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cover Letter - {name}</title>
  <style>
    body {{
      font-family: 'Georgia', serif;
      line-height: 1.6;
      max-width: 700px;
      margin: 40px auto;
      padding: 40px;
      color: #333;
    }}
    .header {{ margin-bottom: 30px; }}
    .date {{ color: #666; margin-bottom: 20px; }}
    .recipient {{ margin-bottom: 20px; }}
    .salutation {{ margin-bottom: 20px; }}
    .paragraph {{ margin-bottom: 20px; text-align: justify; }}
    .closing {{ margin-top: 30px; }}
    .signature {{ margin-top: 50px; }}
  </style>
</head>
<body>
  <div class="header">
    <strong>{full_name}</strong><br>
    {email} | {phone}<br>
    {linkedin} | {github}
  </div>

  <div class="date">{current_date}</div>

  <div class="recipient">
    {hiring_manager_name}<br>
    {company_name}<br>
    {company_address}
  </div>

  <div class="salutation">Dear {hiring_manager_name},</div>

  <div class="paragraph">{paragraph_1}</div>
  <div class="paragraph">{paragraph_2}</div>
  <div class="paragraph">{paragraph_3}</div>

  <div class="closing">{closing_paragraph}</div>

  <div class="signature">
    Sincerely,<br><br>
    {full_name}
  </div>
</body>
</html>
```

Return ONLY the complete HTML.
"""

COVER_LETTER_SHORT_PROMPT = """Quick cover letter (250 words max).

For when word limit is strict. Same structure, more concise.

CV: {cv_text}
JD: {job_description}

Generate compact HTML cover letter.
"""
