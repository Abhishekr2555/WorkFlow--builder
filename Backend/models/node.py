from typing import Optional
from pydantic import BaseModel, HttpUrl, Extra
from typing import Literal

class ApiCallNode(BaseModel):
    id: str
    type: Literal["apiCall"]
    url: HttpUrl
    method: Optional[Literal["GET","POST","PUT","DELETE"]] = "GET"

class PythonNode(BaseModel):
    id: str
    type: Literal["python"]
    code: Optional[str] = ""

class ConditionNode(BaseModel):
    id: str
    type: Literal["condition"]
    condition: Optional[str] = ""

class DelayNode(BaseModel):
    id: str
    type: Literal["delay"]
    duration: Optional[int] = 1
