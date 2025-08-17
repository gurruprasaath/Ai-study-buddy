from fastapi import APIRouter, Query, HTTPException, Request
from fastapi.responses import JSONResponse
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from typing import List, Dict, Any
from pydantic import BaseModel
from services.notes_agent import NotesAgent
class NoteContent(BaseModel):
    content: str
    max_results: int = 3

router = APIRouter()

from googleapiclient.discovery import build
import os

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def get_top_youtube_videos(query: str, max_results: int = 5):
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

    request = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        videoCategoryId="27",  # ✅ Education category
        maxResults=max_results
    )
    response = request.execute()

    videos = []
    for item in response.get("items", []):
        videos.append({
            "title": item["snippet"]["title"],
            "description": item["snippet"]["description"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "videoId": item["id"]["videoId"],
            "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        })

    return videos


router = APIRouter()

notes_agent = NotesAgent()

@router.get("/recommended-videos")
async def recommended_videos(text: str = Query(..., description="Notes or summary"),
                             max_results: int = 5):
    """
    Generate YouTube video recommendations from notes/summary.
    """
    try:
        # Extract short, search-friendly topics
        topics: List[str] = notes_agent.extract_important_topics(text)

        if not topics:
            return {"error": "No topics extracted"}

        # Pick the top topic (or join multiple for better results)
        query = " ".join(topics[:3])  

        # Call YouTube API
        videos = get_top_youtube_videos(query=query, max_results=max_results)

        return {
            "query": query,
            "topics": topics,
            "videos": videos
        }

    except Exception as e:
        return {"error": str(e)}
