from pydantic import BaseModel, Extra
from typing import List, Union
from .node import ApiCallNode, ConditionNode, DelayNode, PythonNode

# Union of node types
Node = Union[ApiCallNode, ConditionNode, DelayNode, PythonNode]

class Edge(BaseModel):
    id: str
    source: str
    target: str

    class Config:
        extra = Extra.allow   # ✅ allow extra fields from React Flow (like type, label, etc.)

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

    class Config:
        extra = Extra.allow   # ✅ allow extra fields in workflow too
