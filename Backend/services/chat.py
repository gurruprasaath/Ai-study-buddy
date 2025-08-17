from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
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

import logging

def get_pdf_text(pdf_file):
    text = ""
    try:
        pdf_reader = PdfReader(pdf_file)
        for page_num, page in enumerate(pdf_reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                logging.info(f"Page {page_num+1} extracted length: {len(page_text) if page_text else 0}")
            except Exception as e:
                logging.error(f"Error extracting text from page {page_num+1}: {e}")
                continue
    except Exception as e:
        logging.error(f"PDF extraction error: {e}")
        return ""
    logging.info(f"Total extracted text length: {len(text.strip())}")
    logging.info(f"Sample extracted text: {text[:200]}")
    return text.strip()

def get_text_chunks(raw_text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    return text_splitter.split_text(raw_text)

def get_vectorstore(text_chunks):
    embedding = HuggingFaceEmbeddings(
        model_name="BAAI/bge-m3",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )
    store = FAISS.from_texts(text_chunks, embedding=embedding)
    if not isinstance(store, FAISS):
        raise TypeError(f"Expected FAISS object, got {type(store)}")
    return store

def get_conversation_chain(vector_store):
    if not isinstance(vector_store, FAISS):
        raise TypeError(f"Expected FAISS object, got {type(vector_store)}")
    llm = ChatGroq(
        model="llama3-8b-8192",
        api_key=os.getenv("GROQ_API_KEY")
    )
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(),
        memory=memory,
        return_source_documents=True,
        output_key="answer",
        combine_docs_chain_kwargs={"prompt": CUSTOM_PROMPT}
    )

@router.post("/upload/")
async def upload_pdf(pdf: UploadFile = File(...)):
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    raw_text = get_pdf_text(pdf.file)
    logging.info(f"Raw text length after extraction: {len(raw_text)}")
    if not raw_text:
        raise HTTPException(status_code=400, detail="No text found in PDF.")

    text_chunks = get_text_chunks(raw_text)
    logging.info(f"Number of text chunks: {len(text_chunks)}")
    if text_chunks:
        logging.info(f"First chunk sample: {text_chunks[0][:200]}")
    vector_store = get_vectorstore(text_chunks)

    file_id = str(uuid.uuid4())
    VECTORSTORE_CACHE[file_id] = vector_store

    return {"file_id": file_id, "message": "PDF uploaded successfully"}

@router.post("/chat/")
async def chat_with_book(user_question: str = Form(...), file_id: str = Form(...)):
    if file_id not in VECTORSTORE_CACHE:
        raise HTTPException(status_code=404, detail="Invalid file_id. Please upload the PDF again.")

    vector_store = VECTORSTORE_CACHE[file_id]

    # Ensure we have a proper FAISS object
    if not isinstance(vector_store, FAISS):
        raise HTTPException(
            status_code=500,
            detail=f"Vector store is corrupted. Expected FAISS object, got {type(vector_store)}. Please re-upload the PDF."
        )

    try:
        conversation = get_conversation_chain(vector_store)
        response = conversation({'question': user_question})
        answer = response['answer']

        chat_history = []
        for msg in response['chat_history']:
            if isinstance(msg, HumanMessage):
                chat_history.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                chat_history.append({"role": "assistant", "content": msg.content})

        return {"answer": answer, "chat_history": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
