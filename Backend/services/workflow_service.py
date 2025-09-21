from models.flow import Workflow
from models.node import ApiCallNode, DelayNode 

def validate_workflow(workflow: Workflow) -> bool:     
    for node in workflow.nodes:
        node_data = node if isinstance(node, dict) else node.__dict__
        if node_data.get("type") == "delay":
            delay_node = DelayNode(**node_data)
            if delay_node.duration is None or delay_node.duration <= 0:
                raise ValueError("Delay duration must be > 0")
        if node_data.get("type") == "apiCall":
            try:
                ApiCallNode(**node_data)
            except Exception:
                raise ValueError("API Call requires a valid URL and method")
    return True



def execute_workflow(workflow: Workflow):
    """Mock executor (later: async tasks, Celery, etc.)."""
    results = []
    for node in workflow.nodes:
        if node.type == "apiCall":
            results.append(f"Calling API {node.method} {node.url}")
        elif node.type == "condition":
            results.append(f"Checking condition {node.condition}")
        elif node.type == "delay":
            results.append(f"Waiting {node.duration} seconds")
        elif node.type == "python":
            results.append(f"Executing Python code:\n{node.code}")
    return results
