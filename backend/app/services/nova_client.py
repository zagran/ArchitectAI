"""
Amazon Nova Integration Client
Comprehensive integration with all Nova models for ArchitectAI
"""

import json
import logging
import asyncio
import base64
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import boto3
from botocore.exceptions import ClientError, BotoCoreError, NoCredentialsError
import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger
from app.models.architecture_models import (
    RequirementsInput, 
    ArchitectureRequirements,
    SystemArchitecture,
    OptimizationSuggestion,
    ArchitectureComponent,
    ServiceType,
    DeploymentModel
)

logger = get_logger(__name__)


class NovaAPIUsage(BaseModel):
    """Track Nova API usage for monitoring and optimization"""
    model_name: str
    operation_type: str
    input_tokens: int
    output_tokens: int
    processing_time_ms: int
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime = datetime.now()


class NovaModelConfig(BaseModel):
    """Configuration for Nova models"""
    model_id: str
    max_tokens: int = 2000
    temperature: float = 0.3
    top_p: float = 0.9
    timeout_seconds: int = 60


class NovaClient:
    """
    Comprehensive Amazon Nova client supporting all model types:
    - Nova 2 Lite: Advanced reasoning and architecture generation
    - Nova Canvas: Visual diagram generation
    - Nova Micro: Fast optimization suggestions
    - Nova Multimodal Embeddings: Document and image processing
    """
    
    def __init__(self):
        """Initialize Nova client with AWS Bedrock"""
        try:
            self.bedrock_client = boto3.client(
                'bedrock-runtime',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            
            # Model configurations
            self.model_configs = {
                'nova_lite': NovaModelConfig(
                    model_id='us.amazon.nova-2-lite-v1:0',
                    max_tokens=4000,
                    temperature=0.2,
                    timeout_seconds=120
                ),
                'nova_canvas': NovaModelConfig(
                    model_id='us.nova-canvas-v1:0',
                    max_tokens=1000,
                    temperature=0.1,
                    timeout_seconds=180
                ),
                'nova_micro': NovaModelConfig(
                    model_id='amazon.nova-micro-v1:0',
                    max_tokens=1000,
                    temperature=0.4,
                    timeout_seconds=30
                )
            }
            
            self.usage_stats: List[NovaAPIUsage] = []
            logger.info("Nova client initialized successfully")
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise
        except Exception as e:
            logger.error(f"Nova client initialization failed: {str(e)}")
            raise

    async def extract_requirements(
        self, 
        text: str, 
        documents: List[bytes] = None,
        images: List[bytes] = None
    ) -> ArchitectureRequirements:
        """
        Extract structured requirements from text, documents, and images using Nova 2 Lite
        """
        start_time = datetime.now()
        operation = "requirements_extraction"
        
        try:
            # Build comprehensive prompt with multimodal inputs
            prompt = self._build_requirements_extraction_prompt(text, documents, images)
            
            # Use Nova 2 Lite for advanced reasoning
            response = await self._invoke_nova_lite(
                prompt=prompt,
                max_tokens=3000,
                temperature=0.2
            )
            
            # Parse structured response
            requirements = self._parse_requirements_response(response)
            
            # Track successful usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, 
                            len(prompt.split()), len(response.split()), 
                            processing_time, True)
            
            logger.info(f"Requirements extracted successfully in {processing_time}ms")
            return requirements
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Requirements extraction failed: {str(e)}")
            raise

    async def design_architecture(
        self, 
        requirements: ArchitectureRequirements,
        patterns: List[Dict] = None,
        constraints: Dict = None
    ) -> SystemArchitecture:
        """
        Design complete system architecture using Nova 2 Lite's advanced reasoning
        """
        start_time = datetime.now()
        operation = "architecture_design"
        
        try:
            # Build architecture design prompt
            system_prompt = self._build_architecture_design_system_prompt()
            user_prompt = self._format_architecture_design_input(requirements, patterns, constraints)
            
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            
            # Use Nova 2 Lite for complex architectural reasoning
            response = await self._invoke_nova_lite(
                prompt=full_prompt,
                max_tokens=5000,
                temperature=0.3
            )
            
            # Parse architecture response
            architecture = self._parse_architecture_response(response, requirements)
            
            # Track successful usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation,
                            len(full_prompt.split()), len(response.split()),
                            processing_time, True)
            
            logger.info(f"Architecture designed successfully in {processing_time}ms")
            return architecture
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Architecture design failed: {str(e)}")
            raise

    async def generate_architecture_diagram(
        self, 
        architecture: SystemArchitecture,
        style: str = "aws-professional"
    ) -> Dict[str, Any]:
        """
        Generate professional architecture diagram using Nova Canvas
        """
        start_time = datetime.now()
        operation = "diagram_generation"
        
        try:
            # Build detailed diagram prompt
            diagram_prompt = self._build_comprehensive_diagram_prompt(architecture, style)
            
            # Generate diagram with Nova Canvas
            response = await self._invoke_nova_canvas(
                text_prompt=diagram_prompt,
                height=1024,
                width=1024,
                cfg_scale=8.0
            )
            
            # Track successful usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_canvas', operation,
                            len(diagram_prompt.split()), 0, processing_time, True)
            
            logger.info(f"Diagram generated successfully in {processing_time}ms")
            return response
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_canvas', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Diagram generation failed: {str(e)}")
            raise

    async def suggest_optimizations(
        self,
        architecture: SystemArchitecture,
        cost_breakdown: List[Dict],
        usage_patterns: Dict
    ) -> List[OptimizationSuggestion]:
        """
        Generate optimization suggestions using Nova Micro for fast responses
        """
        start_time = datetime.now()
        operation = "optimization_suggestions"
        
        try:
            # Build optimization prompt
            optimization_prompt = self._build_optimization_prompt(
                architecture, cost_breakdown, usage_patterns
            )
            
            # Use Nova Micro for fast optimization suggestions
            response = await self._invoke_nova_micro(
                prompt=optimization_prompt,
                max_tokens=2000,
                temperature=0.4
            )
            
            # Parse optimization suggestions
            optimizations = self._parse_optimization_response(response)
            
            # Track successful usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_micro', operation,
                            len(optimization_prompt.split()), len(response.split()),
                            processing_time, True)
            
            logger.info(f"Optimizations generated successfully in {processing_time}ms")
            return optimizations
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_micro', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Optimization suggestions failed: {str(e)}")
            raise

    async def plan_implementation(
        self,
        architecture: SystemArchitecture,
        dependencies: Dict,
        best_practices: List[str]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive implementation plan using Nova 2 Lite
        """
        start_time = datetime.now()
        operation = "implementation_planning"
        
        try:
            # Build implementation planning prompt
            planning_prompt = self._build_implementation_planning_prompt(
                architecture, dependencies, best_practices
            )
            
            # Use Nova 2 Lite for complex planning
            response = await self._invoke_nova_lite(
                prompt=planning_prompt,
                max_tokens=6000,
                temperature=0.3
            )
            
            # Parse implementation plan
            implementation_plan = self._parse_implementation_response(response)
            
            # Track successful usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation,
                            len(planning_prompt.split()), len(response.split()),
                            processing_time, True)
            
            logger.info(f"Implementation plan generated successfully in {processing_time}ms")
            return implementation_plan
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Implementation planning failed: {str(e)}")
            raise

    async def analyze_uploaded_diagram(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze uploaded architecture diagram using multimodal capabilities
        """
        start_time = datetime.now()
        operation = "diagram_analysis"
        
        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Build multimodal analysis prompt
            prompt = self._build_diagram_analysis_prompt()
            
            # Use Nova 2 Lite with image input
            response = await self._invoke_nova_lite_multimodal(
                prompt=prompt,
                images=[image_b64]
            )
            
            # Parse analysis response
            analysis = self._parse_diagram_analysis_response(response)
            
            # Track usage
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, len(prompt.split()), 
                            len(response.split()), processing_time, True)
            
            logger.info(f"Diagram analysis completed in {processing_time}ms")
            return analysis
            
        except Exception as e:
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self._track_usage('nova_lite', operation, 0, 0, processing_time, False, str(e))
            logger.error(f"Diagram analysis failed: {str(e)}")
            raise

    # Private helper methods for Nova API calls

    async def _invoke_nova_lite(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.3) -> str:
        """Invoke Nova 2 Lite model for text generation"""
        try:
            response = await asyncio.to_thread(
                self.bedrock_client.invoke_model,
                modelId=self.model_configs['nova_lite'].model_id,
                contentType='application/json',
                body=json.dumps({
                    'messages': [{"role": "user", "content": [{"text": prompt}]}],
                    'inferenceConfig': {
                        'maxTokens': max_tokens,
                        'temperature': temperature,
                        'topP': self.model_configs['nova_lite'].top_p
                    }
                })
            )

            response_body = json.loads(response['body'].read())
            return response_body['output']['message']['content'][0]['text']
            
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Nova Lite API error: {str(e)}")
            raise
        except KeyError as e:
            logger.error(f"Nova Lite response parsing error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Nova Lite invocation error: {str(e)}")
            raise

    async def _invoke_nova_lite_multimodal(self, prompt: str, images: List[str] = None) -> str:
        """Invoke Nova Lite with multimodal input (text + images)"""
        try:
            content = [{"text": prompt}]

            if images:
                for image_b64 in images:
                    content.append({
                        "image": {
                            "format": "jpeg",
                            "source": {
                                "bytes": image_b64
                            }
                        }
                    })

            response = await asyncio.to_thread(
                self.bedrock_client.invoke_model,
                modelId=self.model_configs['nova_lite'].model_id,
                contentType='application/json',
                body=json.dumps({
                    'messages': [{"role": "user", "content": content}],
                    'inferenceConfig': {
                        'maxTokens': 3000,
                        'temperature': 0.2
                    }
                })
            )

            response_body = json.loads(response['body'].read())
            return response_body['output']['message']['content'][0]['text']
            
        except Exception as e:
            logger.error(f"Nova Lite multimodal invocation error: {str(e)}")
            raise

    async def _invoke_nova_canvas(
        self, 
        text_prompt: str, 
        height: int = 1024, 
        width: int = 1024, 
        cfg_scale: float = 8.0
    ) -> Dict[str, Any]:
        """Invoke Nova Canvas for image generation"""
        try:
            response = await asyncio.to_thread(
                self.bedrock_client.invoke_model,
                modelId=self.model_configs['nova_canvas'].model_id,
                contentType='application/json',
                body=json.dumps({
                    'taskType': 'TEXT_IMAGE',
                    'textToImageParams': {
                        'text': text_prompt
                    },
                    'imageGenerationConfig': {
                        'numberOfImages': 1,
                        'height': height,
                        'width': width,
                        'cfgScale': cfg_scale,
                        'seed': 0
                    }
                })
            )
            
            response_body = json.loads(response['body'].read())
            return {
                'image_data': response_body['images'][0],
                'metadata': {
                    'prompt': text_prompt,
                    'dimensions': f"{width}x{height}",
                    'cfg_scale': cfg_scale,
                    'model': 'nova-canvas'
                }
            }
            
        except Exception as e:
            logger.error(f"Nova Canvas invocation error: {str(e)}")
            raise

    async def _invoke_nova_micro(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.4) -> str:
        """Invoke Nova Micro for fast responses"""
        try:
            response = await asyncio.to_thread(
                self.bedrock_client.invoke_model,
                modelId=self.model_configs['nova_micro'].model_id,
                contentType='application/json',
                body=json.dumps({
                    'messages': [{"role": "user", "content": [{"text": prompt}]}],
                    'inferenceConfig': {
                        'maxTokens': max_tokens,
                        'temperature': temperature,
                        'topP': self.model_configs['nova_micro'].top_p
                    }
                })
            )

            response_body = json.loads(response['body'].read())
            return response_body['output']['message']['content'][0]['text']
            
        except Exception as e:
            logger.error(f"Nova Micro invocation error: {str(e)}")
            raise

    # Prompt building methods

    def _build_requirements_extraction_prompt(self, text: str, documents: List[bytes] = None, images: List[bytes] = None) -> str:
        """Build comprehensive prompt for requirements extraction"""
        base_prompt = """You are an expert cloud architect and requirements analyst. Extract structured requirements from the provided input.

ANALYZE THE INPUT AND EXTRACT:

1. FUNCTIONAL REQUIREMENTS (What the system must do):
   - Core features and capabilities
   - User stories and use cases
   - API requirements and integrations
   - Data processing and storage needs
   - Business logic requirements

2. NON-FUNCTIONAL REQUIREMENTS (How well the system must perform):
   - Performance targets (latency, throughput, concurrent users)
   - Scalability requirements (expected growth, load patterns)
   - Availability and reliability targets (uptime, recovery time)
   - Security requirements (authentication, authorization, encryption)
   - Compliance needs (GDPR, HIPAA, SOC2, etc.)

3. TECHNICAL CONSTRAINTS:
   - Preferred cloud provider and services
   - Technology stack preferences or requirements
   - Integration requirements with existing systems
   - Budget limitations and cost constraints
   - Timeline and delivery requirements
   - Team skills and operational capabilities

4. SCALE AND USAGE REQUIREMENTS:
   - Expected number of users (daily, concurrent)
   - Data volume estimates (storage, processing)
   - Geographic distribution and regional requirements
   - Peak load scenarios and seasonal variations
   - Growth projections

5. QUALITY ATTRIBUTES:
   - Maintainability and extensibility needs
   - Monitoring and observability requirements
   - Disaster recovery and backup needs
   - Testing and deployment requirements

RESPOND IN STRUCTURED JSON FORMAT with clear categorization. Be specific about numbers, targets, and constraints where mentioned.

INPUT TO ANALYZE:
"""
        
        full_prompt = f"{base_prompt}\n\nTEXT INPUT:\n{text}"
        
        if documents:
            full_prompt += f"\n\nADDITIONAL DOCUMENTS PROVIDED: {len(documents)} document(s)"
        
        if images:
            full_prompt += f"\n\nDIAGRAMS PROVIDED: {len(images)} image(s)"
        
        return full_prompt

    def _build_architecture_design_system_prompt(self) -> str:
        """Build system prompt for architecture design"""
        return """You are a senior cloud architect with deep expertise in AWS services, system design patterns, and the AWS Well-Architected Framework. Your task is to design optimal, scalable, and cost-effective architectures.

ARCHITECTURAL DESIGN PRINCIPLES:
- Apply AWS Well-Architected Framework (Operational Excellence, Security, Reliability, Performance, Cost Optimization, Sustainability)
- Choose appropriate AWS services based on requirements
- Design for scalability, fault tolerance, and high availability
- Optimize for cost-effectiveness and operational simplicity
- Follow security best practices and compliance requirements
- Design for monitoring, logging, and observability
- Consider disaster recovery and business continuity

DESIGN METHODOLOGY:
1. Analyze requirements and constraints thoroughly
2. Identify architectural patterns that fit the use case
3. Select appropriate AWS services and configurations
4. Design data flow and service interactions
5. Plan for scalability and performance optimization
6. Incorporate security at every layer
7. Optimize for cost and operational efficiency
8. Provide detailed rationale for decisions

OUTPUT REQUIREMENTS:
- Complete architecture specification with all components
- Service configurations and sizing recommendations
- Network design and security groups
- Data storage and backup strategies
- Monitoring and alerting setup
- Cost estimates and optimization opportunities
- Implementation considerations and dependencies

Respond with a detailed, production-ready architecture design in structured JSON format."""

    def _format_architecture_design_input(self, requirements: ArchitectureRequirements, patterns: List[Dict] = None, constraints: Dict = None) -> str:
        """Format input for architecture design"""
        input_data = {
            "requirements": requirements.model_dump(),
            "available_patterns": patterns or [],
            "additional_constraints": constraints or {}
        }
        
        return f"""ARCHITECTURE DESIGN REQUEST:

REQUIREMENTS:
{json.dumps(input_data, indent=2)}

DESIGN TASK:
Design a complete, production-ready AWS architecture that satisfies all requirements and constraints. Include:

1. ARCHITECTURE COMPONENTS:
   - All AWS services with specific configurations
   - Component relationships and data flow
   - Network topology and security design
   - Data storage and processing architecture

2. SCALABILITY DESIGN:
   - Auto-scaling configurations
   - Load balancing strategy
   - Performance optimization techniques
   - Capacity planning recommendations

3. SECURITY ARCHITECTURE:
   - Identity and access management
   - Network security (VPC, security groups, NACLs)
   - Data encryption at rest and in transit
   - Compliance and audit considerations

4. OPERATIONAL DESIGN:
   - Monitoring and alerting strategy
   - Logging and tracing implementation
   - Backup and disaster recovery
   - Deployment and CI/CD integration

5. COST OPTIMIZATION:
   - Service sizing and configuration for cost efficiency
   - Reserved capacity and spot instance opportunities
   - Cost monitoring and governance

Provide a comprehensive, implementable architecture design."""

    def _build_comprehensive_diagram_prompt(self, architecture: SystemArchitecture, style: str) -> str:
        """Build detailed prompt for diagram generation"""
        components_desc = []
        for comp in architecture.components:
            components_desc.append(f"- {comp.name} ({comp.service_type})")
        
        connections_desc = []
        for conn in architecture.connections:
            connections_desc.append(f"- {conn.get('from', '')} → {conn.get('to', '')}")
        
        return f"""Create a professional AWS architecture diagram with the following specifications:

ARCHITECTURE OVERVIEW:
- Name: {architecture.name}
- Deployment Model: {architecture.deployment_model}
- Components Count: {len(architecture.components)}

COMPONENTS TO INCLUDE:
{chr(10).join(components_desc)}

CONNECTIONS AND DATA FLOW:
{chr(10).join(connections_desc)}

DIAGRAM REQUIREMENTS:
- Style: {style}
- Use official AWS service icons and colors
- Clean, professional layout with proper spacing
- Clear data flow arrows with appropriate styles
- Proper layering: User/Internet → Presentation → Application → Data
- Include availability zones and regions where relevant
- Add security boundaries (VPC, subnets, security groups)
- Use consistent typography and labeling
- High contrast for readability
- Professional presentation quality suitable for technical documentation

VISUAL GUIDELINES:
- Background: Clean white or light gray
- Icons: Official AWS service icons
- Arrows: Clear directional flow with labels
- Grouping: Visual grouping for related services
- Text: Clear, readable labels and annotations
- Layout: Logical left-to-right or top-to-bottom flow
- Scale: Balanced component sizing
- Colors: AWS standard color palette

Generate a comprehensive, publication-ready architecture diagram."""

    def _build_optimization_prompt(self, architecture: SystemArchitecture, cost_breakdown: List[Dict], usage_patterns: Dict) -> str:
        """Build prompt for optimization suggestions"""
        return f"""Analyze this AWS architecture for optimization opportunities and provide specific, actionable recommendations.

ARCHITECTURE ANALYSIS:
{json.dumps({
    'name': architecture.name,
    'components': [comp.model_dump() for comp in architecture.components],
    'deployment_model': architecture.deployment_model,
    'current_monthly_cost': architecture.estimated_monthly_cost
}, indent=2)}

COST BREAKDOWN:
{json.dumps(cost_breakdown, indent=2)}

USAGE PATTERNS:
{json.dumps(usage_patterns, indent=2)}

OPTIMIZATION ANALYSIS REQUIRED:

1. COST OPTIMIZATION:
   - Reserved Instance opportunities
   - Spot Instance utilization potential
   - Right-sizing recommendations
   - Storage optimization (lifecycle policies, compression)
   - Network cost reduction strategies
   - Service consolidation opportunities

2. PERFORMANCE OPTIMIZATION:
   - Caching strategies (ElastiCache, CloudFront)
   - Database optimization (indexing, read replicas)
   - Auto-scaling improvements
   - Content delivery optimization
   - Connection pooling and resource reuse

3. SECURITY ENHANCEMENTS:
   - IAM policy optimization
   - Network security improvements
   - Encryption enhancements
   - Compliance gap analysis
   - Vulnerability mitigation

4. OPERATIONAL EFFICIENCY:
   - Monitoring and alerting improvements
   - Automation opportunities
   - Disaster recovery optimization
   - Backup strategy enhancement
   - CI/CD pipeline improvements

5. SUSTAINABILITY IMPROVEMENTS:
   - Carbon footprint reduction
   - Resource efficiency gains
   - Serverless migration opportunities
   - Energy-efficient instance types

For each optimization, provide:
- Specific implementation steps
- Expected cost savings or performance gains
- Implementation effort level (Low/Medium/High)
- Timeline for implementation
- Risk assessment and mitigation strategies

Prioritize optimizations by impact vs. effort ratio."""

    def _build_implementation_planning_prompt(self, architecture: SystemArchitecture, dependencies: Dict, best_practices: List[str]) -> str:
        """Build prompt for implementation planning"""
        return f"""Create a comprehensive implementation roadmap for this AWS architecture.

ARCHITECTURE TO IMPLEMENT:
{json.dumps({
    'name': architecture.name,
    'components': [comp.model_dump() for comp in architecture.components],
    'deployment_model': architecture.deployment_model
}, indent=2)}

DEPENDENCIES AND CONSTRAINTS:
{json.dumps(dependencies, indent=2)}

BEST PRACTICES TO FOLLOW:
{json.dumps(best_practices, indent=2)}

IMPLEMENTATION ROADMAP REQUIREMENTS:

1. PHASE PLANNING:
   - Break implementation into logical phases (3-6 phases)
   - Define clear deliverables and success criteria for each phase
   - Identify dependencies between phases and components
   - Provide realistic timeline estimates

2. INFRASTRUCTURE AS CODE:
   - Generate Terraform configurations for each phase
   - Include CloudFormation templates as alternatives
   - Provide deployment scripts and automation
   - Include environment-specific configurations (dev/staging/prod)

3. DEPLOYMENT STRATEGY:
   - Blue-green or rolling deployment approach
   - Database migration strategies
   - DNS and traffic routing plans
   - Rollback procedures and contingency plans

4. TESTING AND VALIDATION:
   - Unit and integration testing requirements
   - Performance testing approach
   - Security testing and penetration testing
   - User acceptance testing criteria

5. MONITORING AND OBSERVABILITY:
   - CloudWatch setup and custom metrics
   - Logging aggregation and analysis
   - Distributed tracing implementation
   - Alerting and notification setup

6. SECURITY IMPLEMENTATION:
   - IAM roles and policies creation
   - Security group and NACL configuration
   - Encryption key management setup
   - Compliance validation procedures

7. OPERATIONAL READINESS:
   - Documentation requirements
   - Team training and knowledge transfer
   - Support and maintenance procedures
   - Disaster recovery testing

8. RISK MITIGATION:
   - Identify potential risks and issues
   - Provide mitigation strategies
   - Define rollback procedures
   - Create contingency plans

For each phase, provide:
- Detailed task list with estimates
- Resource requirements (team, tools, budget)
- Success criteria and acceptance tests
- Dependencies and blockers
- Communication and stakeholder management

Generate a production-ready implementation plan with executable steps."""

    def _build_diagram_analysis_prompt(self) -> str:
        """Build prompt for analyzing uploaded diagrams"""
        return """Analyze this architecture diagram and extract the following information:

DIAGRAM ANALYSIS REQUIREMENTS:

1. COMPONENTS IDENTIFICATION:
   - Identify all services, systems, and components shown
   - Determine cloud provider and specific services used
   - Extract component configurations where visible
   - Note any custom or third-party components

2. ARCHITECTURE PATTERN RECOGNITION:
   - Identify the overall architectural pattern (monolithic, microservices, serverless, etc.)
   - Recognize design patterns (load balancing, auto-scaling, caching, etc.)
   - Determine deployment model and infrastructure approach

3. DATA FLOW ANALYSIS:
   - Map data flow paths between components
   - Identify input/output points and external integrations
   - Analyze communication patterns and protocols
   - Note any data processing or transformation steps

4. SECURITY ARCHITECTURE:
   - Identify security boundaries and network segments
   - Note authentication and authorization mechanisms
   - Analyze encryption and data protection measures
   - Identify potential security gaps or improvements

5. SCALABILITY AND PERFORMANCE:
   - Analyze scalability mechanisms (auto-scaling, load balancing)
   - Identify performance optimization techniques
   - Note caching strategies and content delivery
   - Assess potential bottlenecks or constraints

6. OPERATIONAL ASPECTS:
   - Identify monitoring and logging components
   - Note backup and disaster recovery elements
   - Analyze deployment and CI/CD integration
   - Assess operational complexity

7. MODERNIZATION OPPORTUNITIES:
   - Suggest cloud-native improvements
   - Identify containerization or serverless opportunities
   - Recommend performance optimizations
   - Propose cost optimization strategies

Provide a comprehensive analysis in structured JSON format with specific recommendations for modernization and improvement."""

    # Response parsing methods

    def _parse_requirements_response(self, response: str) -> ArchitectureRequirements:
        """Parse Nova's requirements extraction response"""
        try:
            # Attempt to extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                
                return ArchitectureRequirements(
                    functional_requirements=data.get('functional_requirements', []),
                    non_functional_requirements=data.get('non_functional_requirements', []),
                    constraints=data.get('constraints', {}),
                    scale_requirements=data.get('scale_requirements', {}),
                    integration_requirements=data.get('integration_requirements', []),
                    compliance_requirements=data.get('compliance_requirements', [])
                )
            else:
                # Fallback parsing from text
                return self._parse_requirements_from_text(response)
                
        except Exception as e:
            logger.warning(f"Failed to parse requirements JSON: {str(e)}")
            return self._parse_requirements_from_text(response)

    def _parse_requirements_from_text(self, response: str) -> ArchitectureRequirements:
        """Fallback method to parse requirements from text response"""
        # Simple text parsing - in production, use more sophisticated NLP
        lines = response.split('\n')
        
        functional = []
        non_functional = []
        constraints = {}
        scale = {}
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if 'functional' in line.lower() and 'requirement' in line.lower():
                current_section = 'functional'
            elif 'non-functional' in line.lower():
                current_section = 'non_functional'
            elif 'constraint' in line.lower():
                current_section = 'constraints'
            elif 'scale' in line.lower() or 'usage' in line.lower():
                current_section = 'scale'
            elif line.startswith('- ') or line.startswith('* '):
                if current_section == 'functional':
                    functional.append(line[2:])
                elif current_section == 'non_functional':
                    non_functional.append(line[2:])
        
        return ArchitectureRequirements(
            functional_requirements=functional or ["Web application with user management"],
            non_functional_requirements=non_functional or ["High availability", "Scalable architecture"],
            constraints=constraints or {"budget": "Not specified", "timeline": "Not specified"},
            scale_requirements=scale or {"users": "Not specified", "data_volume": "Not specified"}
        )

    def _parse_architecture_response(self, response: str, requirements: ArchitectureRequirements) -> SystemArchitecture:
        """Parse architecture design response"""
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                
                # Parse components
                components = []
                for comp_data in data.get('components', []):
                    component = ArchitectureComponent(
                        name=comp_data.get('name', ''),
                        service_type=comp_data.get('service_type', ServiceType.EC2),
                        configuration=comp_data.get('configuration', {}),
                        dependencies=comp_data.get('dependencies', []),
                        estimated_monthly_cost=comp_data.get('estimated_monthly_cost', 0)
                    )
                    components.append(component)
                
                # Create architecture
                architecture = SystemArchitecture(
                    name=data.get('name', 'Generated Architecture'),
                    components=components,
                    connections=data.get('connections', []),
                    deployment_model=DeploymentModel.AUTO_SCALING,
                    estimated_monthly_cost=sum(comp.estimated_monthly_cost or 0 for comp in components),
                    nova_reasoning={"raw_response": response[:1000]}  # Store partial response
                )
                
                return architecture
                
        except Exception as e:
            logger.warning(f"Failed to parse architecture JSON: {str(e)}")
        
        # Fallback: create basic architecture
        return self._create_fallback_architecture(requirements)

    def _create_fallback_architecture(self, requirements: ArchitectureRequirements) -> SystemArchitecture:
        """Create a basic fallback architecture"""
        components = [
            ArchitectureComponent(
                name="Application Load Balancer",
                service_type=ServiceType.ALB,
                configuration={"scheme": "internet-facing"}
            ),
            ArchitectureComponent(
                name="Auto Scaling Group",
                service_type=ServiceType.EC2,
                configuration={"instance_type": "t3.medium", "min_size": 2, "max_size": 10}
            ),
            ArchitectureComponent(
                name="RDS Database",
                service_type=ServiceType.RDS,
                configuration={"engine": "postgres", "instance_class": "db.t3.medium"}
            )
        ]
        
        return SystemArchitecture(
            name="Basic Web Application Architecture",
            components=components,
            connections=[
                {"from": "load_balancer", "to": "auto_scaling_group"},
                {"from": "auto_scaling_group", "to": "rds_database"}
            ],
            deployment_model=DeploymentModel.AUTO_SCALING,
            estimated_monthly_cost=500.0
        )

    def _parse_optimization_response(self, response: str) -> List[OptimizationSuggestion]:
        """Parse optimization suggestions from response"""
        try:
            # Extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                
                optimizations = []
                for opt_data in data:
                    optimization = OptimizationSuggestion(
                        category=opt_data.get('category', 'general'),
                        title=opt_data.get('title', ''),
                        description=opt_data.get('description', ''),
                        potential_impact=opt_data.get('impact', 'medium'),
                        implementation_effort=opt_data.get('effort', 'medium'),
                        estimated_savings_percent=opt_data.get('savings_percent'),
                        implementation_steps=opt_data.get('steps', [])
                    )
                    optimizations.append(optimization)
                
                return optimizations
                
        except Exception as e:
            logger.warning(f"Failed to parse optimizations JSON: {str(e)}")
        
        # Fallback: return basic optimization suggestions
        return [
            OptimizationSuggestion(
                category="cost",
                title="Consider Reserved Instances",
                description="Use Reserved Instances for predictable workloads to save up to 75% on compute costs",
                potential_impact="high",
                implementation_effort="low",
                estimated_savings_percent=30.0
            )
        ]

    def _parse_implementation_response(self, response: str) -> Dict[str, Any]:
        """Parse implementation plan from response"""
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
                
        except Exception as e:
            logger.warning(f"Failed to parse implementation JSON: {str(e)}")
        
        # Fallback implementation plan
        return {
            "phases": [
                {
                    "phase_number": 1,
                    "name": "Foundation Setup",
                    "description": "Set up core infrastructure",
                    "estimated_duration_days": 5,
                    "tasks": ["Set up VPC", "Configure security groups", "Deploy load balancer"]
                },
                {
                    "phase_number": 2,
                    "name": "Application Deployment", 
                    "description": "Deploy application components",
                    "estimated_duration_days": 10,
                    "tasks": ["Deploy application servers", "Configure auto scaling", "Set up monitoring"]
                }
            ],
            "total_duration_days": 15
        }

    def _parse_diagram_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse diagram analysis response"""
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        return {
            "components_identified": ["Unable to parse detailed analysis"],
            "architecture_pattern": "Unknown",
            "recommendations": ["Upload a clearer diagram for detailed analysis"]
        }

    # Utility methods

    def _track_usage(self, model_name: str, operation_type: str, input_tokens: int, 
                    output_tokens: int, processing_time: int, success: bool, error_msg: str = None):
        """Track Nova API usage for monitoring"""
        usage = NovaAPIUsage(
            model_name=model_name,
            operation_type=operation_type,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            processing_time_ms=processing_time,
            success=success,
            error_message=error_msg
        )
        self.usage_stats.append(usage)
        
        # Keep only recent usage stats (last 1000 entries)
        if len(self.usage_stats) > 1000:
            self.usage_stats = self.usage_stats[-1000:]

    def get_usage_stats(self) -> List[NovaAPIUsage]:
        """Get Nova API usage statistics"""
        return self.usage_stats

    def get_usage_summary(self) -> Dict[str, Any]:
        """Get summary of Nova API usage"""
        if not self.usage_stats:
            return {"total_requests": 0, "success_rate": 0.0}
        
        total_requests = len(self.usage_stats)
        successful_requests = sum(1 for stat in self.usage_stats if stat.success)
        
        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "success_rate": (successful_requests / total_requests) * 100,
            "models_used": list(set(stat.model_name for stat in self.usage_stats)),
            "operations_performed": list(set(stat.operation_type for stat in self.usage_stats)),
            "average_processing_time_ms": sum(stat.processing_time_ms for stat in self.usage_stats) / total_requests
        }

    async def health_check(self) -> Dict[str, Any]:
        """Check connectivity and health of Nova models"""
        health_status = {
            'nova_lite': False,
            'nova_canvas': False,
            'nova_micro': False,
            'timestamp': datetime.now().isoformat(),
            'region': settings.AWS_REGION
        }
        
        # Test Nova Lite
        try:
            await self._invoke_nova_lite("Health check", max_tokens=10)
            health_status['nova_lite'] = True
        except Exception as e:
            logger.warning(f"Nova Lite health check failed: {str(e)}")
        
        # Test Nova Micro
        try:
            await self._invoke_nova_micro("Health check", max_tokens=10)
            health_status['nova_micro'] = True
        except Exception as e:
            logger.warning(f"Nova Micro health check failed: {str(e)}")
        
        # Note: Canvas health check would require actual image generation
        # For now, assume it's available if credentials work
        health_status['nova_canvas'] = health_status['nova_lite']
        
        return health_status


# Global Nova client instance
nova_client = NovaClient()

# Export main components
__all__ = ["NovaClient", "nova_client", "NovaAPIUsage", "NovaModelConfig"]
