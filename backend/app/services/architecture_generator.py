"""
Architecture Generation Service
Core service for generating system architectures using Nova models
"""

import asyncio
import base64
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

from app.core.logging import get_logger
from app.services.nova_client import nova_client
from app.services import diagram_generator
from app.models.architecture_models import (
    RequirementsInput,
    ArchitectureRequirements, 
    SystemArchitecture,
    ArchitectureComponent,
    ServiceType,
    DeploymentModel,
    UsagePatterns
)
from app.templates.aws_patterns import AWSPatternLibrary

logger = get_logger(__name__)


class ArchitectureGeneratorService:
    """
    Service for generating complete system architectures
    Orchestrates Nova models and applies architectural patterns
    """
    
    def __init__(self):
        self.pattern_library = AWSPatternLibrary()
        
    async def generate_complete_architecture(
        self,
        requirements_input: RequirementsInput,
        user_id: Optional[str] = None
    ) -> Tuple[SystemArchitecture, ArchitectureRequirements, Dict[str, Any]]:
        """
        Generate complete architecture from user input
        Returns: (architecture, extracted_requirements, generation_metadata)
        """
        start_time = datetime.now()
        
        try:
            logger.info("Starting architecture generation", 
                       user_id=user_id,
                       description_length=len(requirements_input.description))
            
            # Step 1: Extract structured requirements using Nova
            requirements = await self._extract_requirements(requirements_input, user_id=user_id)
            logger.info("Requirements extracted successfully",
                       functional_count=len(requirements.functional_requirements),
                       non_functional_count=len(requirements.non_functional_requirements))
            logger.debug(f"Extracted requirements: {requirements}")

            # Step 2: Select appropriate architectural patterns
            patterns = await self._select_patterns(requirements)
            logger.info(f"Selected {len(patterns)} architectural patterns")

            # Step 3: Generate architecture using Nova with patterns
            architecture = await self._generate_architecture(requirements, patterns, requirements_input.constraints, user_id=user_id)
            logger.info("Architecture generated successfully",
                       components_count=len(architecture.components),
                       deployment_model=architecture.deployment_model)
            
            # Step 4: Enhance architecture with additional details
            enhanced_architecture = await self._enhance_architecture(architecture, requirements)
            
            # Step 5: Generate metadata about the generation process
            generation_time = (datetime.now() - start_time).total_seconds() * 1000
            metadata = {
                "generation_time_ms": generation_time,
                "patterns_used": [p["name"] for p in patterns],
                "nova_models_used": ["nova-lite"],
                "components_generated": len(enhanced_architecture.components),
                "estimated_monthly_cost": enhanced_architecture.estimated_monthly_cost,
                "complexity_score": self._calculate_complexity_score(enhanced_architecture)
            }
            
            logger.info("Architecture generation completed successfully",
                       processing_time_ms=generation_time,
                       user_id=user_id)
            
            return enhanced_architecture, requirements, metadata
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.error("Architecture generation failed",
                        error=str(e),
                        processing_time_ms=processing_time,
                        user_id=user_id)
            raise

    async def generate_diagram(
        self,
        architecture: SystemArchitecture,
        style: str = "aws-professional"
    ) -> Dict[str, Any]:
        """Generate visual diagram for architecture"""
        try:
            logger.info("Generating architecture diagram",
                       architecture_id=architecture.id,
                       style=style)
            
            # Use diagrams library to generate diagram
            diagram_data = await diagram_generator.generate_architecture_diagram(architecture, style)
            
            # Add metadata
            diagram_data["architecture_id"] = architecture.id
            diagram_data["generated_at"] = datetime.now().isoformat()
            diagram_data["style"] = style
            
            logger.info("Diagram generated successfully",
                       architecture_id=architecture.id)
            
            return diagram_data
            
        except Exception as e:
            logger.error("Diagram generation failed",
                        architecture_id=architecture.id,
                        error=str(e))
            raise

    async def analyze_existing_diagram(self, image_bytes: bytes) -> Dict[str, Any]:
        """Analyze existing architecture diagram and suggest improvements"""
        try:
            logger.info("Analyzing uploaded architecture diagram",
                       image_size_bytes=len(image_bytes))
            
            # Use Nova multimodal to analyze diagram
            analysis = await nova_client.analyze_uploaded_diagram(image_bytes)
            
            # Add recommendations based on analysis
            recommendations = await self._generate_modernization_recommendations(analysis)
            analysis["modernization_recommendations"] = recommendations
            
            logger.info("Diagram analysis completed successfully")
            return analysis
            
        except Exception as e:
            logger.error("Diagram analysis failed", error=str(e))
            raise

    async def _extract_requirements(self, requirements_input: RequirementsInput, user_id: Optional[str] = None) -> ArchitectureRequirements:
        """Extract structured requirements using Nova"""
        return await nova_client.extract_requirements(
            text=requirements_input.description,
            documents=[base64.b64decode(doc) for doc in (requirements_input.uploaded_docs or [])],
            images=[base64.b64decode(img) for img in (requirements_input.diagrams or [])],
            log_user_id=user_id,
        )

    async def _select_patterns(self, requirements: ArchitectureRequirements) -> List[Dict[str, Any]]:
        """Select appropriate architectural patterns based on requirements"""
        patterns = []
        
        # Analyze functional requirements to determine patterns
        functional_text = " ".join(requirements.functional_requirements).lower()
        
        # Web application pattern
        if any(keyword in functional_text for keyword in ["web", "http", "api", "frontend", "user interface"]):
            patterns.append(self.pattern_library.get_web_application_pattern())
        
        # Microservices pattern
        if any(keyword in functional_text for keyword in ["microservice", "service", "api", "distributed"]) and \
           "monolith" not in functional_text:
            patterns.append(self.pattern_library.get_microservices_pattern())
        
        # Data processing pattern
        if any(keyword in functional_text for keyword in ["data", "analytics", "etl", "pipeline", "processing"]):
            patterns.append(self.pattern_library.get_data_processing_pattern())
        
        # Serverless pattern
        if any(keyword in functional_text for keyword in ["serverless", "lambda", "event-driven", "function"]):
            patterns.append(self.pattern_library.get_serverless_pattern())
        
        # Real-time pattern
        if any(keyword in functional_text for keyword in ["real-time", "streaming", "live", "websocket"]):
            patterns.append(self.pattern_library.get_realtime_pattern())
        
        # If no specific patterns identified, use default web application
        if not patterns:
            patterns.append(self.pattern_library.get_web_application_pattern())
        
        logger.info(f"Selected patterns: {[p['name'] for p in patterns]}")
        return patterns

    async def _generate_architecture(
        self,
        requirements: ArchitectureRequirements,
        patterns: List[Dict[str, Any]],
        constraints: Dict[str, Any],
        user_id: Optional[str] = None,
    ) -> SystemArchitecture:
        """Generate architecture using Nova with selected patterns"""
        return await nova_client.design_architecture(
            requirements=requirements,
            patterns=patterns,
            constraints=constraints,
            log_user_id=user_id,
        )

    async def _enhance_architecture(
        self,
        architecture: SystemArchitecture,
        requirements: ArchitectureRequirements
    ) -> SystemArchitecture:
        """Enhance architecture with additional details and best practices"""
        
        enhanced_components = []
        
        for component in architecture.components:
            # Add security configurations
            security_config = self._generate_security_config(component, requirements)
            
            # Add monitoring configurations
            monitoring_config = self._generate_monitoring_config(component)
            
            # Add performance configurations
            performance_config = self._generate_performance_config(component, requirements)
            
            # Create enhanced component
            enhanced_component = ArchitectureComponent(
                id=component.id,
                name=component.name,
                service_type=component.service_type,
                configuration={
                    **component.configuration,
                    "security": security_config,
                    "monitoring": monitoring_config,
                    "performance": performance_config
                },
                dependencies=component.dependencies,
                estimated_monthly_cost=component.estimated_monthly_cost,
                security_configuration=security_config
            )
            
            enhanced_components.append(enhanced_component)
        
        # Create enhanced architecture
        enhanced_architecture = SystemArchitecture(
            id=architecture.id,
            name=architecture.name,
            components=enhanced_components,
            connections=architecture.connections,
            deployment_model=architecture.deployment_model,
            diagram_url=architecture.diagram_url,
            estimated_monthly_cost=architecture.estimated_monthly_cost,
            security_features=self._generate_security_features(enhanced_components),
            scalability_features=self._generate_scalability_features(enhanced_components),
            metadata={
                **architecture.metadata,
                "enhanced": True,
                "enhancement_timestamp": datetime.now().isoformat()
            }
        )
        
        return enhanced_architecture

    def _generate_security_config(
        self,
        component: ArchitectureComponent,
        requirements: ArchitectureRequirements
    ) -> Dict[str, Any]:
        """Generate security configuration for component"""
        security_config = {
            "encryption_at_rest": True,
            "encryption_in_transit": True,
            "access_logging": True
        }
        
        # Add service-specific security configurations
        if component.service_type == ServiceType.RDS:
            security_config.update({
                "backup_encryption": True,
                "performance_insights_encryption": True,
                "deletion_protection": True
            })
        elif component.service_type == ServiceType.S3:
            security_config.update({
                "block_public_access": True,
                "bucket_key_enabled": True,
                "versioning": True,
                "mfa_delete": True
            })
        elif component.service_type in [ServiceType.EC2, ServiceType.ECS]:
            security_config.update({
                "security_groups": ["restrictive"],
                "iam_role": "least_privilege",
                "patch_management": True
            })
        
        # Add compliance-specific configurations
        compliance_reqs = requirements.compliance_requirements or []
        if any("HIPAA" in req for req in compliance_reqs):
            security_config.update({
                "dedicated_tenancy": True,
                "audit_logging": "comprehensive",
                "encryption_key_management": "customer_managed"
            })
        
        return security_config

    def _generate_monitoring_config(self, component: ArchitectureComponent) -> Dict[str, Any]:
        """Generate monitoring configuration for component"""
        monitoring_config = {
            "cloudwatch_metrics": True,
            "detailed_monitoring": True,
            "log_retention_days": 30
        }
        
        # Add service-specific monitoring
        if component.service_type == ServiceType.RDS:
            monitoring_config.update({
                "performance_insights": True,
                "enhanced_monitoring": True,
                "slow_query_logging": True
            })
        elif component.service_type == ServiceType.ALB:
            monitoring_config.update({
                "access_logs": True,
                "connection_logs": True,
                "target_health_monitoring": True
            })
        elif component.service_type == ServiceType.LAMBDA:
            monitoring_config.update({
                "x_ray_tracing": True,
                "dead_letter_queue": True,
                "error_rate_alarms": True
            })
        
        return monitoring_config

    def _generate_performance_config(
        self,
        component: ArchitectureComponent,
        requirements: ArchitectureRequirements
    ) -> Dict[str, Any]:
        """Generate performance configuration for component"""
        performance_config = {}
        
        # Extract performance requirements
        perf_requirements = " ".join(requirements.non_functional_requirements).lower()
        
        if component.service_type == ServiceType.RDS:
            performance_config = {
                "multi_az": True,
                "read_replicas": 1 if "read" in perf_requirements else 0,
                "connection_pooling": True,
                "query_performance_insights": True
            }
        elif component.service_type in [ServiceType.EC2, ServiceType.ECS]:
            performance_config = {
                "instance_type": "optimized",
                "ebs_optimized": True,
                "placement_group": "cluster" if "low latency" in perf_requirements else None
            }
        elif component.service_type == ServiceType.ELASTICACHE:
            performance_config = {
                "node_type": "memory_optimized",
                "replication_groups": True,
                "automatic_failover": True
            }
        
        return performance_config

    def _generate_security_features(self, components: List[ArchitectureComponent]) -> List[str]:
        """Generate list of security features based on components"""
        features = [
            "AWS IAM for identity and access management",
            "VPC with private subnets",
            "Security groups and NACLs",
            "Encryption at rest and in transit",
            "AWS CloudTrail for audit logging"
        ]
        
        # Add component-specific security features
        service_types = [comp.service_type for comp in components]
        
        if ServiceType.ALB in service_types:
            features.append("AWS WAF for web application firewall")
        
        if ServiceType.RDS in service_types:
            features.append("Database parameter groups for security hardening")
        
        if ServiceType.S3 in service_types:
            features.append("S3 bucket policies and access points")
        
        return features

    def _generate_scalability_features(self, components: List[ArchitectureComponent]) -> List[str]:
        """Generate list of scalability features based on components"""
        features = [
            "Auto Scaling Groups for compute resources",
            "Application Load Balancer for traffic distribution",
            "CloudWatch metrics and alarms for scaling triggers"
        ]
        
        service_types = [comp.service_type for comp in components]
        
        if ServiceType.RDS in service_types:
            features.append("RDS read replicas for read scaling")
        
        if ServiceType.ELASTICACHE in service_types:
            features.append("ElastiCache for caching and performance")
        
        if ServiceType.CLOUDFRONT in service_types:
            features.append("CloudFront CDN for global content delivery")
        
        if ServiceType.ECS in service_types or ServiceType.EKS in service_types:
            features.append("Container orchestration for microservices scaling")
        
        return features

    def _calculate_complexity_score(self, architecture: SystemArchitecture) -> int:
        """Calculate complexity score for architecture (1-10)"""
        score = len(architecture.components)  # Base score from component count
        
        # Add complexity for different service types
        service_types = set(comp.service_type for comp in architecture.components)
        score += len(service_types) * 0.5
        
        # Add complexity for connections
        score += len(architecture.connections) * 0.3
        
        # Add complexity for deployment model
        deployment_complexity = {
            DeploymentModel.SINGLE_INSTANCE: 1,
            DeploymentModel.AUTO_SCALING: 2,
            DeploymentModel.MICROSERVICES: 4,
            DeploymentModel.SERVERLESS: 3,
            DeploymentModel.CONTAINERIZED: 3,
            DeploymentModel.HYBRID: 5
        }
        score += deployment_complexity.get(architecture.deployment_model, 2)
        
        # Normalize to 1-10 scale
        return min(10, max(1, int(score)))

    async def _generate_modernization_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate modernization recommendations based on diagram analysis"""
        recommendations = []
        
        # Basic recommendations based on common patterns
        recommendations.extend([
            {
                "category": "containerization",
                "title": "Container Migration",
                "description": "Consider migrating to containerized deployments using ECS or EKS for better resource utilization and deployment flexibility",
                "impact": "high",
                "effort": "medium"
            },
            {
                "category": "serverless",
                "title": "Serverless Components",
                "description": "Evaluate serverless alternatives (Lambda, API Gateway, DynamoDB) for event-driven components to reduce operational overhead",
                "impact": "medium",
                "effort": "medium"
            },
            {
                "category": "monitoring",
                "title": "Enhanced Observability",
                "description": "Implement comprehensive monitoring with CloudWatch, X-Ray, and centralized logging for better operational visibility",
                "impact": "high",
                "effort": "low"
            },
            {
                "category": "security",
                "title": "Security Hardening",
                "description": "Implement AWS Security Hub, GuardDuty, and Config for continuous security monitoring and compliance",
                "impact": "high",
                "effort": "medium"
            }
        ])
        
        return recommendations

    async def validate_architecture(self, architecture: SystemArchitecture) -> Dict[str, Any]:
        """Validate architecture against best practices"""
        validation_results = {
            "valid": True,
            "warnings": [],
            "errors": [],
            "recommendations": []
        }
        
        # Check for single points of failure
        if len(architecture.components) < 3:
            validation_results["warnings"].append("Architecture has very few components, consider adding redundancy")
        
        # Check for load balancing
        has_load_balancer = any(
            comp.service_type in [ServiceType.ALB, ServiceType.NLB] 
            for comp in architecture.components
        )
        if not has_load_balancer and len(architecture.components) > 2:
            validation_results["recommendations"].append("Consider adding a load balancer for better traffic distribution")
        
        # Check for database backup
        has_database = any(
            comp.service_type in [ServiceType.RDS, ServiceType.DYNAMODB]
            for comp in architecture.components
        )
        if has_database:
            validation_results["recommendations"].append("Ensure database backup and point-in-time recovery are configured")
        
        # Check for monitoring
        has_monitoring = any(
            comp.service_type == ServiceType.CLOUDWATCH
            for comp in architecture.components
        )
        if not has_monitoring:
            validation_results["recommendations"].append("Add CloudWatch for monitoring and alerting")
        
        return validation_results


# Global service instance
architecture_generator = ArchitectureGeneratorService()

# Export service
__all__ = ["ArchitectureGeneratorService", "architecture_generator"]
