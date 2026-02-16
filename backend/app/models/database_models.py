"""
SQLAlchemy Database Models for ArchitectAI
Database table definitions and relationships
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, 
    ForeignKey, JSON, Enum as SQLEnum, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.architecture_models import ProjectStatus, ComplexityLevel


class User(Base):
    """User database model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("ArchitectureTemplate", back_populates="creator")


class Project(Base):
    """Project database model"""
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(JSON, nullable=True)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    architectures = relationship("Architecture", back_populates="project", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_projects_user_status', 'user_id', 'status'),
        Index('ix_projects_created_at', 'created_at'),
    )


class Architecture(Base):
    """Architecture database model"""
    __tablename__ = "architectures"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    architecture_spec = Column(JSON, nullable=False)
    diagram_url = Column(String(500), nullable=True)
    diagram_metadata = Column(JSON, nullable=True)
    cost_analysis = Column(JSON, nullable=True)
    implementation_plan = Column(JSON, nullable=True)
    performance_insights = Column(JSON, nullable=True)
    nova_reasoning = Column(JSON, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_current = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="architectures")
    cost_calculations = relationship("CostCalculation", back_populates="architecture", cascade="all, delete-orphan")
    infrastructure_code = relationship("InfrastructureCode", back_populates="architecture", cascade="all, delete-orphan")
    feedback = relationship("ArchitectureFeedback", back_populates="architecture", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_architectures_project_current', 'project_id', 'is_current'),
        Index('ix_architectures_created_at', 'created_at'),
    )


class ArchitectureTemplate(Base):
    """Architecture template database model"""
    __tablename__ = "architecture_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    template_spec = Column(JSON, nullable=False)
    use_cases = Column(JSON, nullable=True)  # Array of strings
    complexity_level = Column(SQLEnum(ComplexityLevel), nullable=False)
    estimated_cost_range = Column(String(100), nullable=True)
    is_public = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    tags = Column(JSON, nullable=True)  # Array of strings
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Relationships
    creator = relationship("User", back_populates="templates")
    
    # Indexes
    __table_args__ = (
        Index('ix_templates_category', 'category'),
        Index('ix_templates_public', 'is_public'),
        Index('ix_templates_complexity', 'complexity_level'),
    )


class CostCalculation(Base):
    """Cost calculation database model"""
    __tablename__ = "cost_calculations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    architecture_id = Column(UUID(as_uuid=True), ForeignKey("architectures.id"), nullable=False)
    calculation_type = Column(String(50), nullable=False)  # monthly, yearly, scaling_scenarios
    cost_breakdown = Column(JSON, nullable=False)
    optimization_suggestions = Column(JSON, nullable=True)
    pricing_data_version = Column(String(50), nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Relationships
    architecture = relationship("Architecture", back_populates="cost_calculations")
    
    # Indexes
    __table_args__ = (
        Index('ix_cost_calculations_architecture', 'architecture_id'),
        Index('ix_cost_calculations_type', 'calculation_type'),
    )


class InfrastructureCode(Base):
    """Infrastructure as Code database model"""
    __tablename__ = "infrastructure_code"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    architecture_id = Column(UUID(as_uuid=True), ForeignKey("architectures.id"), nullable=False)
    code_type = Column(String(50), nullable=False)  # terraform, cloudformation, pulumi
    code_content = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    dependencies = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Relationships
    architecture = relationship("Architecture", back_populates="infrastructure_code")
    
    # Indexes
    __table_args__ = (
        Index('ix_infrastructure_code_architecture', 'architecture_id'),
        Index('ix_infrastructure_code_type', 'code_type'),
    )


class NovaAPIUsage(Base):
    """Nova API usage tracking database model"""
    __tablename__ = "nova_api_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    model_name = Column(String(100), nullable=False)
    operation_type = Column(String(100), nullable=False)
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Indexes
    __table_args__ = (
        Index('ix_nova_usage_user', 'user_id'),
        Index('ix_nova_usage_model', 'model_name'),
        Index('ix_nova_usage_created_at', 'created_at'),
    )


class ArchitectureFeedback(Base):
    """User feedback on architectures"""
    __tablename__ = "architecture_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    architecture_id = Column(UUID(as_uuid=True), ForeignKey("architectures.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 rating
    feedback_text = Column(Text, nullable=True)
    improvement_suggestions = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Relationships
    architecture = relationship("Architecture", back_populates="feedback")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('architecture_id', 'user_id', name='unique_user_feedback_per_architecture'),
        Index('ix_feedback_architecture', 'architecture_id'),
        Index('ix_feedback_rating', 'rating'),
    )


class UserSession(Base):
    """User session tracking"""
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    last_activity = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    user_agent = Column(String(500), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('ix_sessions_user_active', 'user_id', 'expires_at'),
    )


class AuditLog(Base):
    """Audit log for tracking important actions"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)  # project, architecture, template
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    # Indexes
    __table_args__ = (
        Index('ix_audit_logs_user', 'user_id'),
        Index('ix_audit_logs_action', 'action'),
        Index('ix_audit_logs_resource', 'resource_type', 'resource_id'),
        Index('ix_audit_logs_created_at', 'created_at'),
    )


# Database utility functions
def create_all_tables():
    """Create all database tables"""
    from app.core.database import engine
    Base.metadata.create_all(bind=engine)


def drop_all_tables():
    """Drop all database tables (use with caution!)"""
    from app.core.database import engine
    Base.metadata.drop_all(bind=engine)
