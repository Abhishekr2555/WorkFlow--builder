import os
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai import Agent
from models.flow import Workflow
from utils.parser import parse_natural_language_to_workflow
from pydantic_ai.models.groq import GroqModel
from pydantic_ai import Agent

# ✅ Initialize OpenAI model (API key is read from env automatically)
# model = OpenAIModel("gpt-3.5-turbo")

# Create the agent
# agent = Agent(model)

model = GroqModel("llama-3.1-8b-instant")  # Free model
agent = Agent(model)

# Our wrapper function (not decorator-based anymore)
def generate_workflow_from_text(user_input: str) -> Workflow:
    """
    Convert natural language instructions into a structured workflow.
    Uses dummy parser for now.
    """
    return parse_natural_language_to_workflow(user_input)
