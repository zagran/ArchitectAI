"""
Pydantic Models for ArchitectAI
Defines all data structures and validation schemas
"""

from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, validator, ConfigDict


# Enums for controlled vocabularies
class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ComplexityLevel(str, Enum):
    SIMPLE = "simple"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class DeploymentModel(str, Enum):
    SINGLE_INSTANCE = "single_instance"
    AUTO_SCALING = "auto_scaling"
    MICROSERVICES = "microservices"
    SERVERLESS = "serverless"
    CONTAINERIZED = "containerized"
    HYBRID = "hybrid"


class ServiceType(str, Enum):
    # Compute
    EC2 = "ec2"
    ECS = "ecs"
    FARGATE = "fargate"
    LAMBDA = "lambda"
    EKS = "eks"
    BATCH = "batch"
    LIGHTSAIL = "lightsail"

    # Storage
    S3 = "s3"
    EBS = "ebs"
    EFS = "efs"
    FSX = "fsx"
    GLACIER = "glacier"

    # Database
    RDS = "rds"
    AURORA = "aurora"
    DYNAMODB = "dynamodb"
    ELASTICACHE = "elasticache"
    DOCUMENTDB = "documentdb"
    REDSHIFT = "redshift"
    NEPTUNE = "neptune"
    TIMESTREAM = "timestream"

    # Networking & Content Delivery
    VPC = "vpc"
    ALB = "alb"
    NLB = "nlb"
    CLOUDFRONT = "cloudfront"
    API_GATEWAY = "api_gateway"
    ROUTE53 = "route53"
    DIRECT_CONNECT = "direct_connect"
    TRANSIT_GATEWAY = "transit_gateway"
    NAT_GATEWAY = "nat_gateway"
    INTERNET_GATEWAY = "internet_gateway"

    # Messaging & Streaming
    SQS = "sqs"
    SNS = "sns"
    KINESIS = "kinesis"
    EVENTBRIDGE = "eventbridge"
    MQ = "mq"
    MSK = "msk"

    # Security
    IAM = "iam"
    KMS = "kms"
    SECRETS_MANAGER = "secrets_manager"
    WAF = "waf"
    SHIELD = "shield"
    COGNITO = "cognito"
    ACM = "acm"
    GUARDDUTY = "guardduty"

    # Monitoring & Management
    CLOUDWATCH = "cloudwatch"
    X_RAY = "x_ray"
    CLOUDTRAIL = "cloudtrail"
    CONFIG = "config"
    SSM = "ssm"

    # Analytics & ML
    ATHENA = "athena"
    GLUE = "glue"
    EMR = "emr"
    OPENSEARCH = "opensearch"
    SAGEMAKER = "sagemaker"
    STEP_FUNCTIONS = "step_functions"

    # Developer Tools / CI-CD
    CODEPIPELINE = "codepipeline"
    CODEBUILD = "codebuild"
    CODECOMMIT = "codecommit"

    # Other / catch-all
    OTHER = "other"


# Input Models
class RequirementsInput(BaseModel):
    """Input model for processing business requirements"""
    model_config = ConfigDict(str_strip_whitespace=True)
    
    description: str = Field(..., min_length=10, max_length=5000, 
                           description="Natural language description of requirements")
    uploaded_docs: Optional[List[str]] = Field(default_factory=list, 
                                              description="Base64 encoded documents")
    diagrams: Optional[List[str]] = Field(default_factory=list, 
                                        description="Base64 encoded images/diagrams")
    constraints: Dict[str, Any] = Field(default_factory=dict, 
                                       description="Technical and business constraints")
    preferences: Dict[str, Any] = Field(default_factory=dict,
                                      description="User preferences for technology stack")

    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()


class ArchitectureRequirements(BaseModel):
    """Structured requirements extracted from user input"""
    functional_requirements: List[str] = Field(..., description="Core features and capabilities")
    non_functional_requirements: List[str] = Field(..., description="Performance, security, etc.")
    constraints: Dict[str, Any] = Field(..., description="Budget, timeline, technical constraints")
    scale_requirements: Dict[str, Any] = Field(..., description="Users, data, geographic distribution")
    integration_requirements: Optional[List[str]] = Field(default_factory=list)
    compliance_requirements: Optional[List[str]] = Field(default_factory=list)


class UsagePatterns(BaseModel):
    """Expected usage patterns for cost calculation"""
    daily_active_users: Optional[int] = Field(default=1000)
    peak_concurrent_users: Optional[int] = Field(default=100)
    data_growth_rate_gb_month: Optional[float] = Field(default=10.0)
    request_rate_per_second: Optional[int] = Field(default=100)
    geographic_regions: List[str] = Field(default_factory=lambda: ["us-east-1"])
    usage_seasonality: Optional[Dict[str, float]] = Field(default_factory=dict)


# Core Architecture Models
class ArchitectureComponent(BaseModel):
    """Individual component in system architecture"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Human-readable component name")
    service_type: ServiceType = Field(..., description="AWS service type")
    configuration: Dict[str, Any] = Field(default_factory=dict, 
                                        description="Service-specific configuration")
    dependencies: List[str] = Field(default_factory=list, 
                                  description="List of component IDs this depends on")
    estimated_monthly_cost: Optional[float] = Field(default=None)
    performance_characteristics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    security_configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Component name cannot be empty')
        return v.strip()


class SystemArchitecture(BaseModel):
    """Complete system architecture specification"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Architecture name")
    components: List[ArchitectureComponent] = Field(..., description="All system components")
    connections: List[Dict[str, str]] = Field(..., description="Component connections")
    deployment_model: DeploymentModel = Field(..., description="Overall deployment approach")
    diagram_url: Optional[str] = Field(default=None, description="Generated diagram URL")
    estimated_monthly_cost: Optional[float] = Field(default=None)
    performance_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    security_features: List[str] = Field(default_factory=list)
    scalability_features: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict, 
                                   description="Additional architecture metadata")
    created_at: datetime = Field(default_factory=datetime.now)
    nova_reasoning: Optional[Dict[str, Any]] = Field(default_factory=dict,
                                                   description="Nova's reasoning process")

    @validator('components')
    def validate_components(cls, v):
        if not v:
            raise ValueError('Architecture must have at least one component')
        return v


# Cost Analysis Models
class ComponentCost(BaseModel):
    """Cost breakdown for individual component"""
    component_id: str = Field(...)
    component_name: str = Field(...)
    service_type: str = Field(...)
    monthly_cost: float = Field(..., ge=0)
    cost_breakdown: Dict[str, float] = Field(default_factory=dict)
    cost_drivers: List[str] = Field(default_factory=list)
    optimization_potential: Optional[float] = Field(default=None, 
                                                  description="Potential savings %")


class CostScenario(BaseModel):
    """Cost analysis for different scenarios"""
    scenario_name: str = Field(...)
    description: str = Field(...)
    total_monthly_cost: float = Field(..., ge=0)
    usage_assumptions: Dict[str, Any] = Field(...)
    cost_drivers: List[str] = Field(default_factory=list)


class CostAnalysis(BaseModel):
    """Complete cost analysis for architecture"""
    architecture_id: str = Field(...)
    total_monthly_cost: float = Field(..., ge=0)
    component_breakdown: List[ComponentCost] = Field(...)
    cost_scenarios: List[CostScenario] = Field(default_factory=list)
    optimization_suggestions: List[str] = Field(default_factory=list)
    confidence_level: float = Field(default=0.85, ge=0.0, le=1.0,
                                   description="Confidence in cost estimates")
    pricing_data_version: str = Field(..., description="AWS pricing API version used")
    calculated_at: datetime = Field(default_factory=datetime.now)


# Optimization Models
class OptimizationSuggestion(BaseModel):
    """Individual optimization recommendation"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    category: str = Field(..., description="cost, performance, security, etc.")
    title: str = Field(..., description="Short optimization title")
    description: str = Field(..., description="Detailed explanation")
    potential_impact: str = Field(..., description="Expected impact (high, medium, low)")
    implementation_effort: str = Field(..., description="Required effort (low, medium, high)")
    estimated_savings_percent: Optional[float] = Field(default=None, ge=0, le=100)
    estimated_savings_dollars: Optional[float] = Field(default=None, ge=0)
    affected_components: List[str] = Field(default_factory=list)
    implementation_steps: List[str] = Field(default_factory=list)


# Implementation Planning Models
class ImplementationTask(BaseModel):
    """Individual task in implementation plan"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Task name")
    description: str = Field(..., description="Detailed task description")
    estimated_duration_hours: int = Field(..., ge=1, description="Estimated hours")
    prerequisites: List[str] = Field(default_factory=list, description="Required task IDs")
    deliverables: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    validation_criteria: List[str] = Field(default_factory=list)


class ImplementationPhase(BaseModel):
    """Implementation phase containing multiple tasks"""
    phase_number: int = Field(..., ge=1)
    name: str = Field(..., description="Phase name")
    description: str = Field(..., description="Phase overview")
    tasks: List[ImplementationTask] = Field(..., description="Tasks in this phase")
    estimated_duration_days: int = Field(..., ge=1)
    prerequisites: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)
    success_criteria: List[str] = Field(default_factory=list)


class InfrastructureCode(BaseModel):
    """Generated Infrastructure as Code"""
    code_type: str = Field(..., description="terraform, cloudformation, pulumi")
    file_name: str = Field(..., description="Generated file name")
    content: str = Field(..., description="Generated code content")
    dependencies: Dict[str, Any] = Field(default_factory=dict)
    variables: Dict[str, Any] = Field(default_factory=dict)
    outputs: Dict[str, Any] = Field(default_factory=dict)


class ImplementationRoadmap(BaseModel):
    """Complete implementation roadmap"""
    architecture_id: str = Field(...)
    phases: List[ImplementationPhase] = Field(..., description="Implementation phases")
    total_estimated_duration_days: int = Field(..., ge=1)
    prerequisites: List[str] = Field(default_factory=list, description="Overall prerequisites")
    infrastructure_code: List[InfrastructureCode] = Field(default_factory=list)
    deployment_scripts: List[Dict[str, str]] = Field(default_factory=list)
    monitoring_setup: Dict[str, Any] = Field(default_factory=dict)
    rollback_procedures: List[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.now)


# Template Models
class ArchitectureTemplate(BaseModel):
    """Reusable architecture template"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    category: str = Field(..., description="Template category")
    template_spec: Dict[str, Any] = Field(..., description="Template specification")
    use_cases: List[str] = Field(default_factory=list)
    complexity_level: ComplexityLevel = Field(...)
    estimated_cost_range: str = Field(..., description="Expected cost range")
    is_public: bool = Field(default=True)
    created_by: Optional[str] = Field(default=None, description="Creator user ID")
    created_at: datetime = Field(default_factory=datetime.now)
    tags: List[str] = Field(default_factory=list)


# Project Management Models
class Project(BaseModel):
    """Project containing multiple architectures"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="Owner user ID")
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(default=None, max_length=2000)
    requirements: Optional[ArchitectureRequirements] = Field(default=None)
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT)
    architectures: List[SystemArchitecture] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    tags: List[str] = Field(default_factory=list)

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Project name cannot be empty')
        return v.strip()


# Response Models
class ArchitectureResponse(BaseModel):
    """API response for architecture generation"""
    success: bool = Field(...)
    architecture: Optional[SystemArchitecture] = Field(default=None)
    cost_analysis: Optional[CostAnalysis] = Field(default=None)
    optimization_suggestions: List[OptimizationSuggestion] = Field(default_factory=list)
    implementation_roadmap: Optional[ImplementationRoadmap] = Field(default=None)
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    nova_usage: Dict[str, Any] = Field(default_factory=dict,
                                     description="Nova API usage statistics")
    requirements_input: Optional[Dict[str, Any]] = Field(default=None,
                                                         description="Original user requirements")


class   ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = Field(default=False)
    error_type: str = Field(...)
    message: str = Field(...)
    details: Optional[Dict[str, Any]] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.now)


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="healthy, degraded, unhealthy")
    services: Dict[str, bool] = Field(...)
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str = Field(..., description="Application version")


# User Models
class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    email: str = Field(..., description="User email")
    full_name: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class UserCreate(BaseModel):
    """User creation model"""
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")
    full_name: Optional[str] = Field(default=None)


class UserLogin(BaseModel):
    """User login model"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")


# Configuration Models
class NovaConfig(BaseModel):
    """Nova model configuration"""
    model_name: str = Field(...)
    max_tokens: int = Field(default=2000, ge=1, le=8000)
    temperature: float = Field(default=0.3, ge=0.0, le=1.0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)


class ApplicationConfig(BaseModel):
    """Application configuration"""
    app_name: str = Field(default="ArchitectAI")
    version: str = Field(default="1.0.0")
    debug: bool = Field(default=False)
    nova_models: Dict[str, NovaConfig] = Field(default_factory=dict)
    aws_region: str = Field(default="us-east-1")
    database_url: str = Field(...)
    redis_url: Optional[str] = Field(default=None)
    jwt_secret_key: str = Field(..., min_length=32)
    jwt_expiration_hours: int = Field(default=24, ge=1, le=168)
