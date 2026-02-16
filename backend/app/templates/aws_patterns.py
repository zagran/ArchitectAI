"""
AWS Architecture Patterns Library
Predefined architecture patterns and templates for common use cases
"""

from typing import Dict, List, Any
from app.models.architecture_models import ServiceType, DeploymentModel


class AWSPatternLibrary:
    """
    Library of AWS architecture patterns for different use cases
    Each pattern includes components, connections, and best practices
    """
    
    def get_web_application_pattern(self) -> Dict[str, Any]:
        """Standard web application pattern with load balancer, auto scaling, and database"""
        return {
            "name": "Web Application Pattern",
            "description": "Scalable web application with load balancing and database",
            "use_cases": ["E-commerce sites", "Content management systems", "SaaS applications"],
            "components": [
                {
                    "type": ServiceType.ALB.value,
                    "name": "Application Load Balancer",
                    "configuration": {
                        "scheme": "internet-facing",
                        "type": "application",
                        "cross_zone_load_balancing": True
                    }
                },
                {
                    "type": ServiceType.EC2.value,
                    "name": "Web Servers Auto Scaling Group",
                    "configuration": {
                        "instance_type": "t3.medium",
                        "min_size": 2,
                        "max_size": 10,
                        "desired_capacity": 3,
                        "health_check_type": "ELB"
                    }
                },
                {
                    "type": ServiceType.RDS.value,
                    "name": "Primary Database",
                    "configuration": {
                        "engine": "postgres",
                        "instance_class": "db.t3.medium",
                        "multi_az": True,
                        "backup_retention": 7,
                        "storage_gb": 100
                    }
                },
                {
                    "type": ServiceType.ELASTICACHE.value,
                    "name": "Redis Cache",
                    "configuration": {
                        "node_type": "cache.t3.medium",
                        "num_nodes": 2,
                        "replication_groups": True
                    }
                },
                {
                    "type": ServiceType.S3.value,
                    "name": "Static Assets Storage",
                    "configuration": {
                        "storage_class": "standard",
                        "versioning": True,
                        "lifecycle_policies": True
                    }
                }
            ],
            "connections": [
                {"from": "internet", "to": "Application Load Balancer", "protocol": "HTTPS"},
                {"from": "Application Load Balancer", "to": "Web Servers Auto Scaling Group", "protocol": "HTTP"},
                {"from": "Web Servers Auto Scaling Group", "to": "Primary Database", "protocol": "PostgreSQL"},
                {"from": "Web Servers Auto Scaling Group", "to": "Redis Cache", "protocol": "Redis"},
                {"from": "Web Servers Auto Scaling Group", "to": "Static Assets Storage", "protocol": "S3 API"}
            ],
            "deployment_model": DeploymentModel.AUTO_SCALING.value,
            "estimated_monthly_cost_range": "$200-800",
            "complexity_level": "intermediate"
        }
    
    def get_microservices_pattern(self) -> Dict[str, Any]:
        """Microservices architecture pattern with container orchestration"""
        return {
            "name": "Microservices Pattern",
            "description": "Container-based microservices with service discovery and API gateway",
            "use_cases": ["Large-scale applications", "Multi-team development", "Independent deployments"],
            "components": [
                {
                    "type": ServiceType.API_GATEWAY.value,
                    "name": "API Gateway",
                    "configuration": {
                        "type": "REST",
                        "throttling": True,
                        "caching": True,
                        "authorization": "IAM"
                    }
                },
                {
                    "type": ServiceType.ECS.value,
                    "name": "User Service",
                    "configuration": {
                        "launch_type": "FARGATE",
                        "cpu": "256",
                        "memory": "512",
                        "desired_count": 2
                    }
                },
                {
                    "type": ServiceType.ECS.value,
                    "name": "Order Service",
                    "configuration": {
                        "launch_type": "FARGATE",
                        "cpu": "512",
                        "memory": "1024",
                        "desired_count": 3
                    }
                },
                {
                    "type": ServiceType.ECS.value,
                    "name": "Payment Service",
                    "configuration": {
                        "launch_type": "FARGATE",
                        "cpu": "256",
                        "memory": "512",
                        "desired_count": 2
                    }
                },
                {
                    "type": ServiceType.RDS.value,
                    "name": "User Database",
                    "configuration": {
                        "engine": "postgres",
                        "instance_class": "db.t3.small",
                        "multi_az": False
                    }
                },
                {
                    "type": ServiceType.DYNAMODB.value,
                    "name": "Order Database",
                    "configuration": {
                        "billing_mode": "PAY_PER_REQUEST",
                        "point_in_time_recovery": True
                    }
                }
            ],
            "connections": [
                {"from": "client", "to": "API Gateway", "protocol": "HTTPS"},
                {"from": "API Gateway", "to": "User Service", "protocol": "HTTP"},
                {"from": "API Gateway", "to": "Order Service", "protocol": "HTTP"},
                {"from": "API Gateway", "to": "Payment Service", "protocol": "HTTP"},
                {"from": "User Service", "to": "User Database", "protocol": "PostgreSQL"},
                {"from": "Order Service", "to": "Order Database", "protocol": "DynamoDB API"},
                {"from": "Order Service", "to": "Payment Service", "protocol": "HTTP"}
            ],
            "deployment_model": DeploymentModel.CONTAINERIZED.value,
            "estimated_monthly_cost_range": "$500-2000",
            "complexity_level": "advanced"
        }
    
    def get_serverless_pattern(self) -> Dict[str, Any]:
        """Serverless architecture pattern with Lambda functions"""
        return {
            "name": "Serverless Pattern",
            "description": "Event-driven serverless architecture with Lambda functions",
            "use_cases": ["Event processing", "API backends", "Data processing pipelines"],
            "components": [
                {
                    "type": ServiceType.API_GATEWAY.value,
                    "name": "REST API Gateway",
                    "configuration": {
                        "type": "REST",
                        "stage": "prod",
                        "throttling": True
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "API Handler Function",
                    "configuration": {
                        "runtime": "python3.9",
                        "memory_mb": 512,
                        "timeout_seconds": 30
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "Data Processor Function",
                    "configuration": {
                        "runtime": "python3.9",
                        "memory_mb": 1024,
                        "timeout_seconds": 300
                    }
                },
                {
                    "type": ServiceType.DYNAMODB.value,
                    "name": "Main Database",
                    "configuration": {
                        "billing_mode": "PAY_PER_REQUEST",
                        "stream": True
                    }
                },
                {
                    "type": ServiceType.S3.value,
                    "name": "Data Lake",
                    "configuration": {
                        "storage_class": "standard",
                        "event_notifications": True
                    }
                }
            ],
            "connections": [
                {"from": "client", "to": "REST API Gateway", "protocol": "HTTPS"},
                {"from": "REST API Gateway", "to": "API Handler Function", "protocol": "Lambda Invoke"},
                {"from": "API Handler Function", "to": "Main Database", "protocol": "DynamoDB API"},
                {"from": "Main Database", "to": "Data Processor Function", "protocol": "DynamoDB Stream"},
                {"from": "Data Processor Function", "to": "Data Lake", "protocol": "S3 API"}
            ],
            "deployment_model": DeploymentModel.SERVERLESS.value,
            "estimated_monthly_cost_range": "$50-300",
            "complexity_level": "intermediate"
        }
    
    def get_data_processing_pattern(self) -> Dict[str, Any]:
        """Big data processing pattern with analytics and ETL"""
        return {
            "name": "Data Processing Pattern",
            "description": "Scalable data processing and analytics pipeline",
            "use_cases": ["ETL pipelines", "Real-time analytics", "Data warehousing"],
            "components": [
                {
                    "type": "kinesis_data_streams",
                    "name": "Data Ingestion Stream",
                    "configuration": {
                        "shards": 4,
                        "retention_hours": 24
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "Stream Processor",
                    "configuration": {
                        "runtime": "python3.9",
                        "memory_mb": 1024,
                        "timeout_seconds": 300,
                        "concurrent_executions": 100
                    }
                },
                {
                    "type": "redshift",
                    "name": "Data Warehouse",
                    "configuration": {
                        "node_type": "dc2.large",
                        "number_of_nodes": 2,
                        "encrypted": True
                    }
                },
                {
                    "type": ServiceType.S3.value,
                    "name": "Data Lake Storage",
                    "configuration": {
                        "storage_classes": ["standard", "intelligent_tiering"],
                        "lifecycle_policies": True
                    }
                },
                {
                    "type": "glue",
                    "name": "ETL Jobs",
                    "configuration": {
                        "worker_type": "Standard",
                        "number_of_workers": 10
                    }
                }
            ],
            "connections": [
                {"from": "data_sources", "to": "Data Ingestion Stream", "protocol": "Kinesis API"},
                {"from": "Data Ingestion Stream", "to": "Stream Processor", "protocol": "Kinesis Trigger"},
                {"from": "Stream Processor", "to": "Data Lake Storage", "protocol": "S3 API"},
                {"from": "ETL Jobs", "to": "Data Lake Storage", "protocol": "S3 API"},
                {"from": "ETL Jobs", "to": "Data Warehouse", "protocol": "Redshift API"}
            ],
            "deployment_model": DeploymentModel.SERVERLESS.value,
            "estimated_monthly_cost_range": "$300-1500",
            "complexity_level": "advanced"
        }
    
    def get_realtime_pattern(self) -> Dict[str, Any]:
        """Real-time application pattern with WebSockets and streaming"""
        return {
            "name": "Real-time Application Pattern",
            "description": "Real-time communication with WebSockets and event streaming",
            "use_cases": ["Chat applications", "Live dashboards", "Gaming", "Collaboration tools"],
            "components": [
                {
                    "type": ServiceType.API_GATEWAY.value,
                    "name": "WebSocket API Gateway",
                    "configuration": {
                        "protocol": "websocket",
                        "route_selection": "$request.body.action"
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "Connection Manager",
                    "configuration": {
                        "runtime": "nodejs18.x",
                        "memory_mb": 256,
                        "timeout_seconds": 30
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "Message Handler",
                    "configuration": {
                        "runtime": "nodejs18.x",
                        "memory_mb": 512,
                        "timeout_seconds": 30
                    }
                },
                {
                    "type": ServiceType.DYNAMODB.value,
                    "name": "Connection Store",
                    "configuration": {
                        "billing_mode": "PAY_PER_REQUEST",
                        "ttl_enabled": True
                    }
                },
                {
                    "type": ServiceType.ELASTICACHE.value,
                    "name": "Message Cache",
                    "configuration": {
                        "node_type": "cache.t3.micro",
                        "num_nodes": 2,
                        "engine": "redis"
                    }
                }
            ],
            "connections": [
                {"from": "client", "to": "WebSocket API Gateway", "protocol": "WSS"},
                {"from": "WebSocket API Gateway", "to": "Connection Manager", "protocol": "Lambda Invoke"},
                {"from": "WebSocket API Gateway", "to": "Message Handler", "protocol": "Lambda Invoke"},
                {"from": "Connection Manager", "to": "Connection Store", "protocol": "DynamoDB API"},
                {"from": "Message Handler", "to": "Message Cache", "protocol": "Redis"},
                {"from": "Message Handler", "to": "Connection Store", "protocol": "DynamoDB API"}
            ],
            "deployment_model": DeploymentModel.SERVERLESS.value,
            "estimated_monthly_cost_range": "$100-500",
            "complexity_level": "intermediate"
        }
    
    def get_static_website_pattern(self) -> Dict[str, Any]:
        """Static website pattern with CDN and global distribution"""
        return {
            "name": "Static Website Pattern",
            "description": "High-performance static website with global CDN",
            "use_cases": ["Documentation sites", "Marketing pages", "Blogs", "SPAs"],
            "components": [
                {
                    "type": ServiceType.S3.value,
                    "name": "Website Hosting Bucket",
                    "configuration": {
                        "website_hosting": True,
                        "versioning": True,
                        "public_read_access": True
                    }
                },
                {
                    "type": ServiceType.CLOUDFRONT.value,
                    "name": "CDN Distribution",
                    "configuration": {
                        "price_class": "PriceClass_All",
                        "caching": True,
                        "compression": True,
                        "ssl_certificate": "AWS_MANAGED"
                    }
                },
                {
                    "type": "route53",
                    "name": "DNS Management",
                    "configuration": {
                        "hosted_zone": True,
                        "health_checks": True
                    }
                }
            ],
            "connections": [
                {"from": "users", "to": "CDN Distribution", "protocol": "HTTPS"},
                {"from": "CDN Distribution", "to": "Website Hosting Bucket", "protocol": "S3 API"},
                {"from": "DNS Management", "to": "CDN Distribution", "protocol": "DNS"}
            ],
            "deployment_model": DeploymentModel.SINGLE_INSTANCE.value,
            "estimated_monthly_cost_range": "$5-50",
            "complexity_level": "simple"
        }
    
    def get_machine_learning_pattern(self) -> Dict[str, Any]:
        """Machine learning pipeline pattern with model training and inference"""
        return {
            "name": "Machine Learning Pattern",
            "description": "End-to-end ML pipeline with training, deployment, and inference",
            "use_cases": ["Model training", "Real-time inference", "Batch predictions"],
            "components": [
                {
                    "type": "sagemaker",
                    "name": "Training Jobs",
                    "configuration": {
                        "instance_type": "ml.m5.large",
                        "training_framework": "tensorflow"
                    }
                },
                {
                    "type": "sagemaker",
                    "name": "Model Registry",
                    "configuration": {
                        "model_versioning": True,
                        "approval_workflow": True
                    }
                },
                {
                    "type": "sagemaker",
                    "name": "Inference Endpoint",
                    "configuration": {
                        "instance_type": "ml.t2.medium",
                        "auto_scaling": True
                    }
                },
                {
                    "type": ServiceType.S3.value,
                    "name": "ML Data Storage",
                    "configuration": {
                        "storage_classes": ["standard", "intelligent_tiering"],
                        "lifecycle_policies": True
                    }
                },
                {
                    "type": ServiceType.LAMBDA.value,
                    "name": "Inference Function",
                    "configuration": {
                        "runtime": "python3.9",
                        "memory_mb": 1024,
                        "timeout_seconds": 60
                    }
                }
            ],
            "connections": [
                {"from": "Training Jobs", "to": "ML Data Storage", "protocol": "S3 API"},
                {"from": "Training Jobs", "to": "Model Registry", "protocol": "SageMaker API"},
                {"from": "Model Registry", "to": "Inference Endpoint", "protocol": "SageMaker API"},
                {"from": "Inference Function", "to": "Inference Endpoint", "protocol": "HTTPS"},
                {"from": "client", "to": "Inference Function", "protocol": "Lambda Invoke"}
            ],
            "deployment_model": DeploymentModel.HYBRID.value,
            "estimated_monthly_cost_range": "$200-1000",
            "complexity_level": "advanced"
        }
    
    def get_all_patterns(self) -> List[Dict[str, Any]]:
        """Get all available architecture patterns"""
        return [
            self.get_web_application_pattern(),
            self.get_microservices_pattern(),
            self.get_serverless_pattern(),
            self.get_data_processing_pattern(),
            self.get_realtime_pattern(),
            self.get_static_website_pattern(),
            self.get_machine_learning_pattern()
        ]
    
    def get_pattern_by_use_case(self, use_case: str) -> List[Dict[str, Any]]:
        """Get patterns that match a specific use case"""
        all_patterns = self.get_all_patterns()
        matching_patterns = []
        
        use_case_lower = use_case.lower()
        
        for pattern in all_patterns:
            pattern_use_cases = [uc.lower() for uc in pattern.get("use_cases", [])]
            if any(use_case_lower in puc or puc in use_case_lower for puc in pattern_use_cases):
                matching_patterns.append(pattern)
        
        return matching_patterns
    
    def get_patterns_by_complexity(self, complexity: str) -> List[Dict[str, Any]]:
        """Get patterns by complexity level"""
        all_patterns = self.get_all_patterns()
        return [p for p in all_patterns if p.get("complexity_level") == complexity]
    
    def get_security_recommendations(self, pattern_name: str) -> List[str]:
        """Get security recommendations for a specific pattern"""
        security_recommendations = {
            "Web Application Pattern": [
                "Enable AWS WAF for web application firewall",
                "Use SSL/TLS certificates for all communication",
                "Implement proper IAM roles and policies",
                "Enable VPC with private subnets for backend services",
                "Configure security groups with minimal required access",
                "Enable CloudTrail for audit logging",
                "Use AWS Secrets Manager for database credentials"
            ],
            "Microservices Pattern": [
                "Implement service-to-service authentication",
                "Use AWS App Mesh for service mesh security",
                "Enable container image scanning",
                "Implement proper network segmentation",
                "Use IAM roles for service accounts",
                "Enable distributed tracing with AWS X-Ray",
                "Implement rate limiting and throttling"
            ],
            "Serverless Pattern": [
                "Use AWS Lambda execution role with minimal permissions",
                "Enable AWS API Gateway authorization",
                "Implement proper CORS policies",
                "Use AWS KMS for encryption at rest",
                "Enable VPC endpoints for private communication",
                "Implement proper error handling and logging",
                "Use AWS Secrets Manager for API keys"
            ]
        }
        
        return security_recommendations.get(pattern_name, [
            "Implement principle of least privilege",
            "Enable encryption at rest and in transit",
            "Use strong authentication and authorization",
            "Implement comprehensive logging and monitoring",
            "Regular security assessments and updates"
        ])
    
    def get_monitoring_recommendations(self, pattern_name: str) -> List[str]:
        """Get monitoring recommendations for a specific pattern"""
        monitoring_recommendations = {
            "Web Application Pattern": [
                "Set up CloudWatch alarms for key metrics",
                "Enable Application Load Balancer access logs",
                "Monitor database performance with Performance Insights",
                "Set up custom metrics for business KPIs",
                "Implement health checks for all services",
                "Use AWS X-Ray for distributed tracing"
            ],
            "Microservices Pattern": [
                "Implement distributed tracing across services",
                "Set up service-level metrics and alerting",
                "Monitor container resource utilization",
                "Track inter-service communication patterns",
                "Implement centralized logging with CloudWatch Logs",
                "Set up business metrics dashboards"
            ],
            "Serverless Pattern": [
                "Monitor Lambda function duration and errors",
                "Track API Gateway response times and errors",
                "Set up DynamoDB throttling alerts",
                "Monitor cold start metrics",
                "Implement custom business metrics",
                "Use CloudWatch Insights for log analysis"
            ]
        }
        
        return monitoring_recommendations.get(pattern_name, [
            "Set up comprehensive CloudWatch monitoring",
            "Implement health checks and alerting",
            "Monitor key performance indicators",
            "Set up log aggregation and analysis",
            "Create operational dashboards"
        ])


# Global pattern library instance
pattern_library = AWSPatternLibrary()

# Export library
__all__ = ["AWSPatternLibrary", "pattern_library"]
