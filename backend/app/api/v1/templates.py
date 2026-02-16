"""
Templates API Routes
REST endpoints for architecture template management
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.core.security import get_current_user_id, get_optional_current_user_id
from app.templates.aws_patterns import pattern_library
from app.models.architecture_models import ComplexityLevel

logger = get_logger(__name__)
router = APIRouter()


@router.get("/", response_model=Dict[str, Any])
async def list_templates(
    category: Optional[str] = None,
    complexity: Optional[ComplexityLevel] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List available architecture templates"""
    try:
        all_patterns = pattern_library.get_all_patterns()
        
        # Apply filters
        filtered_patterns = all_patterns
        
        if category:
            filtered_patterns = [
                p for p in filtered_patterns
                if category.lower() in p.get("name", "").lower() or 
                   any(category.lower() in uc.lower() for uc in p.get("use_cases", []))
            ]
        
        if complexity:
            filtered_patterns = pattern_library.get_patterns_by_complexity(complexity.value)
        
        # Apply pagination
        total = len(filtered_patterns)
        templates = filtered_patterns[offset:offset + limit]
        
        # Format for API response
        formatted_templates = []
        for template in templates:
            formatted_templates.append({
                "id": template["name"].lower().replace(" ", "_"),
                "name": template["name"],
                "description": template["description"],
                "use_cases": template["use_cases"],
                "complexity_level": template["complexity_level"],
                "estimated_cost_range": template["estimated_monthly_cost_range"],
                "components_count": len(template["components"]),
                "deployment_model": template["deployment_model"]
            })
        
        return {
            "success": True,
            "templates": formatted_templates,
            "total": total,
            "limit": limit,
            "offset": offset,
            "filters_applied": {
                "category": category,
                "complexity": complexity.value if complexity else None
            }
        }
        
    except Exception as e:
        logger.error("Failed to list templates", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list templates"
        )


@router.get("/{template_id}", response_model=Dict[str, Any])
async def get_template(template_id: str):
    """Get detailed template information"""
    try:
        all_patterns = pattern_library.get_all_patterns()
        
        # Find template by ID
        template = None
        for pattern in all_patterns:
            if pattern["name"].lower().replace(" ", "_") == template_id:
                template = pattern
                break
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Get additional recommendations
        security_recommendations = pattern_library.get_security_recommendations(template["name"])
        monitoring_recommendations = pattern_library.get_monitoring_recommendations(template["name"])
        
        detailed_template = {
            "id": template_id,
            "name": template["name"],
            "description": template["description"],
            "use_cases": template["use_cases"],
            "complexity_level": template["complexity_level"],
            "estimated_cost_range": template["estimated_monthly_cost_range"],
            "deployment_model": template["deployment_model"],
            "components": template["components"],
            "connections": template["connections"],
            "recommendations": {
                "security": security_recommendations,
                "monitoring": monitoring_recommendations
            }
        }
        
        return {
            "success": True,
            "template": detailed_template
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get template", template_id=template_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


@router.post("/{template_id}/instantiate")
async def instantiate_template(
    template_id: str,
    customizations: Optional[Dict[str, Any]] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Create architecture from template with customizations"""
    try:
        # Get template
        all_patterns = pattern_library.get_all_patterns()
        template = None
        
        for pattern in all_patterns:
            if pattern["name"].lower().replace(" ", "_") == template_id:
                template = pattern
                break
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Apply customizations if provided
        customized_template = template.copy()
        if customizations:
            # Apply customizations to components, sizing, etc.
            if "instance_types" in customizations:
                for component in customized_template["components"]:
                    if "instance_type" in component.get("configuration", {}):
                        component["configuration"]["instance_type"] = customizations["instance_types"].get(
                            component["type"], component["configuration"]["instance_type"]
                        )
        
        # Create architecture from template
        from app.models.architecture_models import SystemArchitecture, ArchitectureComponent, ServiceType, DeploymentModel
        from uuid import uuid4
        
        components = []
        for comp in customized_template["components"]:
            component = ArchitectureComponent(
                name=comp["name"],
                service_type=getattr(ServiceType, comp["type"].upper(), ServiceType.EC2),
                configuration=comp["configuration"]
            )
            components.append(component)
        
        architecture = SystemArchitecture(
            name=f"{template['name']} Instance",
            components=components,
            connections=template["connections"],
            deployment_model=getattr(DeploymentModel, template["deployment_model"].upper(), DeploymentModel.AUTO_SCALING)
        )
        
        logger.info("Template instantiated",
                   template_id=template_id,
                   user_id=user_id,
                   architecture_id=architecture.id)
        
        return {
            "success": True,
            "architecture": architecture.model_dump(),
            "template_used": template_id,
            "customizations_applied": bool(customizations)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to instantiate template",
                    template_id=template_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to instantiate template"
        )


@router.get("/search/by-use-case")
async def search_templates_by_use_case(
    use_case: str = Query(..., description="Use case to search for"),
    limit: int = Query(10, ge=1, le=50)
):
    """Search templates by use case"""
    try:
        matching_patterns = pattern_library.get_pattern_by_use_case(use_case)
        
        # Limit results
        limited_patterns = matching_patterns[:limit]
        
        formatted_results = []
        for pattern in limited_patterns:
            formatted_results.append({
                "id": pattern["name"].lower().replace(" ", "_"),
                "name": pattern["name"],
                "description": pattern["description"],
                "relevance_score": 1.0,  # In production, calculate actual relevance
                "matching_use_cases": [
                    uc for uc in pattern["use_cases"]
                    if use_case.lower() in uc.lower() or uc.lower() in use_case.lower()
                ]
            })
        
        return {
            "success": True,
            "query": use_case,
            "results": formatted_results,
            "total_found": len(matching_patterns)
        }
        
    except Exception as e:
        logger.error("Template search failed", use_case=use_case, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Template search failed"
        )


@router.get("/categories")
async def get_template_categories():
    """Get list of template categories"""
    try:
        all_patterns = pattern_library.get_all_patterns()
        
        categories = {}
        for pattern in all_patterns:
            # Extract category from pattern name or use cases
            category = "general"
            name_lower = pattern["name"].lower()
            
            if "web" in name_lower or "application" in name_lower:
                category = "web_applications"
            elif "serverless" in name_lower:
                category = "serverless"
            elif "microservices" in name_lower:
                category = "microservices"
            elif "data" in name_lower:
                category = "data_processing"
            elif "real" in name_lower or "time" in name_lower:
                category = "real_time"
            elif "machine" in name_lower or "ml" in name_lower:
                category = "machine_learning"
            elif "static" in name_lower:
                category = "static_sites"
            
            if category not in categories:
                categories[category] = {
                    "name": category.replace("_", " ").title(),
                    "count": 0,
                    "templates": []
                }
            
            categories[category]["count"] += 1
            categories[category]["templates"].append({
                "id": pattern["name"].lower().replace(" ", "_"),
                "name": pattern["name"],
                "complexity": pattern["complexity_level"]
            })
        
        return {
            "success": True,
            "categories": categories
        }
        
    except Exception as e:
        logger.error("Failed to get template categories", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template categories"
        )


@router.get("/{template_id}/cost-estimate")
async def get_template_cost_estimate(
    template_id: str,
    region: str = Query("us-east-1", description="AWS region for pricing"),
    usage_level: str = Query("medium", description="Usage level: low, medium, high")
):
    """Get cost estimate for template"""
    try:
        all_patterns = pattern_library.get_all_patterns()
        template = None
        
        for pattern in all_patterns:
            if pattern["name"].lower().replace(" ", "_") == template_id:
                template = pattern
                break
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Parse existing cost range
        cost_range = template["estimated_monthly_cost_range"]
        
        # Extract numbers from range (e.g., "$200-800" -> [200, 800])
        import re
        numbers = re.findall(r'\d+', cost_range)
        
        if len(numbers) >= 2:
            min_cost = float(numbers[0])
            max_cost = float(numbers[1])
        else:
            min_cost = 100.0
            max_cost = 500.0
        
        # Adjust based on usage level
        usage_multipliers = {
            "low": 0.7,
            "medium": 1.0,
            "high": 1.5
        }
        
        multiplier = usage_multipliers.get(usage_level, 1.0)
        
        estimated_cost = {
            "template_id": template_id,
            "region": region,
            "usage_level": usage_level,
            "monthly_cost_range": {
                "min": round(min_cost * multiplier, 2),
                "max": round(max_cost * multiplier, 2),
                "currency": "USD"
            },
            "cost_breakdown": [
                {"category": "Compute", "percentage": 60, "estimated_amount": round(max_cost * multiplier * 0.6, 2)},
                {"category": "Storage", "percentage": 20, "estimated_amount": round(max_cost * multiplier * 0.2, 2)},
                {"category": "Network", "percentage": 15, "estimated_amount": round(max_cost * multiplier * 0.15, 2)},
                {"category": "Other", "percentage": 5, "estimated_amount": round(max_cost * multiplier * 0.05, 2)}
            ],
            "optimization_potential": "20-30% with Reserved Instances and right-sizing"
        }
        
        return {
            "success": True,
            "cost_estimate": estimated_cost
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get template cost estimate",
                    template_id=template_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template cost estimate"
        )
