from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from PyPDF2 import PdfReader
from fpdf import FPDF
import os
import base64
from dotenv import load_dotenv
from summarize_agent import get_summarization_agent
from unit import extract_units_from_notes
from resourses import get_top_youtube_videos
from youtubesearchpython import VideosSearch
import uvicorn
from services import chat,summarize
from services import run_locally
from services import generate_code

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(summarize.router)
app.include_router(run_locally.router)
app.include_router(generate_code.router)



@app.post("/generate-mcqs/")
async def generate_mcqs(unit_title: str = Form(...), content: str = Form(...)):
    from langchain_groq import ChatGroq
    prompt = f"""
    You are an academic assistant generating multiple-choice questions.
    ONLY use the content from the provided unit notes below. Do NOT use outside knowledge.

    Create exactly 5 MCQs in **strict JSON format**, where each question includes:
    - "question": the question text
    - "options": an object with keys "a", "b", "c", "d"
    - "answer": the correct option key (e.g., "a")

    Output ONLY a JSON list like this:
    [
    {{
        "question": "...",
        "options": {{"a": "...", "b": "...", "c": "...", "d": "..."}},
        "answer": "b"
    }},
    ...
    ]
    unit title: {unit_title}

    Unit Content:
    ----------------------
    {content[:4000]}
    """
    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
    mcqs = llm.invoke(prompt).content
    return {"mcqs": mcqs}

@app.post("/test-results/")
async def test_results(results: List[Dict[str, Any]]):
    # You can process/store results as needed
    score = sum(1 for r in results if r.get("is_correct"))
    total = len(results)
    return {"score": score, "total": total, "results": results}

@app.get("/search-videos/")
async def search_videos(query: str):
    # Use youtubesearchpython for no-API-key search
    search = VideosSearch(query + " education", limit=5)
    results = search.result()
    videos = []
    for v in results.get("result", []):
        videos.append({
            "title": v["title"],
            "channel": v["channel"]["name"],
            "views": v.get("viewCount", {}).get("text", "0"),
            "url": v["link"],
            "video_id": v["id"],
        })
    return {"videos": videos}

@app.post("/study-plan/")
async def study_plan(units: List[str] = Form(...)):
    from langchain_groq import ChatGroq
    prompt = (
        f"You are a study planner assistant. Given these units:\n"
        f"{units}\n"
        "Create a 7-day study plan, assigning units/topics to each day. "
        "Balance the workload and include revision days. Format as a markdown table."
    )
    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
    plan = llm.invoke(prompt).content
    return {"plan": plan}

@app.post("/export-summary-pdf/")
async def export_summary_pdf(unit_title: str = Form(...), summary: str = Form(...)):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, f"{unit_title}\n\n{summary}")
    pdf_bytes = pdf.output(dest='S').encode('latin1')
    b64 = base64.b64encode(pdf_bytes).decode()
    return {"pdf_base64": b64}

@app.post("/run-code/")
async def run_code(language: str = Form(...), code: str = Form(...), stdin: str = Form("")):
    from run import run_locally
    stdout, stderr, compile_output = run_locally(language.lower(), code, stdin=stdin)
    return {
        "stdout": stdout,
        "stderr": stderr,
        "compile_output": compile_output
    }

# Pomodoro timer is best handled on the frontend (React), not backend.

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)