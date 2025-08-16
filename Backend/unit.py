import json
import os
import re
from langchain_groq import ChatGroq

def extract_units_from_notes(note_text):
    prompt = f"""
You are an expert assistant. Extract all units or chapters from the following notes and return them as a JSON dictionary like:
{{
  "UNIT I": "...",
  "UNIT II": "...",
  ...
}}

Only include valid units. Do not add any explanation or text outside the JSON.

Notes:
\"\"\"
{note_text[:6000]}
\"\"\"
"""

    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
    response = llm.invoke(prompt).content

    try:
        # Try extracting JSON
        match = re.search(r'\{.*\}', response, re.DOTALL)
        if match:
            cleaned_json = match.group(0)
            units = json.loads(cleaned_json)
            if isinstance(units, dict) and units:
                return units
    except Exception as e:
        print("LLM JSON parsing failed:", e)

    # ❗Fallback: Extract using regex directly from text if LLM fails
    print("⚠️ Falling back to regex unit extraction...")

    units = {}
    current_unit = None
    lines = note_text.split('\n')

    for line in lines:
        line = line.strip()
        if re.match(r'UNIT[\s\-:]*[IVXLC]+', line, re.IGNORECASE):  # matches "UNIT I", "UNIT-II", etc.
            current_unit = line
            units[current_unit] = ""
        elif current_unit:
            units[current_unit] += line + "\n"

    return units
