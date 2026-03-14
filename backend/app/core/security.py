"""
Authentication and Security
JWT token handling, password hashing, and security utilities
"""

import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
import bcrypt

from app.core.config import settings
from app.core.logging import get_logger, security_logger

logger = get_logger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT security
security = HTTPBearer()


class SecurityManager:
    """Centralized security management"""
    
    def __init__(self):
        self.pwd_context = pwd_context
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_token_expire_hours = settings.JWT_EXPIRATION_HOURS
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return self.pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            return False
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        try:
            return self.pwd_context.hash(password)
        except Exception as e:
            logger.error(f"Password hashing error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password hashing failed"
            )
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=self.access_token_expire_hours)
        
        to_encode.update({"exp": expire})
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        except Exception as e:
            logger.error(f"Token creation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token creation failed"
            )
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None
                
            return payload
            
        except JWTError as e:
            logger.warning(f"Token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return None
    
    def generate_api_key(self) -> str:
        """Generate secure API key"""
        return secrets.token_urlsafe(32)
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        if len(password) < 4:
            errors.append("Password must be at least 4 characters long")
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "strength": "OK",
            "score": 1,
        }


# Global security manager instance
security_manager = SecurityManager()


# Authentication dependencies
async def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = security_manager.verify_token(token)
        
        if payload is None:
            security_logger.unauthorized_access("token_validation_failed")
            raise credentials_exception
            
        user_id = payload.get("sub")
        if user_id is None:
            security_logger.unauthorized_access("missing_user_id")
            raise credentials_exception
            
        return payload
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        security_logger.unauthorized_access("authentication_error")
        raise credentials_exception


async def get_current_user_id(token_data: Dict[str, Any] = Depends(get_current_user_token)) -> str:
    """Get current user ID from token"""
    return token_data.get("sub")


async def get_optional_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    """Get current user ID if authenticated, otherwise None"""
    if not credentials:
        return None
    
    try:
        payload = security_manager.verify_token(credentials.credentials)
        return payload.get("sub") if payload else None
    except:
        return None


# Role-based access control
class RoleChecker:
    """Role-based access control checker"""
    
    def __init__(self, allowed_roles: list = None):
        self.allowed_roles = allowed_roles or []
    
    def __call__(self, token_data: Dict[str, Any] = Depends(get_current_user_token)):
        user_roles = token_data.get("roles", [])
        
        if not self.allowed_roles:
            return token_data
        
        if not any(role in user_roles for role in self.allowed_roles):
            security_logger.unauthorized_access("insufficient_permissions")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return token_data


# Specific role checkers
require_admin = RoleChecker(["admin"])
require_user = RoleChecker(["user", "admin"])


# Rate limiting utilities
class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int, window_seconds: int) -> bool:
        """Check if request is allowed within rate limit"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)
        
        # Clean old requests
        if key in self.requests:
            self.requests[key] = [req_time for req_time in self.requests[key] if req_time > window_start]
        else:
            self.requests[key] = []
        
        # Check limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True


rate_limiter = RateLimiter()


# API key utilities
class APIKeyManager:
    """API key management"""
    
    def __init__(self):
        self.api_keys = {}  # In production, store in database
    
    def create_api_key(self, user_id: str, name: str = "default") -> str:
        """Create new API key for user"""
        api_key = security_manager.generate_api_key()
        key_data = {
            "user_id": user_id,
            "name": name,
            "created_at": datetime.utcnow(),
            "last_used": None,
            "is_active": True
        }
        self.api_keys[api_key] = key_data
        return api_key
    
    def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate API key and return user data"""
        key_data = self.api_keys.get(api_key)
        if not key_data or not key_data["is_active"]:
            return None
        
        # Update last used
        key_data["last_used"] = datetime.utcnow()
        return key_data
    
    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke API key"""
        if api_key in self.api_keys:
            self.api_keys[api_key]["is_active"] = False
            return True
        return False


api_key_manager = APIKeyManager()


# Security middleware
class SecurityMiddleware:
    """Security middleware for additional protection"""
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


# Input validation and sanitization
class InputValidator:
    """Input validation and sanitization utilities"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """Sanitize string input"""
        if not value:
            return ""
        
        # Remove null bytes and control characters
        sanitized = "".join(char for char in value if ord(char) >= 32 or char in ["\n", "\r", "\t"])
        
        # Trim to max length
        return sanitized[:max_length].strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Basic email validation"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_uuid(uuid_string: str) -> bool:
        """Validate UUID format"""
        import re
        pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return re.match(pattern, uuid_string.lower()) is not None


input_validator = InputValidator()


# Session management
class SessionManager:
    """Session management utilities"""
    
    def __init__(self):
        self.sessions = {}  # In production, use Redis
    
    def create_session(self, user_id: str, expires_in_hours: int = 24) -> str:
        """Create new session"""
        session_id = secrets.token_urlsafe(32)
        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=expires_in_hours),
            "last_activity": datetime.utcnow()
        }
        self.sessions[session_id] = session_data
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate session and return user data"""
        session_data = self.sessions.get(session_id)
        if not session_data:
            return None
        
        # Check expiration
        if datetime.utcnow() > session_data["expires_at"]:
            del self.sessions[session_id]
            return None
        
        # Update last activity
        session_data["last_activity"] = datetime.utcnow()
        return session_data
    
    def invalidate_session(self, session_id: str) -> bool:
        """Invalidate session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False


session_manager = SessionManager()

# Export main components
__all__ = [
    "security_manager",
    "get_current_user_token",
    "get_current_user_id", 
    "get_optional_current_user_id",
    "RoleChecker",
    "require_admin",
    "require_user",
    "rate_limiter",
    "api_key_manager",
    "SecurityMiddleware",
    "input_validator",
    "session_manager"
]
