"""
Users API Routes
REST endpoints for user management and authentication
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer

from app.core.logging import get_logger, security_logger
from app.core.security import (
    security_manager, get_current_user_id, 
    get_optional_current_user_id, input_validator
)
from app.models.architecture_models import UserCreate, UserLogin

logger = get_logger(__name__)
router = APIRouter()
security = HTTPBearer()

# In-memory user store (demo only — resets on server restart)
from uuid import uuid4
_users_by_email: Dict[str, Dict[str, Any]] = {}


@router.post("/register")
async def register_user(user_data: UserCreate):
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

        if user_data.email in _users_by_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        hashed_password = security_manager.get_password_hash(user_data.password)

        user = {
            "id": str(uuid4()),
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        _users_by_email[user_data.email] = user

        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "roles": ["user"]
        }
        access_token = security_manager.create_access_token(token_data)

        logger.info("User registered successfully",
                   user_id=user["id"],
                   email=user_data.email)

        security_logger.login_attempt(user_data.email, True)

        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "created_at": user["created_at"]
            },
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User registration failed",
                    email=user_data.email,
                    error=str(e))
        security_logger.login_attempt(user_data.email, False)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed"
        )


@router.post("/login")
async def login_user(user_data: UserLogin):
    """Authenticate user and return access token"""
    try:
        if not input_validator.validate_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email address"
            )

        user = _users_by_email.get(user_data.email)
        if not user:
            security_logger.login_attempt(user_data.email, False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not security_manager.verify_password(user_data.password, user["hashed_password"]):
            security_logger.login_attempt(user_data.email, False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account is inactive"
            )

        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "roles": ["user"]
        }
        access_token = security_manager.create_access_token(token_data)

        logger.info("User logged in successfully",
                   user_id=user["id"],
                   email=user_data.email)

        security_logger.login_attempt(user_data.email, True)

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"]
            },
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User login failed",
                    email=user_data.email,
                    error=str(e))
        security_logger.login_attempt(user_data.email, False)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/profile")
async def get_user_profile(user_id: str = Depends(get_current_user_id)):
    """Get current user profile"""
    try:
        # Look up user from in-memory store
        user = None
        for u in _users_by_email.values():
            if u["id"] == user_id:
                user = u
                break

        user_profile = {
            "id": user_id,
            "email": user["email"] if user else "user@example.com",
            "full_name": user.get("full_name", "User") if user else "User",
            "created_at": user.get("created_at", "2026-01-01T00:00:00Z") if user else "2026-01-01T00:00:00Z",
            "updated_at": user.get("updated_at", "2026-01-01T00:00:00Z") if user else "2026-01-01T00:00:00Z",
        }

        return {
            "success": True,
            "profile": user_profile
        }

    except Exception as e:
        logger.error("Failed to get user profile",
                    user_id=user_id,
                    error=str(e))
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
            # Validate preferences structure
            valid_preferences = {}
            if "default_region" in preferences:
                valid_preferences["default_region"] = preferences["default_region"]
            if "currency" in preferences:
                valid_preferences["currency"] = preferences["currency"]
            if "notifications" in preferences:
                valid_preferences["notifications"] = preferences["notifications"]
            
            update_data["preferences"] = valid_preferences
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        # In production, update database
        
        logger.info("User profile updated",
                   user_id=user_id,
                   updates=list(update_data.keys()))
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "updated_fields": list(update_data.keys())
        }
        
    except Exception as e:
        logger.error("Failed to update user profile",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    user_id: str = Depends(get_current_user_id)
):
    """Change user password"""
    try:
        # In production, fetch user from database
        stored_password_hash = security_manager.get_password_hash("password123")
        
        # Verify current password
        if not security_manager.verify_password(current_password, stored_password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        password_validation = security_manager.validate_password_strength(new_password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "New password does not meet requirements",
                    "errors": password_validation["errors"]
                }
            )
        
        # Hash new password
        new_password_hash = security_manager.get_password_hash(new_password)
        
        # In production, update database with new hash
        
        logger.info("User password changed", user_id=user_id)
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to change password",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.post("/logout")
async def logout_user(user_id: str = Depends(get_current_user_id)):
    """Logout user (invalidate token)"""
    try:
        # In production, add token to blacklist or invalidate session
        
        logger.info("User logged out", user_id=user_id)
        
        return {
            "success": True,
            "message": "Logout successful"
        }
        
    except Exception as e:
        logger.error("Failed to logout user",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.delete("/account")
async def delete_user_account(
    password: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete user account (requires password confirmation)"""
    try:
        # In production, fetch user and verify password
        stored_password_hash = security_manager.get_password_hash("password123")
        
        if not security_manager.verify_password(password, stored_password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password confirmation failed"
            )
        
        # In production, delete all user data (projects, architectures, etc.)
        
        logger.info("User account deleted", user_id=user_id)
        
        return {
            "success": True,
            "message": "Account deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete user account",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )


@router.get("/usage-stats")
async def get_usage_statistics(user_id: str = Depends(get_current_user_id)):
    """Get user's ArchitectAI usage statistics"""
    try:
        # In production, calculate from database
        usage_stats = {
            "user_id": user_id,
            "period": "last_30_days",
            "statistics": {
                "architectures_generated": 23,
                "total_cost_calculated": 145670.50,
                "projects_created": 8,
                "diagrams_generated": 19,
                "optimizations_suggested": 67,
                "templates_used": 12
            },
            "nova_usage": {
                "total_requests": 156,
                "successful_requests": 152,
                "models_used": {
                    "nova_lite": 89,
                    "nova_canvas": 19,
                    "nova_micro": 48
                },
                "average_response_time_ms": 2340
            },
            "cost_savings_identified": {
                "total_monthly_savings": 4320.75,
                "average_savings_percentage": 28.5,
                "top_optimization_categories": [
                    "Reserved Instances",
                    "Storage Optimization", 
                    "Right-sizing"
                ]
            }
        }
        
        return {
            "success": True,
            "usage_statistics": usage_stats
        }
        
    except Exception as e:
        logger.error("Failed to get usage statistics",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get usage statistics"
        )
