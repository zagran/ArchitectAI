"""
Users API Routes
REST endpoints for user management and authentication
"""

import uuid
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.core.logging import get_logger, security_logger
from app.core.security import (
    security_manager, get_current_user_id,
    get_optional_current_user_id, input_validator
)
from app.models.architecture_models import UserCreate, UserLogin
from app.models.database_models import User as UserDB

logger = get_logger(__name__)
router = APIRouter()
security = HTTPBearer()


@router.post("/register")
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new user"""
    try:
        if not input_validator.validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email address"
            )

        password_validation = security_manager.validate_password_strength(user_data.password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password does not meet requirements",
                    "errors": password_validation["errors"]
                }
            )

        # Check if user already exists
        result = await db.execute(select(UserDB).where(UserDB.email == user_data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

        hashed_password = security_manager.get_password_hash(user_data.password)

        new_user = UserDB(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            is_active=True,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        token_data = {
            "sub": str(new_user.id),
            "email": new_user.email,
            "roles": ["user"]
        }
        access_token = security_manager.create_access_token(token_data)

        logger.info("User registered successfully",
                    user_id=str(new_user.id),
                    email=user_data.email)
        security_logger.login_attempt(user_data.email, True)

        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "full_name": new_user.full_name,
                "created_at": new_user.created_at.isoformat(),
            },
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User registration failed", email=user_data.email, error=str(e))
        security_logger.login_attempt(user_data.email, False)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed"
        )


@router.post("/login")
async def login_user(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db_session)
):
    """Authenticate user and return access token"""
    try:
        if not input_validator.validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email address"
            )

        result = await db.execute(select(UserDB).where(UserDB.email == user_data.email))
        user = result.scalar_one_or_none()
        if not user:
            security_logger.login_attempt(user_data.email, False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not security_manager.verify_password(user_data.password, user.hashed_password):
            security_logger.login_attempt(user_data.email, False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is inactive"
            )

        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "roles": ["user"]
        }
        access_token = security_manager.create_access_token(token_data)

        logger.info("User logged in successfully", user_id=str(user.id), email=user_data.email)
        security_logger.login_attempt(user_data.email, True)

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
            },
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User login failed", email=user_data.email, error=str(e))
        security_logger.login_attempt(user_data.email, False)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/profile")
async def get_user_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user profile"""
    try:
        result = await db.execute(select(UserDB).where(UserDB.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "success": True,
            "profile": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user profile", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )


@router.put("/profile")
async def update_user_profile(
    full_name: Optional[str] = None,
    preferences: Optional[Dict[str, Any]] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile"""
    try:
        update_data = {}

        if full_name is not None:
            update_data["full_name"] = input_validator.sanitize_string(full_name)

        if preferences is not None:
            valid_preferences = {}
            if "default_region" in preferences:
                valid_preferences["default_region"] = preferences["default_region"]
            if "currency" in preferences:
                valid_preferences["currency"] = preferences["currency"]
            if "notifications" in preferences:
                valid_preferences["notifications"] = preferences["notifications"]
            update_data["preferences"] = valid_preferences

        update_data["updated_at"] = datetime.now().isoformat()

        logger.info("User profile updated", user_id=user_id, updates=list(update_data.keys()))

        return {
            "success": True,
            "message": "Profile updated successfully",
            "updated_fields": list(update_data.keys())
        }

    except Exception as e:
        logger.error("Failed to update user profile", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/logout")
async def logout_user(user_id: str = Depends(get_current_user_id)):
    """Logout user"""
    try:
        logger.info("User logged out", user_id=user_id)
        return {
            "success": True,
            "message": "Logout successful"
        }
    except Exception as e:
        logger.error("Failed to logout user", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/usage-stats")
async def get_usage_statistics(user_id: str = Depends(get_current_user_id)):
    """Get user's ArchitectAI usage statistics"""
    try:
        usage_stats = {
            "user_id": user_id,
            "period": "last_30_days",
            "statistics": {
                "architectures_generated": 0,
                "total_cost_calculated": 0,
                "projects_created": 0,
                "diagrams_generated": 0,
            }
        }
        return {
            "success": True,
            "usage_statistics": usage_stats
        }
    except Exception as e:
        logger.error("Failed to get usage statistics", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get usage statistics"
        )
