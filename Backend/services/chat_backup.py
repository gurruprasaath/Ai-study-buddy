from fastapi import APIRouter, UploadFile, File, Form
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_groq import ChatGroq
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import HumanMessage, AIMessage
from dotenv import load_dotenv
import os
import uuid
load_dotenv()
router = APIRouter()
VECTORSTORE_CACHE = {}

CUSTOM_PROMPT = PromptTemplate(
    input_variables=["context", "question", "chat_history"],
    template="""
You are a helpful, expert-level assistant that reads user-uploaded notes and engages in a multi-turn conversation.

Use ONLY the following context and conversation history to answer the user's current question.

Previous Conversation:
{chat_history}

Context:
{context}

Current Question:
{question}

Answer:
"""
)

def get_pdf_text(pdf_file):
    text = ""
    pdf_reader = PdfReader(pdf_file)
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def get_text_chunks(raw_text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(raw_text)
    return chunks

def get_vectorstore(text_chunks):
    embedding = HuggingFaceEmbeddings(
        model_name="BAAI/bge-m3",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )
    vector_store = FAISS.from_texts(text_chunks, embedding=embedding)
    return vector_store

def get_conversation_chain(vector_store):
    llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    conversation = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(),
        memory=memory,
        return_source_documents=True,
        output_key="answer",
        combine_docs_chain_kwargs={"prompt": CUSTOM_PROMPT}
    )
    return conversation

@router.post("/chat/")
async def chat_with_book(
    
    user_question: str = Form(...),
    pdf: UploadFile = File(...)
):
    # 1. Extract text from PDF
    
    file_id = str(uuid.uuid4())
    pdf_bytes = await pdf.read()
    
    raw_text = get_pdf_text(pdf_bytes)
    if not raw_text:
        return {"error": "No text found in the PDF file."}

    # 2. Chunk text and create vectorstore
    text_chunks = get_text_chunks(raw_text)
    vector_store = get_vectorstore(text_chunks)

    # 3. Create conversation chain
    conversation = get_conversation_chain(vector_store)
    VECTORSTORE_CACHE[file_id] = vector_store
    # 4. Get answer
    response = conversation({'question': user_question})
    answer = response['answer']
    # Optionally, format chat history for frontend
    chat_history = []
    for msg in response['chat_history']:
        if isinstance(msg, HumanMessage):
            chat_history.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            chat_history.append({"role": "assistant", "content": msg.content})

    return {
        "answer": answer,
        "chat_history": chat_history,
        "file_id": file_id 
    }
