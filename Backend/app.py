import streamlit as st
import torch
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate  # ✅ added this
from html_Templates import css, bot_template, user_template
from langchain.schema import HumanMessage, AIMessage
from datetime import datetime
from fpdf import FPDF
import io
import base64
import time  # Add this import at the top if not already present
from youtubesearchpython import VideosSearch

from summarize_agent import get_summarization_agent
from langchain.text_splitter import CharacterTextSplitter
import json
from unit import extract_units_from_notes  # Importing the unit extraction function
from resourses import get_top_youtube_videos  # Importing the YouTube video fetching function
# -------- Custom Prompt --------
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


# -------- PDF Text Extraction --------
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

def parse_view_count(text):
    """
    Safely extract an integer view count from strings like:
    - "123 views"
    - "No views"
    - "1,234 views"
    """
    import re
    try:
        match = re.search(r"([\d,]+)", text)
        if match:
            return int(match.group(1).replace(",", ""))
    except:
        pass
    return 0


# -------- Text Chunking --------
def get_text_chunks(raw_text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(raw_text)
    return chunks


# -------- Vector Store Creation --------
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def get_vectorstore(text_chunks):
    embedding = HuggingFaceEmbeddings(
        model_name="BAAI/bge-m3",
        model_kwargs={"device": "cpu"},  # Force CPU to avoid meta tensor error
        encode_kwargs={"normalize_embeddings": True}
    )
    vector_store = FAISS.from_texts(text_chunks, embedding=embedding)
    return vector_store



# -------- Conversation Chain using Groq --------
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
        combine_docs_chain_kwargs={"prompt": CUSTOM_PROMPT}  # ✅ custom prompt
    )

    return conversation

def display_message(content, role):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Append message to chat history
    st.session_state.chat_history.append({
        "timestamp": timestamp,
        "role": role,
        "content": content
    })

    # Determine style
    align = "right" if role == "user" else "left"
    bubble_color = "#1e90ff" if role == "user" else "#2ecc71"
    text_color = "white" if role == "user" else "black"

    # Render chat bubble
    st.markdown(f"""
    <div style='text-align: {align}; margin-bottom: 10px;'>
        <div style='display:inline-block; padding: 10px 15px; border-radius: 15px;
                    background-color: {bubble_color}; color: {text_color}; max-width: 70%;
                    box-shadow: 0px 2px 6px rgba(0,0,0,0.1);'>
            <small style='opacity: 0.7;'>{timestamp}</small><br>
            <b>{role.capitalize()}</b>: {content}
        </div>
    </div>
    """, unsafe_allow_html=True)


# -------- Handle User Input --------


def handle_user_input(user_question):
    response = st.session_state.conversation({'question': user_question})
    st.session_state.chat_history = response['chat_history']

    # Build custom history with timestamps (latest first)
    paired_messages = []
    messages = st.session_state.chat_history

    for i in range(len(messages) - 2, -1, -2):
        human_msg = messages[i]
        ai_msg = messages[i + 1]

        if isinstance(human_msg, HumanMessage) and isinstance(ai_msg, AIMessage):
            paired_messages.append({
                "user_msg": human_msg.content,
                "bot_msg": ai_msg.content,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # You can also use custom timestamp logic here
            })

    st.session_state.paired_display_history = paired_messages

def search_educational_videos(query, limit=5):
    # Always add "education" to bias results
    search = VideosSearch(query + " education", limit=limit)
    results = search.result()
    videos = []
    for v in results.get("result", []):
        videos.append({
            "title": v["title"],
            "channel": v["channel"]["name"],
            "views": parse_view_count(v.get("viewCount", {}).get("text", "0")),

            "url": v["link"],
            "video_id": v["id"],
            "likes": 0  # Not available without API, set to 0 or remove this field
        })
    return videos

def extract_topics(note_text):
    prompt = f"""
        Extract 5–7 main topics or keywords from the following academic notes:

        \"\"\"
        {note_text[:3000]}
        \"\"\"

        List only keywords or topic titles, no descriptions.
        """
    return ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ1_API_KEY")).invoke(prompt).content.split("\n")

def extract_json_from_llm_response(response_text):
    """
    Safely extracts and returns the first valid JSON list or object from LLM response text.
    """
    import re
    import json

    # Look for code block ```json ... ```
    code_block_match = re.search(r"```json\s*(\[.*?\])\s*```", response_text, re.DOTALL)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1))
        except json.JSONDecodeError:
            pass

    # Fallback: look for any JSON array in the raw text
    array_match = re.search(r"\[\s*{.*?}\s*]", response_text, re.DOTALL)
    if array_match:
        try:
            return json.loads(array_match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError("No valid JSON could be extracted.")


# -------- Main App --------
def main():
    import re
    from collections import defaultdict

    load_dotenv()
    st.set_page_config(page_title="AI Study Buddy", page_icon="📘", layout="wide")
    st.write(css, unsafe_allow_html=True)

    if "conversation" not in st.session_state:
        st.session_state.conversation = None
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    if "paired_display_history" not in st.session_state:
        st.session_state.paired_display_history = []
    if "test_results" not in st.session_state:
        st.session_state.test_results = {}

    # Create tabs (add a new tab for Doubt Solver)
    tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8 = st.tabs([
        "💬 Chat with Book",
        "🧾 Unit Summarization",
        "🧪 Test Generator",
        "Test Results",
        "Resourses",
        "🗓️ Study Plan",  # New tab for personalized study plan
        "⏲️ Pomodoro Timer",  # New tab for Pomodoro Timer
        "🎥 EduTube"  # New tab for educational video platform
    ])


    # ----------- Tab 1: Chat with Book -----------
    with tab1:
        st.header("Chat with Book 📘")
        st.write("Upload your notes and chat with the content using Groq-powered AI!")

        user_question = st.text_input("Ask a question from your uploaded book/notes:")
        if user_question:
            handle_user_input(user_question)

        with st.sidebar:
            st.subheader("Your Notes")
            pdf_docs = st.file_uploader("Upload your notes (PDF)", type=["pdf"], accept_multiple_files=True)
            if st.button("Process Notes"):
                with st.spinner("Reading and indexing notes..."):
                    raw_text = get_pdf_text(pdf_docs)
                    text_chunks = get_text_chunks(raw_text)
                    vector_store = get_vectorstore(text_chunks)
                    st.session_state.conversation = get_conversation_chain(vector_store)
                    st.session_state.full_text = "\n".join(text_chunks)  # ✅ Store full_text globally


        if st.session_state.paired_display_history:
            for pair in st.session_state.paired_display_history:
                user_msg = pair["user_msg"]
                bot_msg = pair["bot_msg"]
                timestamp = pair["timestamp"]

                # User bubble
                st.markdown(f"""
                <div style='text-align: right; margin-bottom: 10px;'>
                    <div style='display:inline-block; padding: 10px 15px; border-radius: 15px;
                                background-color: #1e90ff; color: white; max-width: 70%;
                                box-shadow: 0px 2px 6px rgba(0,0,0,0.1);'>
                        <small style='opacity: 0.7;'>{timestamp}</small><br>
                        <b>User</b>: {user_msg}
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # Bot bubble
                st.markdown(f"""
                <div style='text-align: left; margin-bottom: 20px;'>
                    <div style='display:inline-block; padding: 10px 15px; border-radius: 15px;
                                background-color: #2ecc71; color: black; max-width: 70%;
                                box-shadow: 0px 2px 6px rgba(0,0,0,0.1);'>
                        <small style='opacity: 0.7;'>{timestamp}</small><br>
                        <b>Bot</b>: {bot_msg}
                    </div>
                </div>
                """, unsafe_allow_html=True)

    # ----------- Tab 2: Unit Summarization -----------
    from summarize_agent import get_summarization_agent
    from summarize_agent import get_summarization_agent
    

    with tab2:
        st.header("Unit Summarization 🧾")
        st.write("Automatically detect and summarize each unit in your uploaded notes.")

        if st.session_state.conversation:
            with st.spinner("Summarizing..."):
                retriever = st.session_state.conversation.retriever
                all_docs = retriever.vectorstore.docstore._dict.values()
                full_text = "\n".join([doc.page_content for doc in all_docs])

                units = extract_units_from_notes(full_text)

                if not units:
                    st.warning("No units detected. Summarizing the entire document instead.")
                    summarizer_agent = get_summarization_agent()
                    try:
                        # Truncate if too long
                        safe_content = full_text if len(full_text) < 5000 else full_text[:5000]
                        summary = summarizer_agent.run({
                            "unit_title": "",
                            "content": safe_content
                        })
                        st.markdown("**Summary:**")
                        st.markdown(summary)
                    except Exception as e:
                        st.error(f"Summarization failed: {e}")
                else:
                    summarizer_agent = get_summarization_agent()
                    for unit_title, content in units.items():
                        if not content or not isinstance(content, str) or not content.strip():
                            continue
                        st.subheader(f"📘 {unit_title}")
                        safe_content = content if len(content) < 5000 else content[:5000]
                        try:
                            summary = summarizer_agent.run({
                                "unit_title": unit_title,
                                "content": safe_content
                            })
                            st.markdown(summary)
                        except Exception as e:
                            st.error(f"Summarization failed: {e}")

                        # --- Flashcard Generator Button ---
                        if st.button(f"Generate Flashcards for {unit_title}", key=f"flashcard_btn_{unit_title}"):
                            with st.spinner("Generating flashcards..."):
                                from langchain_groq import ChatGroq
                                llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
                                prompt = (
                                    f"Create 5 flashcards (question and answer pairs) from the following unit notes:\n\n"
                                    f"{safe_content}\n\n"
                                    "Format:\nQ: ...\nA: ...\n"
                                )
                                flashcards = llm.invoke(prompt).content
                                st.markdown("**Flashcards:**")
                                st.markdown(flashcards)
                        # --- Export to PDF Button ---
                        st.markdown(export_summary_pdf(unit_title, summary), unsafe_allow_html=True)
        else:
            st.warning("Please upload and process your notes in the 'Chat with Book' tab first.")

        

    
    with tab3:
        st.header("🧪 Test Generator")
        st.write("Generate and take a quiz based on your uploaded notes.")

        

        def generate_mcqs_json(unit_title, content):
            prompt = f"""
    You are an academic assistant generating multiple-choice questions.
    ONLY use the content from the provided unit notes below. Do NOT use outside knowledge.

    Create exactly 5 MCQs in **strict JSON format**, where each question includes:
    - "question": the question text
    - "options": an object with keys "a", "b", "c", "d"
    - "answer": the correcX t option key (e.g., "a")

    Output ONLY a JSON list like this:
    [
    {{
        "question": "...",
        "options": {{"a": "...", "b": "...", "c": "...", "d": "..."}},
        "answer": "b"
    }},
    ...
    ]
    unit title: {unit_title}
    
    Unit Content:
    ----------------------
    {content[:4000]}
    """
            from langchain_groq import ChatGroq
            llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
            return llm.invoke(prompt).content

        if st.session_state.conversation:
            with st.spinner("Preparing test..."):
                retriever = st.session_state.conversation.retriever
                all_docs = retriever.vectorstore.docstore._dict.values()
                full_text = "\n".join([doc.page_content for doc in all_docs])
                units = extract_units_from_notes(full_text)

                unit_titles = list(units.keys())
                selected_unit = st.selectbox("Select Unit for Test:", unit_titles)

                if st.button("🧠 Generate MCQs"):
                    print(units)
                    content = units[selected_unit]
                    try:
                        raw_mcq_json = generate_mcqs_json(selected_unit, content)
                        print(selected_unit, "Content :",content)  # Debugging line
                        mcqs = extract_json_from_llm_response(raw_mcq_json)
                        print("Generated MCQs:", mcqs)  # Debugging line to check generated MCQs
                        st.session_state.current_mcqs = mcqs
                        st.session_state.current_unit = selected_unit
                    except Exception as e:
                        st.error(f"❌ Error generating MCQs: {e}")

            # ✅ FORM SUBMISSION - ONLY RUN WHEN MCQS ARE GENERATED
            if "current_mcqs" in st.session_state:
                mcqs = st.session_state.current_mcqs
                with st.form("quiz_form"):
                    st.subheader(f"Test: {st.session_state.current_unit}")
                    user_answers = []
                    correct_answers = []

                    for idx, item in enumerate(mcqs):
                        st.markdown(f"**Q{idx+1}: {item['question']}**")
                        options = item["options"]
                        correct_answers.append(item["answer"])
                        choice = st.radio(
                            f"Select answer for Q{idx+1}",
                            list(options.keys()),
                            format_func=lambda k: f"{k}) {options[k]}",
                            key=f"q{idx}"
                        )
                        user_answers.append(choice)

                    submitted = st.form_submit_button("Submit Test")
                    if submitted:
                        score = sum([1 for u, c in zip(user_answers, correct_answers) if u == c])
                        st.session_state.test_results = {
                            "unit": st.session_state.current_unit,
                            "score": score,
                            "total": len(mcqs),
                            "results": [
                                {
                                    "question": mcqs[i]["question"],
                                    "user_answer": user_answers[i],
                                    "correct_answer": correct_answers[i],
                                    "is_correct": user_answers[i] == correct_answers[i]
                                }
                                for i in range(len(mcqs))
                            ]
                        }
                        st.success("✅ Test Submitted! Go to 'Test Results' tab to view your results.")
        else:
            st.warning("Please upload and process notes in 'Chat with Book' tab first.")

    with tab4:
        st.header("📊 Test Results")

        result_data = st.session_state.get("test_results", None)
        print("Test Results:", result_data)  # Debugging line to check results
        # Check if result_data is valid
        if result_data and isinstance(result_data, dict) and "unit" in result_data:
            st.subheader(f"Results for: {result_data.get('unit', 'Unknown')}")
            st.info(f"🎯 Your Score: {result_data.get('score', 0)} / {result_data.get('total', 0)}")

            for i, r in enumerate(result_data.get("results", [])):
                status = "✅ Correct" if r.get("is_correct") else f"❌ Incorrect (Correct: {r.get('correct_answer')})"
                st.markdown(f"""
    **Q{i+1}: {r.get('question')}**  
    Your Answer: {r.get('user_answer')} — {status}
    """)
        else:
            st.warning("⚠️ No test submitted yet or data is invalid.")

    with tab5:
        st.subheader("📺 Recommended YouTube Videos")
        if "full_text" in st.session_state:
            topics = extract_topics(st.session_state.full_text)

            for topic in topics:
                if topic.strip():
                    st.markdown(f"### 🔍 Topic: {topic.strip()}")
                    videos = get_top_youtube_videos(topic)
                    for v in videos:
                        st.markdown(f"- [{v['title']}]({v['url']}) — **{v['channel']}** 🎥 \n"
                                    f"  Views: {v['views']:,}, Likes: {v['likes']:,}")
        else:
            st.warning("Please upload and process notes to see suggested videos.")

        

    # ----------- Tab 6: Study Plan -----------
    with tab6:
        st.header("🗓️ Personalized Study Plan")
        st.write("Generate a 7-day study plan based on your uploaded notes.")

        if st.session_state.conversation:
            with st.spinner("Preparing units..."):
                retriever = st.session_state.conversation.retriever
                all_docs = retriever.vectorstore.docstore._dict.values()
                full_text = "\n".join([doc.page_content for doc in all_docs])
                units = extract_units_from_notes(full_text)

            if units:
                if st.button("🗓️ Generate Personalized Study Plan"):
                    with st.spinner("Creating your study plan..."):
                        from langchain_groq import ChatGroq
                        llm = ChatGroq(model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"))
                        prompt = (
                            f"You are a study planner assistant. Given these units:\n"
                            f"{list(units.keys())}\n"
                            "Create a 7-day study plan, assigning units/topics to each day. "
                            "Balance the workload and include revision days. Format as a markdown table."
                        )
                        plan = llm.invoke(prompt).content
                        st.markdown("**Your Study Plan:**")
                        st.markdown(plan)
            else:
                st.warning("No units detected in your notes. Please upload and process your notes first.")
        else:
            st.warning("Please upload and process your notes in the 'Chat with Book' tab first.")

    # ----------- Tab 7: Pomodoro Timer -----------
    with tab7:
        st.header("⏲️ Pomodoro Timer")
        st.write("Boost your productivity! Use the Pomodoro technique: 25 minutes study, 5 minutes break.")

        if "pomo_running" not in st.session_state:
            st.session_state.pomo_running = False
        if "pomo_start_time" not in st.session_state:
            st.session_state.pomo_start_time = None
        if "pomo_mode" not in st.session_state:
            st.session_state.pomo_mode = "Study"  # or "Break"
        if "pomo_seconds_left" not in st.session_state:
            st.session_state.pomo_seconds_left = 25 * 60  # 25 minutes

        def start_pomodoro(minutes, mode):
            st.session_state.pomo_running = True
            st.session_state.pomo_mode = mode
            st.session_state.pomo_start_time = time.time()
            st.session_state.pomo_seconds_left = minutes * 60

        def stop_pomodoro():
            st.session_state.pomo_running = False
            st.session_state.pomo_start_time = None

        col1, col2, col3 = st.columns(3)
        with col1:
            if st.button("Start Study (25 min)"):
                start_pomodoro(25, "Study")
        with col2:
            if st.button("Start Break (5 min)"):
                start_pomodoro(5, "Break")
        with col3:
            if st.button("Stop Timer"):
                stop_pomodoro()

        if st.session_state.pomo_running:
            elapsed = int(time.time() - st.session_state.pomo_start_time)
            seconds_left = st.session_state.pomo_seconds_left - elapsed
            if seconds_left <= 0:
                st.session_state.pomo_running = False
                st.success(f"{st.session_state.pomo_mode} session complete! 🎉")
            else:
                mins, secs = divmod(seconds_left, 60)
                st.info(f"{st.session_state.pomo_mode} Time Left: **{mins:02d}:{secs:02d}**")
                st.rerun()  # Auto-update timer

    # ----------- Tab 8: Progress Tracker -----------



    # In your EduTube tab, replace get_top_youtube_videos with search_educational_videos:
        with tab8:
            st.header("🎥 EduTube: Educational Video Platform")
            st.write("Search and watch educational YouTube videos on any topic!")

            search_query = st.text_input("Enter a topic to search for educational videos:", key="edutube_search")
            if st.button("🔍 Search Videos", key="edutube_search_btn") and search_query.strip():
                with st.spinner("Fetching educational videos..."):
                    videos = search_educational_videos(search_query)
                    if videos:
                        for v in videos:
                            st.markdown(f"#### {v['title']}")
                            st.markdown(f"**Channel:** {v['channel']}  \nViews: {v['views']:,}")
                            st.video(f"https://www.youtube.com/watch?v={v['video_id']}")
                            st.markdown("---")
                    else:
                        st.warning("No educational videos found for this topic.")
            else:
                st.info("Enter a topic and click 'Search Videos' to find educational content.")

def export_summary_pdf(unit_title, summary):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, f"{unit_title}\n\n{summary}")
    pdf_bytes = pdf.output(dest='S').encode('latin1')  # Get PDF as bytes
    b64 = base64.b64encode(pdf_bytes).decode()
    href = f'<a href="data:application/pdf;base64,{b64}" download="{unit_title}_summary.pdf">📄 Download Summary as PDF</a>'
    return href

if __name__ == '__main__':
    main()