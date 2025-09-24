from pydantic_ai import Agent
from pydantic_ai.models.groq import GroqModel
import json

# Use Groq free model
model = GroqModel("llama-3.1-8b-instant")

workflow_agent = Agent(
    model,
    output_type=str,  # Force plain string output
    system_prompt=(
        "You are a workflow generator. "
        "The user will describe a workflow in natural language. "
        "Always respond with ONLY a workflow in valid JSON format.\n\n"
        "Supported node types:\n"
        "1. apiCall → fields: id, type, url, method (GET/POST)\n"
        "2. condition → fields: id, type, condition (e.g., 'value > 10')\n"
        "3. python → fields: id, type, code (Python script)\n"
        "4. delay → fields: id, type, duration (seconds)\n\n"
        "Format:\n"
        "{\n"
        "  \"nodes\": [ ... ],\n"
        "  \"edges\": [ ... ]\n"
        "}\n\n"
        "Do not explain. Do not wrap in <function>. Do not call tools. "
        "Only output raw JSON."
    ),
)


def run_workflow_agent(user_input: str) -> dict:
    result = workflow_agent.run_sync(user_input)
    raw_output = result.output.strip()

    try:
        workflow = json.loads(raw_output)  # Parse JSON manually
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned: {raw_output}")

    return workflow
