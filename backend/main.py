from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.pipeline import run_pipeline

app = FastAPI()

# Allow CORS for Next.js frontend (default port 3000)
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str

@app.post("/api/query")
def process_query(req: QueryRequest):
    print(f"Received query: {req.query}")
    
    # Process the query using the AI pipeline
    script = run_pipeline(req.query)
    
    # The pipeline returns raw text containing Desp instructions, separated by newlines.
    # Convert it into a list of strings for the frontend to easily map over.
    # Split by newline and remove empty lines.
    instructions = [line.strip() for line in script.splitlines() if line.strip()]
    
    return {
        "instructions": instructions
    }
