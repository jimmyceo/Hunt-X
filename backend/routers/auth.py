"""
Authentication router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from models import get_db, User
from dependencies import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    tier: str
    jobs_remaining: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=TokenResponse)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user - truncate password to 72 bytes for bcrypt
        password_bytes = user_data.password.encode('utf-8')[:72]
        truncated_password = password_bytes.decode('utf-8', errors='ignore')
        user = User(
            email=user_data.email,
            password_hash=get_password_hash(truncated_password),
            name=user_data.name,
            tier="try",
            jobs_remaining=5  # Free tier gets 5 jobs
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Create token
        token = create_access_token({"sub": str(user.id)})

        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                tier=user.tier,
                jobs_remaining=user.jobs_remaining
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password - truncate to 72 bytes for bcrypt
    password_bytes = credentials.password.encode('utf-8')[:72]
    truncated_password = password_bytes.decode('utf-8', errors='ignore')
    if not verify_password(truncated_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create token
    token = create_access_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            tier=user.tier,
            jobs_remaining=user.jobs_remaining
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        tier=current_user.tier,
        jobs_remaining=current_user.jobs_remaining
    )


@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Refresh access token"""
    token = create_access_token({"sub": str(current_user.id)})
    return {"access_token": token, "token_type": "bearer"}
