import logging
import os
from fastapi import APIRouter, Form, HTTPException
from services.chat import VECTORSTORE_CACHE
from unit import extract_units_from_notes
from summarize_agent import get_summarization_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/summarize/")
async def summarize_notes(
    file_content: str = Form(None),
    file_id: str = Form(None)
):
    logger.info("Summarization request received.")

    try:
        if file_content:
            # Simple mode: summarize raw text
            summary = f"Summary of the content: {file_content[:100]}..."
            return {"summaries": {"full": summary}}

        elif file_id:
            # Vectorstore mode
            vector_store = VECTORSTORE_CACHE.get(file_id)
            if not vector_store:
                raise HTTPException(status_code=404, detail="Vectorstore not found")

            all_docs = vector_store.docstore._dict.values()
            full_text = "\n".join([doc.page_content for doc in all_docs])

            units = extract_units_from_notes(full_text)
            summarizer_agent = get_summarization_agent()
            summaries = {}

            if not units:
                # Fallback: summarize first 5000 chars
                safe_content = full_text[:5000]
                summary = summarizer_agent.run({
                    "unit_title": "",
                    "content": safe_content
                })
                summaries["full"] = summary
            else:
                for unit_title, content in units.items():
                    if not content or not isinstance(content, str) or not content.strip():
                        continue
                    safe_content = content[:5000]
                    summary = summarizer_agent.run({
                        "unit_title": unit_title,
                        "content": safe_content
                    })
                    summaries[unit_title] = summary

            return {"summaries": summaries}

        else:
            raise HTTPException(
                status_code=400,
                detail="Either file_content or file_id must be provided."
            )

    except Exception as e:
        logger.error(f"Error during summarization: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during summarization.")
