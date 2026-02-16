"""
Cost Analysis API Routes
REST endpoints for cost calculation and optimization
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.core.security import get_current_user_id
from app.services.cost_calculator import cost_calculator
from app.models.architecture_models import UsagePatterns

logger = get_logger(__name__)
router = APIRouter()


@router.post("/calculate")
async def calculate_cost(
    architecture_id: str,
    usage_patterns: UsagePatterns,
    user_id: str = Depends(get_current_user_id)
):
    """Calculate detailed cost analysis for architecture"""
    try:
        # In production, fetch architecture from database
        from app.models.architecture_models import (
            SystemArchitecture, ArchitectureComponent, 
            ServiceType, DeploymentModel
        )
        
        # Create sample architecture for demo
        architecture = SystemArchitecture(
            id=architecture_id,
            name="Sample Architecture",
            components=[
                ArchitectureComponent(
                    name="Application Load Balancer",
                    service_type=ServiceType.ALB,
                    configuration={"scheme": "internet-facing"}
                ),
                ArchitectureComponent(
                    name="Web Servers",
                    service_type=ServiceType.EC2,
                    configuration={
                        "instance_type": "t3.medium",
                        "min_size": 2,
                        "max_size": 10
                    }
                ),
                ArchitectureComponent(
                    name="Database",
                    service_type=ServiceType.RDS,
                    configuration={
                        "instance_class": "db.t3.medium",
                        "engine": "postgres",
                        "storage_gb": 100,
                        "multi_az": True
                    }
                )
            ],
            connections=[
                {"from": "Load Balancer", "to": "Web Servers"},
                {"from": "Web Servers", "to": "Database"}
            ],
            deployment_model=DeploymentModel.AUTO_SCALING
        )
        
        # Calculate cost analysis
        cost_analysis = await cost_calculator.calculate_architecture_cost(
            architecture, usage_patterns
        )
        
        logger.info("Cost calculation completed",
                   architecture_id=architecture_id,
                   total_cost=cost_analysis.total_monthly_cost,
                   user_id=user_id)
        
        return {
            "success": True,
            "cost_analysis": cost_analysis.model_dump(),
            "architecture_id": architecture_id
        }
        
    except Exception as e:
        logger.error("Cost calculation failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cost calculation failed"
        )


@router.get("/{architecture_id}/optimize")
async def optimize_costs(
    architecture_id: str,
    optimization_goals: Optional[List[str]] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get cost optimization recommendations"""
    try:
        # Default optimization goals
        if not optimization_goals:
            optimization_goals = ["reduce_cost", "improve_performance"]
        
        # Sample optimization recommendations
        optimizations = [
            {
                "id": "reserved_instances",
                "title": "Purchase Reserved Instances",
                "description": "Save up to 30% on EC2 costs with 1-year Reserved Instances",
                "category": "cost_reduction",
                "impact": "high",
                "effort": "low",
                "estimated_savings": {
                    "monthly": 97.44,
                    "percentage": 30.0
                },
                "affected_services": ["EC2"],
                "implementation_steps": [
                    "Analyze current EC2 usage patterns",
                    "Purchase Reserved Instances for consistent workloads",
                    "Monitor utilization and adjust as needed"
                ]
            },
            {
                "id": "storage_optimization",
                "title": "Optimize RDS Storage",
                "description": "Use GP3 storage and implement automated backups lifecycle",
                "category": "cost_reduction", 
                "impact": "medium",
                "effort": "low",
                "estimated_savings": {
                    "monthly": 23.83,
                    "percentage": 12.0
                },
                "affected_services": ["RDS"],
                "implementation_steps": [
                    "Migrate RDS to GP3 storage type",
                    "Configure backup retention policies",
                    "Enable storage auto scaling"
                ]
            }
        ]
        
        total_potential_savings = sum(opt["estimated_savings"]["monthly"] for opt in optimizations)
        
        return {
            "success": True,
            "architecture_id": architecture_id,
            "recommendations": optimizations,
            "summary": {
                "total_recommendations": len(optimizations),
                "total_potential_monthly_savings": round(total_potential_savings, 2),
                "total_potential_percentage_savings": 25.0
            }
        }
        
    except Exception as e:
        logger.error("Cost optimization failed",
                    architecture_id=architecture_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cost optimization failed"
        )
