"""
Diagram Generator Service
Generates professional AWS architecture diagrams using the diagrams library (Graphviz-backed)
"""

import asyncio
import base64
import importlib
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, Tuple

from app.core.logging import get_logger
from app.models.architecture_models import SystemArchitecture

logger = get_logger(__name__)

# Maps ServiceType values → (diagrams module path, class name)
_SERVICE_NODE_MAP: Dict[str, Tuple[str, str]] = {
    "ec2":              ("diagrams.aws.compute",     "EC2"),
    "ecs":              ("diagrams.aws.compute",     "ECS"),
    "eks":              ("diagrams.aws.compute",     "EKS"),
    "fargate":          ("diagrams.aws.compute",     "Fargate"),
    "lambda":           ("diagrams.aws.compute",     "Lambda"),
    "batch":            ("diagrams.aws.compute",     "Batch"),
    "s3":               ("diagrams.aws.storage",     "S3"),
    "ebs":              ("diagrams.aws.storage",     "EBS"),
    "efs":              ("diagrams.aws.storage",     "EFS"),
    "rds":              ("diagrams.aws.database",    "RDS"),
    "aurora":           ("diagrams.aws.database",    "Aurora"),
    "dynamodb":         ("diagrams.aws.database",    "Dynamodb"),
    "elasticache":      ("diagrams.aws.database",    "ElastiCache"),
    "documentdb":       ("diagrams.aws.database",    "DocumentDB"),
    "redshift":         ("diagrams.aws.database",    "Redshift"),
    "alb":              ("diagrams.aws.network",     "ALB"),
    "nlb":              ("diagrams.aws.network",     "NLB"),
    "cloudfront":       ("diagrams.aws.network",     "CloudFront"),
    "api_gateway":      ("diagrams.aws.network",     "APIGateway"),
    "route53":          ("diagrams.aws.network",     "Route53"),
    "nat_gateway":      ("diagrams.aws.network",     "NATGateway"),
    "internet_gateway": ("diagrams.aws.network",     "InternetGateway"),
    "transit_gateway":  ("diagrams.aws.network",     "TransitGateway"),
    "sqs":              ("diagrams.aws.integration", "SQS"),
    "sns":              ("diagrams.aws.integration", "SNS"),
    "eventbridge":      ("diagrams.aws.integration", "Eventbridge"),
    "step_functions":   ("diagrams.aws.integration", "StepFunctions"),
    "mq":               ("diagrams.aws.integration", "MQ"),
    "kinesis":          ("diagrams.aws.analytics",   "Kinesis"),
    "msk":              ("diagrams.aws.analytics",   "ManagedStreamingForApacheKafka"),
    "athena":           ("diagrams.aws.analytics",   "Athena"),
    "glue":             ("diagrams.aws.analytics",   "Glue"),
    "opensearch":       ("diagrams.aws.analytics",   "ElasticsearchService"),
    "iam":              ("diagrams.aws.security",    "IAM"),
    "kms":              ("diagrams.aws.security",    "KMS"),
    "secrets_manager":  ("diagrams.aws.security",    "SecretsManager"),
    "waf":              ("diagrams.aws.security",    "WAF"),
    "shield":           ("diagrams.aws.security",    "Shield"),
    "cognito":          ("diagrams.aws.security",    "Cognito"),
    "cloudwatch":       ("diagrams.aws.management",  "Cloudwatch"),
    "cloudtrail":       ("diagrams.aws.management",  "CloudTrail"),
    "x_ray":            ("diagrams.aws.devtools",    "XRay"),
    "sagemaker":        ("diagrams.aws.ml",          "Sagemaker"),
    "codepipeline":     ("diagrams.aws.devtools",    "Codepipeline"),
    "codebuild":        ("diagrams.aws.devtools",    "Codebuild"),
}


def _get_node_class(service_type: str):
    """Return the diagrams node class for a service type, with fallback to General."""
    entry = _SERVICE_NODE_MAP.get(service_type)
    if entry:
        module_path, class_name = entry
        try:
            module = importlib.import_module(module_path)
            return getattr(module, class_name)
        except (ImportError, AttributeError) as e:
            logger.warning(f"Could not import {module_path}.{class_name}: {e}")
    # Fallback
    try:
        from diagrams.aws.general import General
        return General
    except ImportError:
        from diagrams.aws.compute import EC2
        return EC2


def _render_sync(architecture: SystemArchitecture, output_path: str) -> None:
    """
    Synchronous worker that renders the diagram using the diagrams library.
    Components are grouped into architectural layers (Clusters) with generous spacing.
    Intended to be called via asyncio.to_thread.
    """
    from diagrams import Diagram, Edge, Cluster

    # Ordered layers: (display name, set of service_type values)
    LAYERS = [
        ("Edge / Gateway",  {"alb", "nlb", "cloudfront", "api_gateway", "route53",
                              "internet_gateway", "transit_gateway", "nat_gateway",
                              "waf", "shield"}),
        ("Compute",         {"ec2", "ecs", "eks", "fargate", "lambda", "batch"}),
        ("Messaging",       {"sqs", "sns", "kinesis", "eventbridge", "mq", "msk",
                              "step_functions"}),
        ("Data & Storage",  {"rds", "aurora", "dynamodb", "elasticache", "documentdb",
                              "redshift", "s3", "ebs", "efs", "athena", "glue",
                              "opensearch"}),
        ("Security",        {"iam", "kms", "secrets_manager", "cognito"}),
        ("Operations",      {"cloudwatch", "cloudtrail", "x_ray", "sagemaker",
                              "codepipeline", "codebuild"}),
    ]
    all_layer_types = {t for _, types in LAYERS for t in types}

    def get_st(c) -> str:
        return c.service_type.value if hasattr(c.service_type, "value") else str(c.service_type)

    graph_attrs = {
        "fontsize": "20",
        "bgcolor": "white",
        "pad": "0.8",          # outer padding around the whole graph
        "ranksep": "1.2",      # vertical space between ranks
        "nodesep": "0.8",      # horizontal space between nodes in the same rank
        "splines": "ortho",    # clean right-angle edges
        "concentrate": "false",
    }
    node_attrs = {
        "fontsize": "13",
    }
    edge_attrs = {
        "fontsize": "11",
        "minlen": "1",         # minimum edge length (ranks apart)
        "color": "#555555",
    }

    with Diagram(
        architecture.name,
        filename=output_path,
        show=False,
        outformat="png",
        direction="TB",
        graph_attr=graph_attrs,
        node_attr=node_attrs,
        edge_attr=edge_attrs,
    ):
        node_map: Dict[str, Any] = {}

        def node_label(name: str, max_width: int = 18) -> str:
            """Wrap long names at word boundaries so they sit below the icon, not over it."""
            words = name.split()
            lines, current = [], ""
            for word in words:
                if current and len(current) + 1 + len(word) > max_width:
                    lines.append(current)
                    current = word
                else:
                    current = f"{current} {word}".strip()
            if current:
                lines.append(current)
            return "\n".join(lines)

        # Render each non-empty layer as a Cluster
        for layer_name, layer_types in LAYERS:
            layer_components = [c for c in architecture.components if get_st(c) in layer_types]
            if not layer_components:
                continue
            with Cluster(layer_name):
                for component in layer_components:
                    NodeClass = _get_node_class(get_st(component))
                    node_map[component.name] = NodeClass(node_label(component.name))

        # Any service type not covered by a layer goes into "Other"
        other_components = [c for c in architecture.components if get_st(c) not in all_layer_types]
        if other_components:
            with Cluster("Other"):
                for component in other_components:
                    NodeClass = _get_node_class(get_st(component))
                    node_map[component.name] = NodeClass(node_label(component.name))

        # Draw edges
        for conn in architecture.connections:
            from_name = conn.get("from", "")
            to_name   = conn.get("to", "")
            protocol  = conn.get("protocol", "")
            src = node_map.get(from_name)
            dst = node_map.get(to_name)
            if src is None or dst is None:
                continue
            if protocol:
                src >> Edge(label=protocol) >> dst
            else:
                src >> dst


async def generate_architecture_diagram(
    architecture: SystemArchitecture,
    style: str = "aws-professional",
) -> Dict[str, Any]:
    """
    Async public interface — generates a PNG diagram and returns base64-encoded data.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        output_base = os.path.join(tmp_dir, "diagram")

        await asyncio.to_thread(_render_sync, architecture, output_base)

        png_path = output_base + ".png"
        with open(png_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

    logger.info(
        "Architecture diagram rendered",
        architecture=architecture.name,
        style=style,
        size_kb=len(image_data) // 1024,
    )

    return {
        "image_data": image_data,
        "metadata": {
            "architecture": architecture.name,
            "components": len(architecture.components),
            "connections": len(architecture.connections),
            "style": style,
            "generator": "diagrams",
            "generated_at": datetime.now().isoformat(),
        },
    }
