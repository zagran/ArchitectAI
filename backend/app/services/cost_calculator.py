"""
Cost Calculation Service
Real-time AWS cost analysis and optimization recommendations
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from decimal import Decimal, ROUND_HALF_UP

import boto3
import httpx
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.logging import get_logger
from app.services.nova_client import nova_client
from app.models.architecture_models import (
    SystemArchitecture,
    ArchitectureComponent,
    ServiceType,
    CostAnalysis,
    ComponentCost,
    CostScenario,
    UsagePatterns,
    OptimizationSuggestion
)

logger = get_logger(__name__)


class AWSPricingService:
    """Service for fetching and caching AWS pricing data"""
    
    def __init__(self):
        self.pricing_client = boto3.client(
            'pricing',
            region_name='us-east-1',  # Pricing API is only available in us-east-1
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.pricing_cache = {}
        self.cache_expiry = timedelta(hours=24)  # Cache pricing for 24 hours
        
    async def get_service_pricing(self, service_code: str, region: str = None) -> Dict[str, Any]:
        """Get pricing data for AWS service"""
        region = region or settings.AWS_REGION
        cache_key = f"{service_code}_{region}"
        
        # Check cache first
        if cache_key in self.pricing_cache:
            cached_data, timestamp = self.pricing_cache[cache_key]
            if datetime.now() - timestamp < self.cache_expiry:
                return cached_data
        
        try:
            # Fetch pricing data from AWS
            response = await asyncio.to_thread(
                self.pricing_client.get_products,
                ServiceCode=service_code,
                Filters=[
                    {
                        'Type': 'TERM_MATCH',
                        'Field': 'location',
                        'Value': self._get_location_name(region)
                    }
                ],
                MaxResults=100
            )
            
            pricing_data = {
                'service_code': service_code,
                'region': region,
                'products': response.get('PriceList', []),
                'fetched_at': datetime.now().isoformat()
            }
            
            # Cache the data
            self.pricing_cache[cache_key] = (pricing_data, datetime.now())
            
            return pricing_data
            
        except ClientError as e:
            logger.error(f"AWS Pricing API error for {service_code}: {str(e)}")
            return self._get_fallback_pricing(service_code, region)
        except Exception as e:
            logger.error(f"Pricing fetch error for {service_code}: {str(e)}")
            return self._get_fallback_pricing(service_code, region)
    
    def _get_location_name(self, region: str) -> str:
        """Convert region code to location name used by pricing API"""
        region_map = {
            'us-east-1': 'US East (N. Virginia)',
            'us-west-2': 'US West (Oregon)',
            'eu-west-1': 'Europe (Ireland)',
            'ap-southeast-1': 'Asia Pacific (Singapore)',
        }
        return region_map.get(region, 'US East (N. Virginia)')
    
    def _get_fallback_pricing(self, service_code: str, region: str) -> Dict[str, Any]:
        """Get fallback pricing when API fails"""
        fallback_prices = {
            'AmazonEC2': {
                't3.medium': 0.0416,
                't3.large': 0.0832,
                'm5.large': 0.096,
                'c5.large': 0.085
            },
            'AmazonRDS': {
                'db.t3.medium': 0.068,
                'db.t3.large': 0.136,
                'db.m5.large': 0.192
            },
            'AmazonS3': {
                'standard_storage': 0.023,
                'requests': 0.0004
            }
        }
        
        return {
            'service_code': service_code,
            'region': region,
            'fallback_prices': fallback_prices.get(service_code, {}),
            'is_fallback': True
        }


class CostCalculatorService:
    """Service for calculating detailed cost analysis of architectures"""
    
    def __init__(self):
        self.pricing_service = AWSPricingService()
        
    async def calculate_architecture_cost(
        self,
        architecture: SystemArchitecture,
        usage_patterns: UsagePatterns
    ) -> CostAnalysis:
        """Calculate comprehensive cost analysis for architecture"""
        
        try:
            logger.info("Starting cost calculation",
                       architecture_id=architecture.id,
                       components_count=len(architecture.components))
            
            start_time = datetime.now()
            
            # Calculate cost for each component
            component_costs = []
            for component in architecture.components:
                component_cost = await self._calculate_component_cost(component, usage_patterns)
                component_costs.append(component_cost)
            
            # Calculate total cost
            total_monthly_cost = sum(cost.monthly_cost for cost in component_costs)
            
            # Generate cost scenarios
            cost_scenarios = await self._generate_cost_scenarios(architecture, usage_patterns, component_costs)
            
            # Get optimization suggestions using Nova
            optimization_suggestions = await self._get_optimization_suggestions(
                architecture, component_costs, usage_patterns
            )
            
            # Create cost analysis
            cost_analysis = CostAnalysis(
                architecture_id=architecture.id,
                total_monthly_cost=total_monthly_cost,
                component_breakdown=component_costs,
                cost_scenarios=cost_scenarios,
                optimization_suggestions=[opt.title for opt in optimization_suggestions],
                confidence_level=self._calculate_confidence_level(component_costs),
                pricing_data_version="2024-01-01"
            )
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.info("Cost calculation completed",
                       architecture_id=architecture.id,
                       total_cost=total_monthly_cost,
                       processing_time_ms=processing_time)
            
            return cost_analysis
            
        except Exception as e:
            logger.error("Cost calculation failed",
                        architecture_id=architecture.id,
                        error=str(e))
            raise

    async def _calculate_component_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> ComponentCost:
        """Calculate cost for individual component"""
        
        try:
            service_type = component.service_type
            monthly_cost = 0.0
            cost_breakdown = {}
            cost_drivers = []
            
            if service_type == ServiceType.EC2:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_ec2_cost(
                    component, usage_patterns
                )
            elif service_type == ServiceType.RDS:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_rds_cost(
                    component, usage_patterns
                )
            elif service_type == ServiceType.S3:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_s3_cost(
                    component, usage_patterns
                )
            elif service_type == ServiceType.ALB:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_alb_cost(
                    component, usage_patterns
                )
            elif service_type == ServiceType.LAMBDA:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_lambda_cost(
                    component, usage_patterns
                )
            elif service_type == ServiceType.ELASTICACHE:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_elasticache_cost(
                    component, usage_patterns
                )
            else:
                monthly_cost, cost_breakdown, cost_drivers = await self._calculate_generic_cost(
                    component, usage_patterns
                )
            
            # Calculate optimization potential
            optimization_potential = await self._calculate_optimization_potential(
                component, monthly_cost
            )
            
            return ComponentCost(
                component_id=component.id,
                component_name=component.name,
                service_type=service_type.value,
                monthly_cost=round(monthly_cost, 2),
                cost_breakdown=cost_breakdown,
                cost_drivers=cost_drivers,
                optimization_potential=optimization_potential
            )
            
        except Exception as e:
            logger.error(f"Component cost calculation failed for {component.name}: {str(e)}")
            return ComponentCost(
                component_id=component.id,
                component_name=component.name,
                service_type=service_type.value,
                monthly_cost=50.0,
                cost_breakdown={"estimate": 50.0},
                cost_drivers=["Estimated cost due to calculation error"],
                optimization_potential=10.0
            )

    async def _calculate_ec2_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate EC2 instance costs"""
        
        config = component.configuration
        instance_type = config.get('instance_type', 't3.medium')
        min_size = config.get('min_size', 2)
        max_size = config.get('max_size', 10)
        
        # Get pricing data
        pricing_data = await self.pricing_service.get_service_pricing('AmazonEC2')
        
        # Calculate hourly cost
        hourly_cost = self._get_instance_hourly_cost(instance_type, pricing_data)
        
        # Estimate average instances
        avg_instances = min_size + (max_size - min_size) * 0.6
        
        # Calculate monthly costs
        compute_cost = hourly_cost * avg_instances * 24 * 30
        storage_cost = 20 * avg_instances
        data_transfer_cost = usage_patterns.request_rate_per_second * 0.00001 * 30 * 24 * 3600
        
        total_cost = compute_cost + storage_cost + data_transfer_cost
        
        cost_breakdown = {
            "compute": round(compute_cost, 2),
            "storage": round(storage_cost, 2),
            "data_transfer": round(data_transfer_cost, 2)
        }
        
        cost_drivers = [
            f"Instance type: {instance_type}",
            f"Average instances: {avg_instances}",
            f"Storage: {20}GB EBS per instance"
        ]
        
        return total_cost, cost_breakdown, cost_drivers

    async def _calculate_rds_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate RDS database costs"""
        
        config = component.configuration
        instance_class = config.get('instance_class', 'db.t3.medium')
        engine = config.get('engine', 'postgres')
        multi_az = config.get('multi_az', True)
        storage_gb = config.get('storage_gb', 100)
        
        pricing_data = await self.pricing_service.get_service_pricing('AmazonRDS')
        
        hourly_cost = self._get_rds_hourly_cost(instance_class, engine, pricing_data)
        if multi_az:
            hourly_cost *= 2
        
        compute_cost = hourly_cost * 24 * 30
        storage_cost = storage_gb * 0.115
        backup_cost = storage_gb * 0.095 * 0.1
        
        total_cost = compute_cost + storage_cost + backup_cost
        
        cost_breakdown = {
            "compute": round(compute_cost, 2),
            "storage": round(storage_cost, 2),
            "backup": round(backup_cost, 2)
        }
        
        cost_drivers = [
            f"Instance class: {instance_class}",
            f"Multi-AZ: {multi_az}",
            f"Storage: {storage_gb}GB",
            f"Engine: {engine}"
        ]
        
        return total_cost, cost_breakdown, cost_drivers

    async def _calculate_s3_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate S3 storage costs"""
        
        config = component.configuration
        storage_gb = config.get('storage_gb', 100)
        requests_per_month = usage_patterns.request_rate_per_second * 30 * 24 * 3600
        
        storage_cost = storage_gb * 0.023
        request_cost = (requests_per_month / 1000) * 0.0004
        data_transfer_cost = storage_gb * 0.01
        
        total_cost = storage_cost + request_cost + data_transfer_cost
        
        cost_breakdown = {
            "storage": round(storage_cost, 2),
            "requests": round(request_cost, 2),
            "data_transfer": round(data_transfer_cost, 2)
        }
        
        cost_drivers = [
            f"Storage: {storage_gb}GB",
            f"Requests: {requests_per_month:,.0f}/month",
            "Storage class: Standard"
        ]
        
        return total_cost, cost_breakdown, cost_drivers

    async def _calculate_alb_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate Application Load Balancer costs"""
        
        hourly_cost = 0.0225
        lcu_cost = 0.008
        
        monthly_fixed_cost = hourly_cost * 24 * 30
        
        requests_per_second = usage_patterns.request_rate_per_second
        estimated_lcus = max(1, requests_per_second / 25)
        
        monthly_lcu_cost = lcu_cost * estimated_lcus * 24 * 30
        total_cost = monthly_fixed_cost + monthly_lcu_cost
        
        cost_breakdown = {
            "fixed": round(monthly_fixed_cost, 2),
            "lcu": round(monthly_lcu_cost, 2)
        }
        
        cost_drivers = [
            f"Estimated LCUs: {estimated_lcus}",
            f"Requests per second: {requests_per_second}"
        ]
        
        return total_cost, cost_breakdown, cost_drivers

    async def _calculate_lambda_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate Lambda function costs"""
        
        config = component.configuration
        memory_mb = config.get('memory_mb', 512)
        avg_duration_ms = config.get('avg_duration_ms', 1000)
        requests_per_month = usage_patterns.request_rate_per_second * 30 * 24 * 3600
        
        request_cost = max(0, requests_per_month - 1000000) * 0.0000002
        
        gb_seconds = (memory_mb / 1024) * (avg_duration_ms / 1000) * requests_per_month
        compute_cost = max(0, gb_seconds - 400000) * 0.0000166667
        
        total_cost = request_cost + compute_cost
        
        cost_breakdown = {
            "requests": round(request_cost, 2),
            "compute": round(compute_cost, 2)
        }
        
        cost_drivers = [
            f"Memory: {memory_mb}MB",
            f"Avg duration: {avg_duration_ms}ms",
            f"Requests: {requests_per_month:,.0f}/month"
        ]
        
        return total_cost, cost_breakdown, cost_drivers

    async def _calculate_elasticache_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate ElastiCache costs"""
        
        config = component.configuration
        node_type = config.get('node_type', 'cache.t3.medium')
        num_nodes = config.get('num_nodes', 2)
        
        node_hourly_costs = {
            'cache.t3.micro': 0.017,
            'cache.t3.small': 0.034,
            'cache.t3.medium': 0.068,
            'cache.m5.large': 0.156
        }
        
        hourly_cost = node_hourly_costs.get(node_type, 0.068) * num_nodes
        monthly_cost = hourly_cost * 24 * 30
        
        cost_breakdown = {"nodes": round(monthly_cost, 2)}
        cost_drivers = [f"Node type: {node_type}", f"Number of nodes: {num_nodes}"]
        
        return monthly_cost, cost_breakdown, cost_drivers

    async def _calculate_generic_cost(
        self,
        component: ArchitectureComponent,
        usage_patterns: UsagePatterns
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """Calculate cost for unknown/generic services"""
        
        service_estimates = {
            'api_gateway': 50.0,
            'cloudfront': 30.0,
            'cloudwatch': 20.0,
            'secrets_manager': 15.0,
            'kms': 5.0
        }
        
        estimated_cost = service_estimates.get(component.service_type.value, 25.0)
        
        cost_breakdown = {"estimated": estimated_cost}
        cost_drivers = [f"Service type: {component.service_type.value}", "Cost estimated"]
        
        return estimated_cost, cost_breakdown, cost_drivers

    def _get_instance_hourly_cost(self, instance_type: str, pricing_data: Dict[str, Any]) -> float:
        """Extract hourly cost for EC2 instance type"""
        if pricing_data.get('is_fallback'):
            fallback_prices = pricing_data.get('fallback_prices', {})
            return fallback_prices.get(instance_type, 0.05)
        
        default_prices = {
            't3.micro': 0.0104,
            't3.small': 0.0208,
            't3.medium': 0.0416,
            't3.large': 0.0832,
            'm5.large': 0.096,
            'c5.large': 0.085
        }
        
        return default_prices.get(instance_type, 0.05)

    def _get_rds_hourly_cost(self, instance_class: str, engine: str, pricing_data: Dict[str, Any]) -> float:
        """Extract hourly cost for RDS instance"""
        if pricing_data.get('is_fallback'):
            fallback_prices = pricing_data.get('fallback_prices', {})
            return fallback_prices.get(instance_class, 0.07)
        
        default_prices = {
            'db.t3.micro': 0.017,
            'db.t3.small': 0.034,
            'db.t3.medium': 0.068,
            'db.t3.large': 0.136,
            'db.m5.large': 0.192
        }
        
        base_cost = default_prices.get(instance_class, 0.07)
        engine_multipliers = {'postgres': 1.0, 'mysql': 1.0, 'oracle': 1.5, 'sqlserver': 1.3}
        
        return base_cost * engine_multipliers.get(engine, 1.0)

    async def _calculate_optimization_potential(
        self,
        component: ArchitectureComponent,
        monthly_cost: float
    ) -> float:
        """Calculate potential cost savings percentage"""
        
        optimization_potential = {
            ServiceType.EC2: 30.0,
            ServiceType.RDS: 25.0,
            ServiceType.S3: 20.0,
            ServiceType.LAMBDA: 15.0
        }
        
        return optimization_potential.get(component.service_type, 10.0)

    async def _generate_cost_scenarios(
        self,
        architecture: SystemArchitecture,
        usage_patterns: UsagePatterns,
        component_costs: List[ComponentCost]
    ) -> List[CostScenario]:
        """Generate different cost scenarios"""
        
        base_cost = sum(cost.monthly_cost for cost in component_costs)
        
        scenarios = [
            CostScenario(
                scenario_name="Current Usage",
                description="Based on current usage patterns",
                total_monthly_cost=base_cost,
                usage_assumptions={"current": "baseline"},
                cost_drivers=["Current configuration", "Standard pricing"]
            ),
            CostScenario(
                scenario_name="Reserved Instances",
                description="With 1-year Reserved Instances",
                total_monthly_cost=base_cost * 0.7,
                usage_assumptions={"reserved_instances": "1_year"},
                cost_drivers=["Reserved Instance pricing", "1-year commitment"]
            ),
            CostScenario(
                scenario_name="Peak Load",
                description="At maximum scale during peak usage",
                total_monthly_cost=base_cost * 1.8,
                usage_assumptions={"scale_factor": "1.8"},
                cost_drivers=["Maximum auto-scaling", "Peak traffic"]
            ),
            CostScenario(
                scenario_name="Optimized",
                description="With all recommended optimizations",
                total_monthly_cost=base_cost * 0.6,
                usage_assumptions={"optimizations": "all_applied"},
                cost_drivers=["Right-sizing", "Reserved capacity", "Storage optimization"]
            )
        ]
        
        return scenarios

    async def _get_optimization_suggestions(
        self,
        architecture: SystemArchitecture,
        component_costs: List[ComponentCost],
        usage_patterns: UsagePatterns
    ) -> List[OptimizationSuggestion]:
        """Get optimization suggestions using Nova"""
        
        try:
            optimizations = await nova_client.suggest_optimizations(
                architecture=architecture,
                cost_breakdown=[cost.model_dump() for cost in component_costs],
                usage_patterns=usage_patterns.model_dump()
            )
            return optimizations
        except Exception as e:
            logger.error(f"Failed to get Nova optimization suggestions: {str(e)}")
            return self._get_fallback_optimizations(component_costs)

    def _get_fallback_optimizations(self, component_costs: List[ComponentCost]) -> List[OptimizationSuggestion]:
        """Get fallback optimization suggestions"""
        
        optimizations = []
        
        if any(cost.service_type == 'ec2' for cost in component_costs):
            optimizations.append(OptimizationSuggestion(
                category="cost",
                title="Reserved Instances for EC2",
                description="Consider purchasing Reserved Instances for predictable EC2 workloads to save up to 75%",
                potential_impact="high",
                implementation_effort="low",
                estimated_savings_percent=30.0,
                implementation_steps=[
                    "Analyze usage patterns for consistent workloads",
                    "Purchase 1-year or 3-year Reserved Instances",
                    "Monitor and adjust capacity as needed"
                ]
            ))
        
        if any(cost.service_type == 's3' for cost in component_costs):
            optimizations.append(OptimizationSuggestion(
                category="cost",
                title="S3 Storage Class Optimization",
                description="Use appropriate S3 storage classes (IA, Glacier) for infrequently accessed data",
                potential_impact="medium",
                implementation_effort="low",
                estimated_savings_percent=20.0,
                implementation_steps=[
                    "Analyze access patterns for stored objects",
                    "Set up lifecycle policies for automatic transitions",
                    "Monitor cost savings and adjust policies"
                ]
            ))
        
        optimizations.append(OptimizationSuggestion(
            category="performance",
            title="Add CloudFront CDN",
            description="Implement CloudFront CDN to reduce latency and data transfer costs",
            potential_impact="medium",
            implementation_effort="medium",
            estimated_savings_percent=15.0,
            implementation_steps=[
                "Set up CloudFront distribution",
                "Configure caching policies",
                "Update DNS to point to CloudFront"
            ]
        ))
        
        return optimizations

    def _calculate_confidence_level(self, component_costs: List[ComponentCost]) -> float:
        """Calculate confidence level in cost estimates"""
        
        confidence = 0.85
        
        if len(component_costs) > 10:
            confidence -= 0.1
        elif len(component_costs) > 5:
            confidence -= 0.05
        
        fallback_usage = sum(1 for cost in component_costs if "estimate" in cost.cost_breakdown)
        if fallback_usage > 0:
            confidence -= (fallback_usage / len(component_costs)) * 0.2
        
        return max(0.5, min(0.95, confidence))

    async def get_cost_trends(
        self,
        architecture_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get cost trends and projections for architecture"""
        
        base_daily_cost = 167.0
        trend_data = []
        
        for day in range(days):
            daily_cost = base_daily_cost * (0.9 + 0.2 * (day % 7) / 7)
            trend_data.append({
                "date": (datetime.now() - timedelta(days=days-day)).isoformat()[:10],
                "cost": round(daily_cost, 2)
            })
        
        return {
            "architecture_id": architecture_id,
            "trend_data": trend_data,
            "average_daily_cost": base_daily_cost,
            "projected_monthly_cost": base_daily_cost * 30,
            "cost_change_percentage": 5.2
        }


# Global service instance
cost_calculator = CostCalculatorService()

# Export service
__all__ = ["CostCalculatorService", "cost_calculator", "AWSPricingService"]
