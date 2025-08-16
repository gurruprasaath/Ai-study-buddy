from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import os
import dotenv

dotenv.load_dotenv()

def get_summarization_agent():
    prompt = PromptTemplate(
        input_variables=["chunk"],
        template="""
You are an expert academic assistant. Read the following document and generate a clear, concise summary that captures the main ideas, important concepts, and key details. 
Do NOT simply list topics or copy headings. Instead, synthesize the information and explain it in simple terms, suitable for a student revising for exams.

Document:
{chunk}

Summary:
"""
    )
    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_SUMMARIZATION_MODEL"))
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain
