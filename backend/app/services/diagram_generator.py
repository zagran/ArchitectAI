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

# Standard mapping for known services
_SERVICE_NODE_MAP: Dict[str, Tuple[str, str]] = {
    "ec2":              ("diagrams.aws.compute",     "EC2"),
    "lambda":           ("diagrams.aws.compute",     "Lambda"),
    "s3":               ("diagrams.aws.storage",     "S3"),
    "rds":              ("diagrams.aws.database",    "RDS"),
    "aurora":           ("diagrams.aws.database",    "Aurora"),
    "dynamodb":         ("diagrams.aws.database",    "Dynamodb"),
    "alb":              ("diagrams.aws.network",     "ALB"),
    "api_gateway":      ("diagrams.aws.network",     "APIGateway"),
    "step_functions":   ("diagrams.aws.integration", "StepFunctions"),
    "sagemaker":        ("diagrams.aws.ml",          "Sagemaker"),
    "polly":            ("diagrams.aws.ml",          "Polly"),
    "cloudwatch":       ("diagrams.aws.management",  "Cloudwatch"),
    "secrets_manager":  ("diagrams.aws.security",    "SecretsManager"),
    "waf":              ("diagrams.aws.security",    "WAF"),
}

def _get_node_class(component):
    """Smart lookup for icons; checks service_type first, then name keywords."""
    st = component.service_type.value if hasattr(component.service_type, "value") else str(component.service_type)
    name_lower = component.name.lower()
    
    # Match by service_type or keyword in name (crucial for ServiceType.OTHER)
    match_key = next((k for k in _SERVICE_NODE_MAP if k == st or k in name_lower), None)
    
    if match_key:
        module_path, class_name = _SERVICE_NODE_MAP[match_key]
        try:
            module = importlib.import_module(module_path)
            return getattr(module, class_name)
        except (ImportError, AttributeError):
            pass

    from diagrams.aws.general import General
    return General

def _render_sync(architecture: SystemArchitecture, output_path: str) -> None:
    from diagrams import Diagram, Edge, Cluster
    from diagrams.onprem.client import Users

    # Categorization Sets
    PUBLIC_TYPES = {"waf", "api_gateway", "cloudfront", "route53", "internet_gateway"}
    COMPUTE_TYPES = {"lambda", "ec2", "ecs", "eks", "fargate", "step_functions"}
    DATA_TYPES = {"dynamodb", "rds", "aurora", "s3", "elasticache", "redshift"}

    graph_attrs = {
        "fontsize": "24",
        "ranksep": "2.0",      # More vertical space to avoid line crossing
        "nodesep": "1.2",      # More horizontal space
        "splines": "spline",   # Smoother paths around nodes
        "concentrate": "true", # Merges parallel lines
        "bgcolor": "white",
        "compound": "true",
    }

    with Diagram(
        architecture.name,
        filename=output_path,
        show=False,
        outformat="png",
        direction="TB",
        graph_attr=graph_attrs
    ):
        node_map: Dict[str, Any] = {}

        # 1. External Entry Point
        user_node = Users("End Users")

        # 2. Public Zone (Services outside VPC)
        with Cluster("Public Zone / Edge"):
            public_comps = [c for c in architecture.components if (c.service_type.value if hasattr(c.service_type, "value") else str(c.service_type)) in PUBLIC_TYPES]
            for comp in public_comps:
                NodeCls = _get_node_class(comp)
                node_map[comp.name] = NodeCls(f"{comp.name}")

        # 3. AWS VPC Boundary
        with Cluster("AWS VPC", graph_attr={"bgcolor": "#EBF3FB", "style": "dashed", "pencolor": "#2E73B8"}):
            
            with Cluster("Private Subnet (Compute)"):
                compute_comps = [c for c in architecture.components if (c.service_type.value if hasattr(c.service_type, "value") else str(c.service_type)) in COMPUTE_TYPES]
                for comp in compute_comps:
                    NodeCls = _get_node_class(comp)
                    node_map[comp.name] = NodeCls(f"{comp.name}")

            with Cluster("Private Subnet (Data)"):
                data_comps = [c for c in architecture.components if (c.service_type.value if hasattr(c.service_type, "value") else str(c.service_type)) in DATA_TYPES]
                for comp in data_comps:
                    NodeCls = _get_node_class(comp)
                    node_map[comp.name] = NodeCls(f"{comp.name}")

        # 4. Management & Cross-cutting Zone (Fallback for everything else)
        with Cluster("Management & Supporting"):
            other_comps = [c for c in architecture.components if c.name not in node_map]
            for comp in other_comps:
                NodeCls = _get_node_class(comp)
                node_map[comp.name] = NodeCls(f"{comp.name}")

        # --- CONNECTIONS ---

        # Smart Entry Point: Connect User to first Gateway/WAF
        entry_candidates = [n for n in node_map if any(x in n.lower() for x in ["waf", "gateway"])]
        if entry_candidates:
            user_node >> Edge(color="darkblue", penwidth="2.0", minlen="2") >> node_map[entry_candidates[0]]

        # Primary and Secondary Edges
        for conn in architecture.connections:
            src_name, dst_name = conn.get("from"), conn.get("to")
            src, dst = node_map.get(src_name), node_map.get(dst_name)
            
            if src and dst:
                # Is this a "side" connection (monitoring, logs, secrets)?
                is_cross = any(x in src_name.lower() for x in ["monitoring", "alerting", "secrets", "cloudwatch"])
                
                # Use Port Mapping (tailport/headport) to keep lines from crossing node centers
                edge_style = Edge(
                    color="#555555" if not is_cross else "#BBBBBB",
                    style="dashed" if is_cross else "solid",
                    weight="2" if not is_cross else "1", 
                    constraint="true" if not is_cross else "false",
                    tailport="s", # Exit bottom
                    headport="n", # Enter top
                )
                src >> edge_style >> dst

async def generate_architecture_diagram(
    architecture: SystemArchitecture, 
    style: str = "aws-professional"  # Added this back to handle the 2nd argument
) -> Dict[str, Any]:
    """Async wrapper to run rendering in a thread pool and return base64 string."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        output_base = os.path.join(tmp_dir, "diagram")
        
        # Offload blocking Graphviz call to a thread
        await asyncio.to_thread(_render_sync, architecture, output_base)
        
        png_path = output_base + ".png"
        if not os.path.exists(png_path):
            logger.error("Diagram generation failed: PNG not found.")
            return {"error": "Generation failed"}

        with open(png_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

    return {
        "image_data": image_data,
        "metadata": {
            "architecture": architecture.name,
            "total_cost": architecture.estimated_monthly_cost,
            "generated_at": datetime.now().isoformat(),
            "style": style
        },
    }