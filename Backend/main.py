import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router  # Import your API routes



app = FastAPI(
    title="AI Workflow Generator",
    description="Generate visual workflows using PydanticAI",
    version="1.0.0"
)

# Enable CORS for frontend (Next.js runs on port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Workflow Generator Backend is running 🚀"}
