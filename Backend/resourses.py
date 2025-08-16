from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os

def get_top_youtube_videos(query, max_results=3):
    api_key = os.getenv("YOUTUBE_API_KEY") or os.getenv("YOUTUBE_ALTERNATE_API_KEY")

    if not api_key:
        raise ValueError("⚠️ YOUTUBE_API_KEY not found in environment variables")

    try:
        youtube = build("youtube", "v3", developerKey=api_key)

        search_response = youtube.search().list(
            q=query,
            part="snippet",
            type="video",
            maxResults=max_results,
            order="relevance"
        ).execute()

        videos = []
        for item in search_response.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            snippet = item["snippet"]
            title = snippet["title"]
            channel = snippet["channelTitle"]
            url = f"https://www.youtube.com/watch?v={video_id}"

            try:
                stats_response = youtube.videos().list(
                    part="statistics",
                    id=video_id
                ).execute()

                stats = stats_response["items"][0]["statistics"]
                views = int(stats.get("viewCount", 0))
                likes = int(stats.get("likeCount", 0))
            except HttpError:
                views = 0
                likes = 0

            videos.append({
                "title": title,
                "channel": channel,
                "url": url,
                "views": views,
                "likes": likes
            })

        return sorted(videos, key=lambda x: x["views"], reverse=True)

    except HttpError as e:
        # Fallback: return a YouTube search link if quota exceeded
        return [{
            "title": f"⚠️ YouTube quota exceeded. Try this search instead.",
            "channel": "Fallback",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}",
            "views": 0,
            "likes": 0
        }]
