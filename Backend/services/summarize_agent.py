from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import os
import dotenv

dotenv.load_dotenv()

def get_summarization_agent(chunk):
    prompt = PromptTemplate(
        input_variables=["chunk"],
        template="""
    "Summarize this text in simple terms:\n\n{chunk}"
    """
    )

    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_SUMMARIZATION_MODEL"))
    
    chain = LLMChain(
        llm=llm,
        prompt=prompt
    )

    return chain
