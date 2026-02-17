"""
ArchitectAI FastAPI Application
Amazon Nova Hackathon Submission

Main application entry point with routing, middleware, and startup configuration.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import init_db, close_db_connections
from app.services.nova_client import nova_client
from app.api.v1 import architectures, projects, templates, cost_analysis, users
from app.models.architecture_models import ErrorResponse


# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Starting ArchitectAI application...")
    
    # Startup
    try:
        await init_db()
        logger.info("Database initialized")
        
        # Test Nova connection
        health = await nova_client.health_check()
        logger.info(f"Nova health check: {health}")
        
        logger.info("ArchitectAI startup complete!")
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise
    
    # Shutdown
    logger.info("Shutting down ArchitectAI...")
    await close_db_connections()
    logger.info("Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="ArchitectAI API",
    description="AI-Powered System Architecture Generator using Amazon Nova",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_type="HTTPException",
            message=exc.detail
        ).model_dump(mode="json")
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error_type="ValidationError",
            message="Request validation failed",
            details={"errors": exc.errors()}
        ).model_dump(mode="json")
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error_type="InternalServerError",
            message="An unexpected error occurred" if not settings.DEBUG else str(exc)
        ).model_dump(mode="json")
    )


# Include API routers
app.include_router(
    architectures.router,
    prefix="/api/v1/architectures",
    tags=["Architectures"]
)

app.include_router(
    projects.router,
    prefix="/api/v1/projects",
    tags=["Projects"]
)

app.include_router(
    templates.router,
    prefix="/api/v1/templates",
    tags=["Templates"]
)

app.include_router(
    cost_analysis.router,
    prefix="/api/v1/cost",
    tags=["Cost Analysis"]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["Users"]
)


# Root endpoints
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with application information"""
    return {
        "message": "ArchitectAI API - Amazon Nova Hackathon",
        "version": "1.0.0",
        "status": "active",
        "documentation": "/docs",
        "features": [
            "AI-powered architecture generation",
            "Real-time cost analysis", 
            "Implementation roadmaps",
            "Multi-modal input processing"
        ],
        "nova_integration": {
            "nova_lite": "Requirements extraction & architecture reasoning",
            "nova_canvas": "Visual diagram generation",
            "nova_micro": "Cost optimization suggestions",
            "multimodal": "Document & image processing"
        }
    }


@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check Nova connectivity
        nova_health = await nova_client.health_check()
        
        # Check database connectivity
        from app.core.database import get_db
        from sqlalchemy import text
        async with get_db() as db:
            await db.execute(text("SELECT 1"))
            db_healthy = True
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        db_healthy = False
    
    health_status = {
        "status": "healthy" if db_healthy and nova_health.get('nova_lite', False) else "degraded",
        "timestamp": "2026-01-01T00:00:00Z",  # Will be updated with actual timestamp
        "version": "1.0.0",
        "services": {
            "api": True,
            "database": db_healthy,
            "nova_lite": nova_health.get('nova_lite', False),
            "nova_micro": nova_health.get('nova_micro', False),
            "nova_canvas": False  # Canvas requires special testing
        },
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG
    }
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(status_code=status_code, content=health_status)


@app.get("/info", response_model=Dict[str, Any])
async def app_info():
    """Application information and statistics"""
    try:
        usage_stats = nova_client.get_usage_stats()
        total_requests = len(usage_stats)
        successful_requests = sum(1 for stat in usage_stats if stat.success)
        
        return {
            "app_name": settings.APP_NAME,
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
            "features": {
                "architecture_generation": True,
                "cost_analysis": True,
                "diagram_generation": True,
                "implementation_planning": True,
                "multi_modal_input": True
            },
            "statistics": {
                "total_nova_requests": total_requests,
                "successful_requests": successful_requests,
                "success_rate": f"{(successful_requests / max(total_requests, 1)) * 100:.1f}%"
            },
            "supported_models": {
                "nova_lite": "amazon.nova-lite-v1:0",
                "nova_canvas": "amazon.nova-canvas-v1:0", 
                "nova_micro": "amazon.nova-micro-v1:0"
            }
        }
    except Exception as e:
        logger.error(f"Failed to get app info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve application information")


# Development middleware for request logging
if settings.DEBUG:
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all requests in development mode"""
        start_time = asyncio.get_event_loop().time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = asyncio.get_event_loop().time() - start_time
        logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
        
        return response


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )
