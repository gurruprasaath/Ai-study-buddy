from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import os
import dotenv
dotenv.load_dotenv()
def get_summarization_agent():
    prompt = PromptTemplate(
        input_variables=["unit_title", "content"],
        template="""
You are a helpful academic assistant. Given the title and detailed content of a unit, write a clear, concise, and structured summary to help students revise for exams.

Unit Title: {unit_title}

Content:
{content}

Summary:
If no unit title is provided, summarize the entire content as a whole.
"""
    )

    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_SUMMARIZATION_MODEL"))
    
    chain = LLMChain(
        llm=llm,
        prompt=prompt
    )

    return chain
