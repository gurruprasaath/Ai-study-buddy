import logging
import os
from fastapi import APIRouter, Form, HTTPException
from services.chat import VECTORSTORE_CACHE
from services.unit import extract_units_from_notes
from services.summarize_agent import get_summarization_agent

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
            logger.info(f"Received file_content length: {len(file_content)}")
            summarizer_agent = get_summarization_agent()
            summary = summarizer_agent.run({
                "chunk": file_content[:5000]  # or use full content if your agent supports it
            })
            logger.info(f"Summary result: {summary[:200]}")
            return {"summaries": {"full": summary}}

        elif file_id:
            # Vectorstore mode
            vector_store = VECTORSTORE_CACHE.get(file_id)
            if not vector_store:
                raise HTTPException(status_code=404, detail="Vectorstore not found")

            all_docs = list(vector_store.docstore._dict.values())
            logger.info(f"Number of docs in vectorstore: {len(all_docs)}")
            full_text = "\n".join([doc.page_content for doc in all_docs])
            logger.info(f"Full text length from vectorstore: {len(full_text)}")
            logger.info(f"Sample full text: {full_text[:200]}")

            units = extract_units_from_notes(full_text)
            logger.info(f"Units extracted: {list(units.keys())}")
            summarizer_agent = get_summarization_agent()
            summaries = {}

            if not units:
                # Fallback: summarize first 5000 chars
                safe_content = full_text[:5000]
                logger.info(f"Fallback safe_content length: {len(safe_content)}")
                if not safe_content.strip():
                    logger.warning("No content available for summarization.")
                    return {"summaries": {"full": "No summary available for the provided content."}}
                summary = summarizer_agent.run({
                     "chunk": safe_content[:5000]
                })
                logger.info(f"Fallback summary result: {summary[:200]}")
                summaries["full"] = summary
            else:
                for unit_title, content in units.items():
                    if not content or not isinstance(content, str) or not content.strip():
                        logger.warning(f"Unit {unit_title} has no content, skipping.")
                        continue
                    safe_content = content[:5000]
                    logger.info(f"Summarizing unit {unit_title}, content length: {len(safe_content)}")
                    summary = summarizer_agent.run({
                        "chunk": safe_content
                    })
                    logger.info(f"Summary for {unit_title}: {summary[:200]}")
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
