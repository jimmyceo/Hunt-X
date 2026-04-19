from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pathlib import Path
import sys

sys.path.append('/data/.openclaw/workspace/empire/agents')
from company_config import kimi_query

app = FastAPI(title="CareerPilot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("/data/.openclaw/workspace/empire/careerpilot/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    """Upload and analyze resume with AI"""
    if not file.filename.endswith(('.pdf', '.doc', '.docx', '.txt')):
        raise HTTPException(400, "Only PDF, DOC, DOCX, TXT files allowed")
    
    # Save file
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # TODO: Extract text from PDF/DOC
    # For MVP, assume text extraction works
    
    # AI Analysis
    prompt = """Analyze this resume and extract:
    1. Key skills (technical and soft)
    2. Years of experience
    3. Industry focus
    4. Seniority level
    5. Suggested job titles to target
    
    Return as JSON."""
    
    analysis = kimi_query(prompt, system="You are an expert resume analyst and career coach.")
    
    return {
        "status": "success",
        "filename": file.filename,
        "analysis": analysis,
        "file_path": str(file_path)
    }

@app.post("/api/generate-cv")
async def generate_cv(resume_text: str, job_description: str):
    """Generate tailored CV for specific job"""
    
    prompt = f"""Given this resume:
    {resume_text}
    
    And this job description:
    {job_description}
    
    Generate an ATS-optimized CV that:
    1. Matches keywords from job description
    2. Highlights relevant experience
    3. Uses professional formatting
    4. Includes quantifiable achievements
    
    Return as HTML formatted CV."""
    
    cv_html = kimi_query(prompt, system="You are an expert CV writer specializing in ATS-optimized resumes.")
    
    return {
        "status": "success",
        "cv_html": cv_html
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
