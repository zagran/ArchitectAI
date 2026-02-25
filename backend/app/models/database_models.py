"""
SQLAlchemy Database Models for ArchitectAI
Database table definitions and relationships
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text,
    ForeignKey, JSON, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


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


class Architecture(Base):
    """Architecture database model"""
    __tablename__ = "architectures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(36), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    architecture_spec = Column(JSON, nullable=False)
    requirements_input = Column(JSON, nullable=True)
    diagram_url = Column(String(500), nullable=True)
    diagram_metadata = Column(JSON, nullable=True)
    cost_analysis = Column(JSON, nullable=True)
    optimization_suggestions = Column(JSON, nullable=True)
    implementation_plan = Column(JSON, nullable=True)
    performance_insights = Column(JSON, nullable=True)
    nova_reasoning = Column(JSON, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_current = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    feedback = relationship("ArchitectureFeedback", back_populates="architecture", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_architectures_created_at', 'created_at'),
        Index('ix_architectures_user_created', 'user_id', 'created_at'),
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
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    architecture = relationship("Architecture", back_populates="feedback")

    __table_args__ = (
        UniqueConstraint('architecture_id', 'user_id', name='unique_user_feedback_per_architecture'),
        Index('ix_feedback_architecture', 'architecture_id'),
        Index('ix_feedback_rating', 'rating'),
    )


class NovaLog(Base):
    """Nova API call logs — prompt + response for every Bedrock invocation"""
    __tablename__ = "nova_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(36), nullable=True)
    architecture_id = Column(UUID(as_uuid=True), nullable=True)
    operation = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=False, default=0)
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    __table_args__ = (
        Index('ix_nova_logs_user_id', 'user_id'),
        Index('ix_nova_logs_architecture_id', 'architecture_id'),
        Index('ix_nova_logs_operation', 'operation'),
        Index('ix_nova_logs_created_at', 'created_at'),
    )


class AuditLog(Base):
    """Audit log for tracking important actions"""
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

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
