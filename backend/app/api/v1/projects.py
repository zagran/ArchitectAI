"""
Projects API Routes
REST endpoints for project management
"""

from typing import List, Optional, Dict, Any
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.core.security import get_current_user_id
from app.models.architecture_models import (
    Project,
    ProjectStatus,
    RequirementsInput,
    ErrorResponse
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/", response_model=Dict[str, Any])
async def create_project(
    name: str,
    description: Optional[str] = None,
    requirements: Optional[RequirementsInput] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new project"""
    try:
        project = Project(
            name=name,
            user_id=user_id,
            description=description,
            requirements=requirements
        )
        
        # In production, save to database
        logger.info("Project created",
                   project_id=project.id,
                   user_id=user_id,
                   name=name)
        
        return {
            "success": True,
            "project": project.model_dump(),
            "message": "Project created successfully"
        }
        
    except Exception as e:
        logger.error("Project creation failed",
                    user_id=user_id,
                    name=name,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Project creation failed"
        )


@router.get("/", response_model=Dict[str, Any])
async def list_projects(
    user_id: str = Depends(get_current_user_id),
    status_filter: Optional[ProjectStatus] = None,
    limit: int = 20,
    offset: int = 0
):
    """List user's projects with optional filtering"""
    try:
        # In production, fetch from database with filtering and pagination
        sample_projects = [
            {
                "id": str(uuid4()),
                "name": "E-commerce Platform",
                "description": "Scalable e-commerce solution for 100K users",
                "status": ProjectStatus.COMPLETED.value,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T12:00:00Z",
                "architectures_count": 3,
                "estimated_cost": 450.0
            },
            {
                "id": str(uuid4()),
                "name": "Data Analytics Pipeline",
                "description": "Real-time data processing and analytics",
                "status": ProjectStatus.IN_PROGRESS.value,
                "created_at": "2024-01-02T00:00:00Z",
                "updated_at": "2024-01-02T15:30:00Z",
                "architectures_count": 1,
                "estimated_cost": 780.0
            },
            {
                "id": str(uuid4()),
                "name": "Mobile App Backend",
                "description": "Serverless backend for mobile application",
                "status": ProjectStatus.DRAFT.value,
                "created_at": "2024-01-03T00:00:00Z",
                "updated_at": "2024-01-03T09:15:00Z",
                "architectures_count": 0,
                "estimated_cost": 0.0
            }
        ]
        
        # Apply status filter if provided
        if status_filter:
            sample_projects = [
                p for p in sample_projects 
                if p["status"] == status_filter.value
            ]
        
        # Apply pagination
        total = len(sample_projects)
        projects = sample_projects[offset:offset + limit]
        
        return {
            "success": True,
            "projects": projects,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
        
    except Exception as e:
        logger.error("Failed to list projects",
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list projects"
        )


@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get project details by ID"""
    try:
        # In production, fetch from database and verify ownership
        project = {
            "id": project_id,
            "name": "E-commerce Platform",
            "description": "Scalable e-commerce solution for 100K users",
            "status": ProjectStatus.COMPLETED.value,
            "user_id": user_id,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T12:00:00Z",
            "requirements": {
                "functional_requirements": [
                    "User registration and authentication",
                    "Product catalog with search",
                    "Shopping cart and checkout",
                    "Payment processing",
                    "Order management"
                ],
                "non_functional_requirements": [
                    "Support 100,000 concurrent users",
                    "99.9% uptime requirement",
                    "Page load times under 2 seconds",
                    "PCI DSS compliance"
                ],
                "constraints": {
                    "budget": "$5000/month",
                    "timeline": "3 months",
                    "cloud_provider": "AWS"
                }
            },
            "architectures": [
                {
                    "id": str(uuid4()),
                    "name": "Production Architecture",
                    "created_at": "2024-01-01T10:00:00Z",
                    "estimated_cost": 450.0,
                    "is_current": True
                },
                {
                    "id": str(uuid4()),
                    "name": "High Availability Variant",
                    "created_at": "2024-01-01T11:00:00Z",
                    "estimated_cost": 680.0,
                    "is_current": False
                }
            ],
            "tags": ["e-commerce", "scalable", "aws"]
        }
        
        return {
            "success": True,
            "project": project
        }
        
    except Exception as e:
        logger.error("Failed to get project",
                    project_id=project_id,
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


@router.put("/{project_id}", response_model=Dict[str, Any])
async def update_project(
    project_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[ProjectStatus] = None,
    requirements: Optional[RequirementsInput] = None,
    tags: Optional[List[str]] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Update project details"""
    try:
        # In production, fetch from database, verify ownership, and update
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if status is not None:
            update_data["status"] = status.value
        if requirements is not None:
            update_data["requirements"] = requirements.model_dump()
        if tags is not None:
            update_data["tags"] = tags
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        logger.info("Project updated",
                   project_id=project_id,
                   user_id=user_id,
                   updates=list(update_data.keys()))
        
        # Return updated project
        updated_project = {
            "id": project_id,
            "name": name or "E-commerce Platform",
            "description": description or "Scalable e-commerce solution",
            "status": status.value if status else ProjectStatus.IN_PROGRESS.value,
            "user_id": user_id,
            "updated_at": update_data["updated_at"]
        }
        
        return {
            "success": True,
            "project": updated_project,
            "message": "Project updated successfully"
        }
        
    except Exception as e:
        logger.error("Failed to update project",
                    project_id=project_id,
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project"
        )


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete project and all associated architectures"""
    try:
        # In production, verify ownership and delete from database
        # Also delete associated architectures, diagrams, and files
        
        logger.info("Project deleted",
                   project_id=project_id,
                   user_id=user_id)
        
        return {
            "success": True,
            "message": "Project deleted successfully",
            "project_id": project_id
        }
        
    except Exception as e:
        logger.error("Failed to delete project",
                    project_id=project_id,
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project"
        )


@router.post("/{project_id}/architectures")
async def add_architecture_to_project(
    project_id: str,
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Add an existing architecture to a project"""
    try:
        # In production, verify ownership of both project and architecture
        # Then create association in database
        
        logger.info("Architecture added to project",
                   project_id=project_id,
                   architecture_id=architecture_id,
                   user_id=user_id)
        
        return {
            "success": True,
            "message": "Architecture added to project",
            "project_id": project_id,
            "architecture_id": architecture_id
        }
        
    except Exception as e:
        logger.error("Failed to add architecture to project",
                    project_id=project_id,
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add architecture to project"
        )


@router.delete("/{project_id}/architectures/{architecture_id}")
async def remove_architecture_from_project(
    project_id: str,
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Remove architecture from project (doesn't delete the architecture)"""
    try:
        # In production, verify ownership and remove association
        
        logger.info("Architecture removed from project",
                   project_id=project_id,
                   architecture_id=architecture_id,
                   user_id=user_id)
        
        return {
            "success": True,
            "message": "Architecture removed from project",
            "project_id": project_id,
            "architecture_id": architecture_id
        }
        
    except Exception as e:
        logger.error("Failed to remove architecture from project",
                    project_id=project_id,
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove architecture from project"
        )


@router.get("/{project_id}/analytics")
async def get_project_analytics(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get analytics and insights for a project"""
    try:
        # In production, calculate analytics from database
        analytics = {
            "project_id": project_id,
            "architectures_count": 3,
            "total_estimated_cost": 1230.0,
            "average_cost_per_architecture": 410.0,
            "cost_trend": "increasing",  # decreasing, stable, increasing
            "most_used_services": [
                {"service": "EC2", "count": 3},
                {"service": "RDS", "count": 2},
                {"service": "ALB", "count": 3},
                {"service": "S3", "count": 2}
            ],
            "complexity_distribution": {
                "simple": 1,
                "intermediate": 2,
                "advanced": 0
            },
            "creation_timeline": [
                {"date": "2024-01-01", "architectures_created": 1},
                {"date": "2024-01-02", "architectures_created": 2}
            ],
            "optimization_potential": {
                "total_savings_percentage": 25.0,
                "estimated_monthly_savings": 307.5
            }
        }
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        logger.error("Failed to get project analytics",
                    project_id=project_id,
                    user_id=user_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get project analytics"
        )


@router.post("/{project_id}/export")
async def export_project(
    project_id: str,
    format: str = "json",  # json, pdf, terraform
    user_id: str = Depends(get_current_user_id)
):
    """Export project data in various formats"""
    try:
        if format not in ["json", "pdf", "terraform"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid export format. Supported: json, pdf, terraform"
            )
        
        # In production, generate export file and return download link
        export_data = {
            "project_id": project_id,
            "export_format": format,
            "generated_at": datetime.now().isoformat(),
            "download_url": f"/api/v1/downloads/project-{project_id}.{format}",
            "expires_at": (datetime.now().timestamp() + 3600)  # 1 hour expiry
        }
        
        logger.info("Project export generated",
                   project_id=project_id,
                   format=format,
                   user_id=user_id)
        
        return {
            "success": True,
            "export": export_data,
            "message": f"Project exported as {format.upper()}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to export project",
                    project_id=project_id,
                    format=format,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export project"
        )
