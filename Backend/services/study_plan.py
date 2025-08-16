from fastapi import APIRouter, Form, HTTPException
from langchain_groq import ChatGroq
import os
from services.chat import VECTORSTORE_CACHE  # Assuming you cache vectorstores by file_id
from unit import extract_units_from_notes

router = APIRouter()

@router.post("/study-plan/")
async def generate_study_plan(file_id: str = Form(...)):
    try:
        # Retrieve vectorstore from cache using file_id
        vectorstore = VECTORSTORE_CACHE.get(file_id)
        if not vectorstore:
            raise HTTPException(status_code=404, detail="File not found or not processed yet.")

        # Get all docs and build full_text
        all_docs = vectorstore.docstore._dict.values()
        full_text = "\n".join([doc.page_content for doc in all_docs])

        # Extract units
        units = extract_units_from_notes(full_text)
        units_list = list(units.keys())

        llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
        prompt = (
            f"You are a study planner assistant. Given these units:\n"
            f"{units_list}\n"
            "Create a 7-day study plan, assigning units/topics to each day. "
            "Balance the workload and include revision days. Format as a markdown table."
        )
        plan = llm.invoke(prompt).content
        return {"plan": plan}
    except Exception as e:
        return {"error": str(e)}