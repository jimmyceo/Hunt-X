"""
Profile router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db, User
from models.profile import Profile
from dependencies import get_current_user

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_roles: List[str] = Field(default_factory=list)
    preferred_location: Optional[str] = Field(None, max_length=255)
    min_salary: Optional[int] = Field(None)
    remote_preference: str = Field(default="any")
    primary_resume_id: Optional[str] = Field(None)


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    target_roles: Optional[List[str]] = Field(None)
    preferred_location: Optional[str] = Field(None, max_length=255)
    min_salary: Optional[int] = Field(None)
    remote_preference: Optional[str] = Field(None)
    primary_resume_id: Optional[str] = Field(None)


@router.get("/")
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all profiles for current user"""
    profiles = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .order_by(Profile.is_default.desc(), Profile.created_at.desc())
        .all()
    )
    return {
        "status": "success",
        "profiles": [p.to_dict() for p in profiles]
    }


@router.post("/")
async def create_profile(
    request: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new profile"""
    profile = Profile(
        user_id=current_user.id,
        name=request.name,
        target_roles=request.target_roles,
        preferred_location=request.preferred_location,
        min_salary=request.min_salary,
        remote_preference=request.remote_preference,
        primary_resume_id=request.primary_resume_id,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {
        "status": "success",
        "profile": profile.to_dict()
    }


@router.get("/{profile_id}")
async def get_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "status": "success",
        "profile": profile.to_dict()
    }


@router.put("/{profile_id}")
async def update_profile(
    profile_id: str,
    request: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return {
        "status": "success",
        "profile": profile.to_dict()
    }


@router.delete("/{profile_id}")
async def delete_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a profile"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(profile)
    db.commit()
    return {
        "status": "success",
        "message": "Profile deleted"
    }


@router.post("/{profile_id}/set-default")
async def set_default_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set a profile as the default"""
    profile = db.query(Profile).filter(
        Profile.id == profile_id,
        Profile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Unset all others
    db.query(Profile).filter(
        Profile.user_id == current_user.id,
        Profile.id != profile_id
    ).update({"is_default": 0})

    profile.is_default = 1
    db.commit()
    db.refresh(profile)
    return {
        "status": "success",
        "profile": profile.to_dict()
    }
