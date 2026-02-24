"""
Architecture API Routes
REST endpoints for architecture generation and management
"""

import asyncio
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
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
    OptimizationSuggestion,
)
from app.models.database_models import Architecture as ArchitectureDB, ArchitectureFeedback as FeedbackDB

logger = get_logger(__name__)
router = APIRouter()


class FeedbackPayload(BaseModel):
    rating: int
    feedback_text: Optional[str] = None


async def _write_audit(
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    """Write an audit log entry (fire-and-forget, opens its own DB session)."""
    try:
        import uuid as _uuid
        from app.core.database import get_db
        from app.models.database_models import AuditLog

        uid = _uuid.UUID(user_id) if user_id else None
        rid = _uuid.UUID(resource_id) if resource_id else None
        async with get_db() as db:
            db.add(AuditLog(
                user_id=uid,
                action=action,
                resource_type=resource_type,
                resource_id=rid,
                details=details,
            ))
    except Exception:
        pass


@router.post("/generate", response_model=ArchitectureResponse)
async def generate_architecture(
    requirements: RequirementsInput,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Generate complete system architecture from requirements and persist to DB.
    """
    try:
        logger.info("Architecture generation requested",
                    user_id=user_id,
                    description_length=len(requirements.description))

        start_time = datetime.now()

        # Generate complete architecture
        architecture, _extracted_requirements, metadata = await architecture_generator.generate_complete_architecture(
            requirements, user_id
        )

        # Calculate cost analysis
        usage_patterns = UsagePatterns()
        cost_analysis = await cost_calculator.calculate_architecture_cost(
            architecture, usage_patterns
        )

        # Get optimization suggestions via Nova Micro
        try:
            optimization_suggestions = await nova_client.suggest_optimizations(
                architecture=architecture,
                cost_breakdown=[c.model_dump() for c in cost_analysis.component_breakdown],
                usage_patterns=UsagePatterns().model_dump(),
                log_user_id=user_id,
                log_arch_id=architecture.id,
            )
        except Exception as opt_err:
            logger.warning("Optimization suggestions failed, skipping", error=str(opt_err))
            optimization_suggestions = []

        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)

        # Persist to database
        db_arch = ArchitectureDB(
            id=uuid.UUID(architecture.id),
            user_id=user_id,
            name=architecture.name,
            architecture_spec=architecture.model_dump(mode="json"),
            requirements_input=requirements.model_dump(mode="json"),
            cost_analysis=cost_analysis.model_dump(mode="json") if cost_analysis else None,
            optimization_suggestions=[o.model_dump(mode="json") for o in optimization_suggestions],
            nova_reasoning=metadata,
        )
        db.add(db_arch)
        await db.commit()

        asyncio.create_task(_write_audit(
            user_id, "architecture_create", "architecture", architecture.id
        ))

        # Get Nova usage stats
        nova_usage = nova_client.get_usage_summary()

        response = ArchitectureResponse(
            success=True,
            architecture=architecture,
            cost_analysis=cost_analysis,
            optimization_suggestions=optimization_suggestions,
            implementation_roadmap=None,
            processing_time_ms=processing_time,
            nova_usage=nova_usage
        )

        logger.info("Architecture generation completed successfully",
                    user_id=user_id,
                    architecture_id=architecture.id,
                    processing_time_ms=processing_time)

        return response

    except Exception as e:
        logger.error("Architecture generation failed", user_id=user_id, error=str(e))
        return ArchitectureResponse(
            success=False,
            processing_time_ms=0,
            nova_usage={}
        )


@router.post("/{architecture_id}/diagram")
async def generate_diagram(
    architecture_id: str,
    style: str = "aws-professional",
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Generate visual diagram for existing architecture using the diagram generator.
    """
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        architecture = SystemArchitecture.model_validate(row.architecture_spec)
        diagram_data = await architecture_generator.generate_diagram(architecture, style)

        # Persist diagram metadata back to the row
        row.diagram_metadata = diagram_data.get("metadata")
        await db.commit()

        return JSONResponse(content={
            "success": True,
            "diagram": diagram_data,
            "architecture_id": architecture_id,
            "style": style
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Diagram generation failed", architecture_id=architecture_id, error=str(e))
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
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )

        image_data = await file.read()

        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )

        logger.info("Analyzing uploaded diagram",
                    filename=file.filename,
                    size_bytes=len(image_data),
                    user_id=user_id)

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
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Get architecture by ID from database"""
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        architecture = SystemArchitecture.model_validate(row.architecture_spec)
        cost = CostAnalysis.model_validate(row.cost_analysis) if row.cost_analysis else None
        opts = [OptimizationSuggestion.model_validate(o) for o in (row.optimization_suggestions or [])]

        return ArchitectureResponse(
            success=True,
            architecture=architecture,
            cost_analysis=cost,
            optimization_suggestions=opts,
            processing_time_ms=0,
            nova_usage={},
            requirements_input=row.requirements_input,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch architecture", architecture_id=architecture_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture not found"
        )


@router.get("/{architecture_id}/cost")
async def get_cost_analysis(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Get detailed cost analysis for architecture"""
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        architecture = SystemArchitecture.model_validate(row.architecture_spec)
        usage_patterns = UsagePatterns()
        cost_analysis = await cost_calculator.calculate_architecture_cost(architecture, usage_patterns)
        cost_trends = await cost_calculator.get_cost_trends(architecture_id)

        return JSONResponse(content={
            "success": True,
            "cost_analysis": cost_analysis.model_dump(mode="json"),
            "cost_trends": cost_trends
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Cost analysis failed", architecture_id=architecture_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cost analysis failed"
        )


@router.post("/{architecture_id}/optimize")
async def optimize_architecture(
    architecture_id: str,
    usage_patterns: UsagePatterns,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Get optimization suggestions for architecture using Nova Micro"""
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        architecture = SystemArchitecture.model_validate(row.architecture_spec)
        cost_analysis = await cost_calculator.calculate_architecture_cost(architecture, usage_patterns)

        optimizations = await nova_client.suggest_optimizations(
            architecture=architecture,
            cost_breakdown=[cost.model_dump() for cost in cost_analysis.component_breakdown],
            usage_patterns=usage_patterns.model_dump()
        )

        return JSONResponse(content={
            "success": True,
            "optimizations": [opt.model_dump(mode="json") for opt in optimizations],
            "current_cost": cost_analysis.total_monthly_cost,
            "architecture_id": architecture_id
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Architecture optimization failed", architecture_id=architecture_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Architecture optimization failed"
        )


@router.post("/{architecture_id}/validate")
async def validate_architecture(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Validate architecture against AWS best practices"""
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        architecture = SystemArchitecture.model_validate(row.architecture_spec)
        validation_results = await architecture_generator.validate_architecture(architecture)

        return JSONResponse(content={
            "success": True,
            "validation": validation_results,
            "architecture_id": architecture_id
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Architecture validation failed", architecture_id=architecture_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Architecture validation failed"
        )


@router.get("/")
async def list_architectures(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db_session)
):
    """List user's architectures from database"""
    try:
        stmt = (
            select(ArchitectureDB)
            .where(ArchitectureDB.user_id == user_id)
            .order_by(ArchitectureDB.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        rows = result.scalars().all()

        architectures = []
        for row in rows:
            spec = row.architecture_spec or {}
            cost = row.cost_analysis or {}
            architectures.append({
                "id": str(row.id),
                "name": row.name,
                "created_at": row.created_at.isoformat(),
                "estimated_monthly_cost": cost.get("total_monthly_cost"),
                "components_count": len(spec.get("components", [])),
                "deployment_model": spec.get("deployment_model", ""),
            })

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


@router.post("/{architecture_id}/feedback")
async def submit_feedback(
    architecture_id: str,
    payload: FeedbackPayload,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Submit or update a 1-5 star rating (with optional text) for an architecture."""
    if not 1 <= payload.rating <= 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating must be between 1 and 5")

    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

    if not row or row.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

    try:
        uid = uuid.UUID(user_id)
        aid = uuid.UUID(architecture_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID")

    stmt = select(FeedbackDB).where(
        FeedbackDB.architecture_id == aid,
        FeedbackDB.user_id == uid,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.rating = payload.rating
        existing.feedback_text = payload.feedback_text
    else:
        db.add(FeedbackDB(
            architecture_id=aid,
            user_id=uid,
            rating=payload.rating,
            feedback_text=payload.feedback_text,
        ))

    await db.commit()
    return {"success": True}


@router.get("/{architecture_id}/feedback")
async def get_feedback(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Get the current user's feedback for an architecture."""
    try:
        uid = uuid.UUID(user_id)
        aid = uuid.UUID(architecture_id)
    except (ValueError, AttributeError):
        return {"rating": None, "feedback_text": None}

    stmt = select(FeedbackDB).where(
        FeedbackDB.architecture_id == aid,
        FeedbackDB.user_id == uid,
    )
    result = await db.execute(stmt)
    feedback = result.scalar_one_or_none()

    if not feedback:
        return {"rating": None, "feedback_text": None}

    return {"rating": feedback.rating, "feedback_text": feedback.feedback_text}


@router.delete("/{architecture_id}")
async def delete_architecture(
    architecture_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session)
):
    """Delete architecture from database"""
    try:
        row = await db.get(ArchitectureDB, uuid.UUID(architecture_id))
        if not row or row.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Architecture not found")

        await db.delete(row)
        await db.commit()

        asyncio.create_task(_write_audit(
            user_id, "architecture_delete", "architecture", architecture_id
        ))

        logger.info("Architecture deleted", architecture_id=architecture_id, user_id=user_id)

        return JSONResponse(content={
            "success": True,
            "message": "Architecture deleted successfully",
            "architecture_id": architecture_id
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete architecture", architecture_id=architecture_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete architecture"
        )
