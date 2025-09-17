from fastapi import APIRouter , HTTPException
from pydantic import BaseModel
from models.flow import Workflow
from services.workflow_service import validate_workflow, execute_workflow
from agents.workflow_agent import agent

router = APIRouter()

@router.post("/workflow/validate")
def validate(workflow: Workflow):
    try:
        validate_workflow(workflow)
        return {"valid": True}
    except ValueError as e:
        print('Validation error:', e)
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/workflow/execute")
def execute(workflow: Workflow):
    return {"results": execute_workflow(workflow)}


class GenerateRequest(BaseModel):
    user_input: str

@router.post("/workflow/generate")
async def generate(request: GenerateRequest):
    """
    Takes natural language input and returns a workflow.
    """
    response = await agent.run(request.user_input)
    return response
