# services/notes_agent.py

import os
from typing import List
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

class NotesAgent:
    def __init__(self, api_key: str = None, model: str = "llama-3.1-8b-instant"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found. Please set it in environment variables.")

        self.llm = ChatGroq(
            api_key=self.api_key,
            model=model,
            temperature=0.0
        )

        # Updated prompt: return search queries instead of long bullet notes
        self.prompt = PromptTemplate(
            input_variables=["text"],
            template=(
                """
        Extract 5–7 main topics or keywords from the following academic notes:

        \"\"\"
        {note_text[:3000]}
        \"\"\"

        List only keywords or topic titles, no descriptions.
        """
            )
        )

        self.chain = LLMChain(llm=self.llm, prompt=self.prompt)

    def extract_important_topics(self, text: str) -> List[str]:
        """
        Extracts short, search-friendly keywords from notes.
        """
        response = self.chain.run(text=text)

        # Expect comma-separated keywords
        if "," in response:
            topics = [kw.strip() for kw in response.split(",") if kw.strip()]
        else:
            topics = [line.strip(" -•\n") for line in response.split("\n") if line.strip()]

        return topics[:5]   # limit to top 5
