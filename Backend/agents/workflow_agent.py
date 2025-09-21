# import os
# from pydantic_ai.models.openai import OpenAIModel
# from pydantic_ai import Agent
# from models.flow import Workflow
# from utils.parser import parse_natural_language_to_workflow
# from pydantic_ai.models.groq import GroqModel
# from pydantic_ai import Agent


# model = GroqModel("llama-3.1-8b-instant")  # Free model
# # agent = Agent(model)
# workflow_agent = Agent(
#     model,
#     output_type=dict,
#      system_prompt=(
#         "You are a workflow generator. "
#         "The user will describe a workflow in natural language. "
#         "Always respond with a workflow in strict JSON format only.\n\n"
#         "Supported node types:\n"
#         "1. apiCall → fields: id, type, url, method (GET/POST)\n"
#         "2. condition → fields: id, type, condition (e.g., 'value > 10')\n"
#         "3. python → fields: id, type, code (Python script)\n"
#         "4. delay → fields: id, type, duration (seconds)\n\n"
#         "Example format:\n"
#         "{\n"
#         "  \"nodes\": [\n"
#         "    {\"id\": \"1\", \"type\": \"apiCall\", \"url\": \"https://example.com\", \"method\": \"GET\"},\n"
#         "    {\"id\": \"2\", \"type\": \"condition\", \"condition\": \"temperature > 25\"},\n"
#         "    {\"id\": \"3\", \"type\": \"delay\", \"duration\": 5},\n"
#         "    {\"id\": \"4\", \"type\": \"python\", \"code\": \"print('done')\"}\n"
#         "  ],\n"
#         "  \"edges\": [\n"
#         "    {\"id\": \"e1\", \"source\": \"1\", \"target\": \"2\"},\n"
#         "    {\"id\": \"e2\", \"source\": \"2\", \"target\": \"3\"},\n"
#         "    {\"id\": \"e3\", \"source\": \"3\", \"target\": \"4\"}\n"
#         "  ]\n"
#         "}\n\n"
#         "Do not add explanations, only output valid JSON."
#     ),
# )
# print("Workflow agent initialized with model:", model)


# def generate_workflow_from_text(user_input: str) -> Workflow:
#     return parse_natural_language_to_workflow(user_input)


# # # 4. Helper function to run the agent
# def run_workflow_agent(user_input: str) -> dict:
#     """Generate JSON workflow from a user prompt."""
#     result = workflow_agent.run_sync(user_input)
#     output = result.output
#     if isinstance(output, str):
#         import json
#         try:
#             output = json.loads(output)
#         except json.JSONDecodeError:
#             raise ValueError("Model output is not valid JSON")
#     return output

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
