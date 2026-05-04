"""
Resume PDF generation
Takes uploaded resume, creates professional ATS-optimized PDF
"""

RESUME_PDF_PROMPT = """You are a professional resume formatter. Convert the user's resume into a beautifully formatted, ATS-optimized HTML document.

## Inputs
RESUME CONTENT:
{resume_text}

USER CONTACT INFO:
- Name: {full_name}
- Email: {email}
- Phone: {phone}
- Location: {location}
- LinkedIn: {linkedin}
- GitHub: {github}
- Website: {website}

---

## TASK: Create Professional Resume PDF

### Design Requirements:
1. **Clean, ATS-Friendly Format**
   - Single column (no tables for experience)
   - Standard fonts (Arial, Georgia, Calibri)
   - Clear section headers
   - Proper spacing

2. **Sections** (in order):
   - Name + Contact Info (centered or left)
   - Professional Summary
   - Technical Skills (categorized)
   - Experience (reverse chronological)
   - Projects (if applicable)
   - Education
   - Certifications
   - Languages

3. **Formatting Rules**:
   - Bold for job titles, company names
   - Italic for dates
   - Bullet points for achievements
   - 10-11pt body text, 14-16pt headers
   - Margins: 0.75-1 inch
   - Max 2 pages (preferably 1)

4. **ATS Optimization**:
   - No graphics, photos, charts
   - No headers/footers with contact info
   - Standard section names: "Experience" not "Work History"
   - Dates in consistent format
   - Skills spelled out AND acronym ("Amazon Web Services (AWS)")

5. **Content Polish**:
   - Fix inconsistent spacing
   - Ensure all dates align
   - Capitalize consistently
   - Remove filler words

---

## HTML TEMPLATE

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{full_name} - Resume</title>
  <style>
    @page {{ margin: 0.75in; }}
    * {{ box-sizing: border-box; }}

    body {{
      font-family: 'Arial', sans-serif;
      font-size: 10.5pt;
      line-height: 1.4;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0;
    }}

    .header {{
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #2c5aa0;
      padding-bottom: 10px;
    }}

    .name {{
      font-size: 20pt;
      font-weight: bold;
      color: #2c5aa0;
      margin-bottom: 5px;
    }}

    .contact {{
      font-size: 10pt;
      color: #666;
    }}

    .contact a {{
      color: #2c5aa0;
      text-decoration: none;
    }}

    h2 {{
      font-size: 12pt;
      color: #2c5aa0;
      border-bottom: 1px solid #ccc;
      margin-top: 15px;
      margin-bottom: 8px;
      padding-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }}

    .summary {{
      text-align: justify;
      margin-bottom: 10px;
    }}

    .skills {{
      margin-bottom: 10px;
    }}

    .skill-category {{
      margin-bottom: 5px;
    }}

    .skill-category strong {{
      color: #555;
    }}

    .job {{
      margin-bottom: 12px;
    }}

    .job-header {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }}

    .job-title {{
      font-weight: bold;
      font-size: 11pt;
    }}

    .job-company {{
      font-weight: bold;
    }}

    .job-date {{
      font-style: italic;
      color: #666;
      font-size: 10pt;
    }}

    .job-location {{
      font-size: 9.5pt;
      color: #666;
      margin-bottom: 3px;
    }}

    ul {{
      margin: 5px 0;
      padding-left: 20px;
    }}

    li {{
      margin-bottom: 3px;
    }}

    .education-item {{
      margin-bottom: 8px;
    }}

    .cert-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div class="name">{full_name}</div>
    <div class="contact">
      {location} | {phone} | {email}<br>
      {linkedin} | {github}
    </div>
  </div>

  <h2>Professional Summary</h2>
  <div class="summary">{professional_summary}</div>

  <h2>Technical Skills</h2>
  <div class="skills">
    {skills_section}
  </div>

  <h2>Professional Experience</h2>
  {experience_section}

  <h2>Projects</h2>
  {projects_section}

  <h2>Education</h2>
  {education_section}

  <h2>Certifications</h2>
  <div class="cert-grid">
    {certifications_section}
  </div>

  <h2>Languages</h2>
  {languages_section}
</body>
</html>
```

---

## OUTPUT

Return ONLY the complete HTML. This will be converted to PDF.
"""

RESUME_PDF_COMPACT_PROMPT = """Create compact 1-page resume.

For experienced professionals with lots of content. Focus on most recent/relevant.

Resume: {resume_text}

Generate condensed HTML optimized for 1 page.
"""
