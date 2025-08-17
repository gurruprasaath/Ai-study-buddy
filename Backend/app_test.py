from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from PyPDF2 import PdfReader
from fpdf import FPDF
import os
import base64
from dotenv import load_dotenv

from resourses import get_top_youtube_videos
from youtubesearchpython import VideosSearch
import uvicorn
from services import chat,summarize
from services import run_locally
from services import generate_code
from services import youtube_routes as resourses
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
app.include_router(resourses.router)


# Pomodoro timer is best handled on the frontend (React), not backend.

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)