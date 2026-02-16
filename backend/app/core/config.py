"""
Application Configuration
Centralized configuration management using Pydantic Settings
"""

import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with validation and environment variable support"""
    
    # Application Information
    APP_NAME: str = Field(default="ArchitectAI", description="Application name")
    VERSION: str = Field(default="1.0.0", description="Application version")
    ENVIRONMENT: str = Field(default="development", description="Environment (development/staging/production)")
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    WORKERS: int = Field(default=1, description="Number of worker processes")
    
    # AWS Configuration
    AWS_REGION: str = Field(default="us-east-1", description="AWS region")
    AWS_ACCESS_KEY_ID: str = Field(default="", description="AWS access key ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", description="AWS secret access key")
    NOVA_MODEL_REGION: str = Field(default="us-east-1", description="Nova models region")
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/architectai",
        description="Database connection URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, description="Database max overflow connections")
    DATABASE_ECHO: bool = Field(default=False, description="Enable SQL query logging")
    
    # Redis Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379", description="Redis connection URL")
    REDIS_MAX_CONNECTIONS: int = Field(default=10, description="Redis max connections")
    CACHE_TTL: int = Field(default=3600, description="Default cache TTL in seconds")
    
    # Security Configuration
    JWT_SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT secret key",
        min_length=32
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_EXPIRATION_HOURS: int = Field(default=24, description="JWT token expiration in hours")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origins"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "*"],
        description="Allowed hosts for TrustedHost middleware"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, description="API rate limit per minute")
    RATE_LIMIT_BURST: int = Field(default=10, description="Rate limit burst capacity")
    
    # Nova Configuration
    NOVA_DEFAULT_MAX_TOKENS: int = Field(default=2000, description="Default max tokens for Nova")
    NOVA_DEFAULT_TEMPERATURE: float = Field(default=0.3, description="Default temperature for Nova")
    NOVA_TIMEOUT_SECONDS: int = Field(default=60, description="Nova API timeout in seconds")
    NOVA_RETRY_ATTEMPTS: int = Field(default=3, description="Nova API retry attempts")
    
    # Cost Analysis Configuration
    AWS_PRICING_API_REGION: str = Field(default="us-east-1", description="AWS Pricing API region")
    COST_CALCULATION_CACHE_TTL: int = Field(default=1800, description="Cost calculation cache TTL")
    
    # File Storage Configuration
    S3_BUCKET_NAME: Optional[str] = Field(default=None, description="S3 bucket for file storage")
    S3_REGION: str = Field(default="us-east-1", description="S3 region")
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, description="Maximum file upload size in MB")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg", "svg"],
        description="Allowed file types for upload"
    )
    
    # Monitoring and Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format"
    )
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")
    
    # Performance Configuration
    REQUEST_TIMEOUT_SECONDS: int = Field(default=300, description="Request timeout in seconds")
    ARCHITECTURE_GENERATION_TIMEOUT: int = Field(default=120, description="Architecture generation timeout")
    DIAGRAM_GENERATION_TIMEOUT: int = Field(default=180, description="Diagram generation timeout")
    
    # Email Configuration (Optional)
    SMTP_SERVER: Optional[str] = Field(default=None, description="SMTP server")
    SMTP_PORT: int = Field(default=587, description="SMTP port")
    SMTP_USERNAME: Optional[str] = Field(default=None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP password")
    SMTP_USE_TLS: bool = Field(default=True, description="Use TLS for SMTP")
    
    # Analytics Configuration (Optional)
    GOOGLE_ANALYTICS_ID: Optional[str] = Field(default=None, description="Google Analytics ID")
    MIXPANEL_TOKEN: Optional[str] = Field(default=None, description="Mixpanel token")
    
    # Feature Flags
    ENABLE_COST_ANALYSIS: bool = Field(default=True, description="Enable cost analysis features")
    ENABLE_DIAGRAM_GENERATION: bool = Field(default=True, description="Enable diagram generation")
    ENABLE_IMPLEMENTATION_PLANNING: bool = Field(default=True, description="Enable implementation planning")
    ENABLE_TEMPLATE_LIBRARY: bool = Field(default=True, description="Enable template library")
    ENABLE_USER_REGISTRATION: bool = Field(default=True, description="Enable user registration")
    
    # Development Configuration
    MOCK_NOVA_RESPONSES: bool = Field(default=False, description="Mock Nova API responses for development")
    SEED_SAMPLE_DATA: bool = Field(default=False, description="Seed database with sample data")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"
    
    def get_database_url(self) -> str:
        """Get database URL for SQLAlchemy"""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    def get_sync_database_url(self) -> str:
        """Get synchronous database URL for Alembic"""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT.lower() == "development"
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins with proper formatting"""
        return [origin.rstrip("/") for origin in self.CORS_ORIGINS]


# Create settings instance
settings = Settings()


# Configuration validation
def validate_configuration():
    """Validate critical configuration settings"""
    errors = []
    
    # Check AWS configuration
    if not settings.AWS_ACCESS_KEY_ID:
        errors.append("AWS_ACCESS_KEY_ID is required")
    
    if not settings.AWS_SECRET_ACCESS_KEY:
        errors.append("AWS_SECRET_ACCESS_KEY is required")
    
    # Check database configuration
    if not settings.DATABASE_URL:
        errors.append("DATABASE_URL is required")
    
    # Check JWT secret in production
    if settings.is_production and settings.JWT_SECRET_KEY == "your-secret-key-change-in-production":
        errors.append("JWT_SECRET_KEY must be changed in production")
    
    # Check S3 configuration if file storage is needed
    if settings.S3_BUCKET_NAME and not settings.AWS_ACCESS_KEY_ID:
        errors.append("AWS credentials required for S3 storage")
    
    if errors:
        raise ValueError(f"Configuration errors: {'; '.join(errors)}")


# Validate configuration on import
if not settings.MOCK_NOVA_RESPONSES:
    try:
        validate_configuration()
    except ValueError as e:
        if settings.is_production:
            raise e
        else:
            print(f"Configuration warning: {e}")


# Export settings
__all__ = ["settings", "Settings", "validate_configuration"]
