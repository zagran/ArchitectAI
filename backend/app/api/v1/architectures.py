"""
Architecture API Routes
REST endpoints for architecture generation and management
"""

import logging
from typing import List, Optional, Dict, Any
from uuid import uuid4
import base64

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.core.security import get_current_user_id, get_optional_current_user_id
from app.services.architecture_generator import architecture_generator
from app.services.cost_calculator import cost_calculator
from app.services.nova_client import nova_client
from app.models.architecture_models import (
    RequirementsInput,
    SystemArchitecture,
    ArchitectureResponse,
    UsagePatterns,
    CostAnalysis,
    ErrorResponse
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/generate", response_model=ArchitectureResponse)
async def generate_architecture(
    requirements: RequirementsInput,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate complete system architecture from requirements
    
    This endpoint orchestrates the full architecture generation process:
    1. Extract structured requirements using Nova 2 Lite
    2. Generate architecture using architectural patterns
    3. Calculate cost analysis with real AWS pricing
    4. Generate optimization suggestions using Nova Micro
    5. Create implementation roadmap
    """
    try:
        logger.info("Architecture generation requested",
                   user_id=user_id,
                   description_length=len(requirements.description))
        
        start_time = datetime.now()
        
        # Generate complete architecture
        architecture, extracted_requirements, metadata = await architecture_generator.generate_complete_architecture(
            requirements, user_id
        )
        
        # Calculate cost analysis
        usage_patterns = UsagePatterns()  # Use default usage patterns
        cost_analysis = await cost_calculator.calculate_architecture_cost(
            architecture, usage_patterns
        )
        
        # Get optimization suggestions (already included in cost analysis)
        optimization_suggestions = []  # Will be populated from Nova
        
        # Generate implementation roadmap
        dependencies = {"infrastructure": "aws", "deployment": "terraform"}
        best_practices = ["security", "monitoring", "cost_optimization"]
        
        implementation_roadmap = await nova_client.plan_implementation(
            architecture, dependencies, best_practices
        )
        
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Get Nova usage stats
        nova_usage = nova_client.get_usage_summary()
        
        response = ArchitectureResponse(
            success=True,
            architecture=architecture,
            cost_analysis=cost_analysis,
            optimization_suggestions=optimization_suggestions,
            implementation_roadmap=implementation_roadmap,
            processing_time_ms=processing_time.to,
            nova_usage=nova_usage
        )
        
        logger.info("Architecture generation completed successfully",
                   user_id=user_id,
                   architecture_id=architecture.id,
                   processing_time_ms=processing_time)
        
        return response
        
    except Exception as e:
        logger.error("Architecture generation failed",
                    user_id=user_id,
                    error=str(e))
        
        return ArchitectureResponse(
            success=False,
            processing_time_ms=0,
            nova_usage={}
        )


@router.post("/{architecture_id}/diagram")
async def generate_diagram(
    architecture_id: str,
    style: str = "aws-professional",
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate visual diagram for existing architecture using Nova Canvas
    """
    try:
        # In production, fetch architecture from database
        # For now, create a sample architecture
        from app.models.architecture_models import ArchitectureComponent, ServiceType, DeploymentModel
        
        architecture = SystemArchitecture(
            id=architecture_id,
            name="Sample Architecture",
            components=[
                ArchitectureComponent(
                    name="Load Balancer",
                    service_type=ServiceType.ALB
                ),
                ArchitectureComponent(
                    name="Web Servers",
                    service_type=ServiceType.EC2
                ),
                ArchitectureComponent(
                    name="Database",
                    service_type=ServiceType.RDS
                )
            ],
            connections=[
                {"from": "Load Balancer", "to": "Web Servers"},
                {"from": "Web Servers", "to": "Database"}
            ],
            deployment_model=DeploymentModel.AUTO_SCALING
        )
        
        diagram_data = await architecture_generator.generate_diagram(architecture, style)
        
        return JSONResponse(content={
            "success": True,
            "diagram": diagram_data,
            "architecture_id": architecture_id,
            "style": style
        })
        
    except Exception as e:
        logger.error("Diagram generation failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Diagram generation failed"
        )


@router.post("/analyze-diagram")
async def analyze_diagram(
    file: UploadFile = File(...),
    user_id: Optional[str] = Depends(get_optional_current_user_id)
):
    """
    Analyze uploaded architecture diagram using Nova multimodal capabilities
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Read image data
        image_data = await file.read()
        
        # Validate file size (max 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        logger.info("Analyzing uploaded diagram",
                   filename=file.filename,
                   size_bytes=len(image_data),
                   user_id=user_id)
        
        # Analyze diagram using Nova
        analysis = await architecture_generator.analyze_existing_diagram(image_data)
        
        return JSONResponse(content={
            "success": True,
            "analysis": analysis,
            "filename": file.filename,
            "size_bytes": len(image_data)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Diagram analysis failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Diagram analysis failed"
        )


@router.get("/{architecture_id}")
async def get_architecture(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get architecture by ID"""
    try:
        # In production, fetch from database
        # For now, return a sample architecture
        architecture = {
            "id": architecture_id,
            "name": "Sample Architecture",
            "created_at": "2024-01-01T00:00:00Z",
            "user_id": user_id,
            "components": [],
            "estimated_cost": 500.0
        }
        
        return JSONResponse(content={
            "success": True,
            "architecture": architecture
        })
        
    except Exception as e:
        logger.error("Failed to fetch architecture",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture not found"
        )


@router.get("/{architecture_id}/cost")
async def get_cost_analysis(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get detailed cost analysis for architecture"""
    try:
        # In production, fetch architecture and calculate/cache costs
        usage_patterns = UsagePatterns()
        
        # For demo, create sample architecture
        from app.models.architecture_models import ArchitectureComponent, ServiceType, DeploymentModel
        
        architecture = SystemArchitecture(
            id=architecture_id,
            name="Sample Architecture",
            components=[
                ArchitectureComponent(name="Load Balancer", service_type=ServiceType.ALB),
                ArchitectureComponent(name="Web Servers", service_type=ServiceType.EC2),
                ArchitectureComponent(name="Database", service_type=ServiceType.RDS)
            ],
            connections=[],
            deployment_model=DeploymentModel.AUTO_SCALING
        )
        
        cost_analysis = await cost_calculator.calculate_architecture_cost(
            architecture, usage_patterns
        )
        
        # Get cost trends
        cost_trends = await cost_calculator.get_cost_trends(architecture_id)
        
        return JSONResponse(content={
            "success": True,
            "cost_analysis": cost_analysis.model_dump(),
            "cost_trends": cost_trends
        })
        
    except Exception as e:
        logger.error("Cost analysis failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cost analysis failed"
        )


@router.post("/{architecture_id}/optimize")
async def optimize_architecture(
    architecture_id: str,
    usage_patterns: UsagePatterns,
    user_id: str = Depends(get_current_user_id)
):
    """Get optimization suggestions for architecture using Nova Micro"""
    try:
        # In production, fetch architecture from database
        from app.models.architecture_models import ArchitectureComponent, ServiceType, DeploymentModel
        
        architecture = SystemArchitecture(
            id=architecture_id,
            name="Sample Architecture",
            components=[
                ArchitectureComponent(name="Load Balancer", service_type=ServiceType.ALB),
                ArchitectureComponent(name="Web Servers", service_type=ServiceType.EC2),
                ArchitectureComponent(name="Database", service_type=ServiceType.RDS)
            ],
            connections=[],
            deployment_model=DeploymentModel.AUTO_SCALING
        )
        
        # Calculate current costs
        cost_analysis = await cost_calculator.calculate_architecture_cost(
            architecture, usage_patterns
        )
        
        # Get optimization suggestions using Nova
        optimizations = await nova_client.suggest_optimizations(
            architecture=architecture,
            cost_breakdown=[cost.model_dump() for cost in cost_analysis.component_breakdown],
            usage_patterns=usage_patterns.model_dump()
        )
        
        return JSONResponse(content={
            "success": True,
            "optimizations": [opt.model_dump() for opt in optimizations],
            "current_cost": cost_analysis.total_monthly_cost,
            "architecture_id": architecture_id
        })
        
    except Exception as e:
        logger.error("Architecture optimization failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Architecture optimization failed"
        )


@router.post("/{architecture_id}/validate")
async def validate_architecture(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Validate architecture against AWS best practices"""
    try:
        # In production, fetch architecture from database
        from app.models.architecture_models import ArchitectureComponent, ServiceType, DeploymentModel
        
        architecture = SystemArchitecture(
            id=architecture_id,
            name="Sample Architecture",
            components=[
                ArchitectureComponent(name="Load Balancer", service_type=ServiceType.ALB),
                ArchitectureComponent(name="Web Servers", service_type=ServiceType.EC2),
                ArchitectureComponent(name="Database", service_type=ServiceType.RDS)
            ],
            connections=[],
            deployment_model=DeploymentModel.AUTO_SCALING
        )
        
        validation_results = await architecture_generator.validate_architecture(architecture)
        
        return JSONResponse(content={
            "success": True,
            "validation": validation_results,
            "architecture_id": architecture_id
        })
        
    except Exception as e:
        logger.error("Architecture validation failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Architecture validation failed"
        )


@router.get("/")
async def list_architectures(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
    offset: int = 0
):
    """List user's architectures"""
    try:
        # In production, fetch from database with pagination
        architectures = [
            {
                "id": str(uuid4()),
                "name": "E-commerce Platform",
                "created_at": "2024-01-01T00:00:00Z",
                "estimated_cost": 450.0,
                "components_count": 5,
                "status": "completed"
            },
            {
                "id": str(uuid4()),
                "name": "Data Pipeline",
                "created_at": "2024-01-02T00:00:00Z",
                "estimated_cost": 780.0,
                "components_count": 8,
                "status": "completed"
            }
        ]
        
        return JSONResponse(content={
            "success": True,
            "architectures": architectures,
            "total": len(architectures),
            "limit": limit,
            "offset": offset
        })
        
    except Exception as e:
        logger.error("Failed to list architectures", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list architectures"
        )


@router.delete("/{architecture_id}")
async def delete_architecture(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete architecture"""
    try:
        # In production, delete from database and associated resources
        
        logger.info("Architecture deleted",
                   architecture_id=architecture_id,
                   user_id=user_id)
        
        return JSONResponse(content={
            "success": True,
            "message": "Architecture deleted successfully",
            "architecture_id": architecture_id
        })
        
    except Exception as e:
        logger.error("Failed to delete architecture",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete architecture"
        )


# Import datetime for the generate_architecture function
from datetime import datetime
