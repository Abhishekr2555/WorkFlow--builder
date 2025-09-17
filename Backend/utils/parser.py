from models.flow import Workflow, Edge
from models.node import ApiCallNode, DelayNode, PythonNode, ConditionNode
import uuid

def _id():
    return str(uuid.uuid4())

def parse_natural_language_to_workflow(text: str) -> Workflow:
    """
    Dummy parser – real one could use NLP or GPT.
    """
    nodes = []
    edges = []

    if "api" in text.lower():
        nodes.append(ApiCallNode(id=_id(), type="apiCall", url="https://api.example.com", method="GET"))
    if "wait" in text.lower():
        nodes.append(DelayNode(id=_id(), type="delay", duration=5))
    if "print" in text.lower():
        nodes.append(PythonNode(id=_id(), type="python", code="print('Hello World')"))

    # Connect nodes sequentially
    for i in range(len(nodes) - 1):
        edges.append(Edge(id=_id(), source=nodes[i].id, target=nodes[i+1].id))

    return Workflow(nodes=nodes, edges=edges)
