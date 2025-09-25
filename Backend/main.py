# import os
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router 



app = FastAPI(
    title="AI Workflow Generator",
    description="Generate visual workflows using PydanticAI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Workflow Generator Backend is running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run("main:app", host=host, port=port)