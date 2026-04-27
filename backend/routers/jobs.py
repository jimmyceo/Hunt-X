"""
Job scraper API endpoints
Portal scanning and job discovery
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from services.job_scraper_service import (
    JobScraperService,
    UserProfile,
    ScrapedJob
)
from dependencies import get_job_scraper_service, get_current_user, get_db

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class UserProfileRequest(BaseModel):
    target_roles: List[str]
    preferred_archetypes: List[str]
    location: str
    remote_preference: str  # remote, hybrid, onsite, any
    skills: List[str]
    min_salary: Optional[int] = None


class ScrapedJobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    archetype: Optional[str]
    seniority: Optional[str]
    required_skills: List[str]
    salary_range: Optional[str]
    remote_policy: Optional[str]
    match_score: Optional[float]
    quality_score: Optional[float]
    url: str


class JobScanRequest(BaseModel):
    max_results_per_portal: int = 20
    min_match_score: float = 3.0


@router.post("/scan", response_model=List[ScrapedJobResponse])
async def scan_jobs(
    request: JobScanRequest,
    user=Depends(get_current_user),
    job_service: JobScraperService = Depends(get_job_scraper_service)
):
    """
    Scan all job portals and return matching jobs.
    Uses user's profile for targeting.
    """

    # Build user profile from user data
    profile = UserProfile(
        target_roles=user.target_roles or ["Software Engineer"],
        preferred_archetypes=user.preferred_archetypes or [],
        location=user.location or "Remote",
        remote_preference=user.remote_preference or "any",
        skills=user.skills or [],
        min_salary=user.min_salary
    )

    async with job_service as scraper:
        jobs = await scraper.scan_all_portals(
            profile=profile,
            max_results_per_portal=request.max_results_per_portal
        )

    # Filter by match score
    filtered = await job_service.filter_jobs(
        jobs,
        profile,
        request.min_match_score
    )

    return [
        ScrapedJobResponse(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            archetype=job.archetype,
            seniority=job.seniority,
            required_skills=job.required_skills or [],
            salary_range=job.salary_range,
            remote_policy=job.remote_policy,
            match_score=job.match_score,
            quality_score=job.quality_score,
            url=job.url
        )
        for job in filtered[:50]  # Limit results
    ]


@router.post("/analyze")
async def analyze_job(
    job_text: str,
    user=Depends(get_current_user),
    job_service: JobScraperService = Depends(get_job_scraper_service)
):
    """
    Analyze a pasted job description.
    Extracts structured data and calculates match score.
    """

    # Build profile
    profile = UserProfile(
        target_roles=user.target_roles or [],
        preferred_archetypes=user.preferred_archetypes or [],
        location=user.location or "",
        remote_preference=user.remote_preference or "any",
        skills=user.skills or []
    )

    job = await job_service.analyze_job(job_text, profile)

    return ScrapedJobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        location=job.location,
        archetype=job.archetype,
        seniority=job.seniority,
        required_skills=job.required_skills or [],
        salary_range=job.salary_range,
        remote_policy=job.remote_policy,
        match_score=job.match_score,
        quality_score=job.quality_score,
        url=job.url
    )


@router.get("/saved", response_model=List[ScrapedJobResponse])
async def get_saved_jobs(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved/bookmarked jobs"""
    from models import SavedJob
    saved = db.query(SavedJob).filter(SavedJob.user_id == user.id).all()
    return [
        ScrapedJobResponse(
            id=str(s.job_id),
            title=s.title or "",
            company=s.company or "",
            location=s.location or "",
            archetype=s.archetype,
            seniority=s.seniority,
            required_skills=s.required_skills or [],
            salary_range=s.salary_range,
            remote_policy=s.remote_policy,
            match_score=s.match_score,
            quality_score=s.quality_score,
            url=s.url or ""
        )
        for s in saved
    ]


@router.post("/{job_id}/save")
async def save_job(
    job_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a job to user's list"""
    from models import SavedJob
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == user.id,
        SavedJob.job_id == job_id
    ).first()
    if existing:
        return {"status": "already_saved"}
    saved = SavedJob(
        user_id=user.id,
        job_id=job_id
    )
    db.add(saved)
    db.commit()
    return {"status": "saved"}


@router.get("/search")
async def search_jobs(
    query: str = "software engineer",
    location: str = "Remote",
    country: str = "us",
    user=Depends(get_current_user),
    job_service: JobScraperService = Depends(get_job_scraper_service)
):
    """
    Search jobs using JSearch API with region-based routing.
    """
    from services.job_scraper_api import JSearchClient, REGION_CONFIG, ApifyClientWrapper

    # Get region config
    region_data = REGION_CONFIG.get(country.lower(), REGION_CONFIG["us"])

    try:
        # Try primary provider
        if region_data["primary"] == "jsearch":
            client = JSearchClient()
            jobs = await client.search_jobs(
                query=query,
                location=location,
                page=1,
                num_pages=1
            )
        else:
            jobs = []

        # Return simplified results
        return {
            "status": "success",
            "query": query,
            "location": location,
            "country": country,
            "count": len(jobs),
            "jobs": [
                {
                    "id": job.id,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "url": job.url
                }
                for job in jobs[:10]
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "query": query,
            "location": location
        }


@router.get("/search-queries")
async def get_search_queries(
    user=Depends(get_current_user),
    job_service: JobScraperService = Depends(get_job_scraper_service)
):
    """
    Get AI-generated search queries for each portal.
    """

    profile = UserProfile(
        target_roles=user.target_roles or [],
        preferred_archetypes=user.preferred_archetypes or [],
        location=user.location or "",
        remote_preference=user.remote_preference or "any",
        skills=user.skills or []
    )

    queries = await job_service.generate_search_queries(profile)

    return queries
