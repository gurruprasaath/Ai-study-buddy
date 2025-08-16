import streamlit as st
from groq import Groq
import os
from dotenv import load_dotenv
import re
from run import run_code  # Judge0 API runner
from loacal_run import check_executable,run_locally  # Local runner utility
# --- Helper to clean code ---
def clean_code(text):
    code_block = re.search(r"```(?:\w+)?\n([\s\S]*?)```", text)
    if code_block:
        return code_block.group(1).strip()
    return text.strip()



# --- Load API Key ---
load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise EnvironmentError("GROQ_API_KEY not set in .env file.")

# --- Groq Client ---
client = Groq(api_key=API_KEY)

# --- Streamlit UI ---
st.set_page_config(page_title="LeetCode Code Generator", page_icon="💻")
st.title("💻 AI Code Generator with Groq")
st.write("Paste a programming question and get a **working solution** in your selected language.")

problem = st.text_area("📝 Enter Problem Statement", height=200)
language = st.selectbox("Select Programming Language", ["Python", "JavaScript", "C++", "Java"])

# --- Generate Code ---
if st.button("🚀 Generate Code"):
    if not problem.strip():
        st.error("Please enter a problem statement.")
    else:
        with st.spinner("Generating code..."):
            prompt = f"""
Write a complete, error-free {language} program for the following problem:
{problem}

Output rules:
1. Return ONLY the code.
2. Do not add explanations, headings, or Markdown backticks.
3. Ensure the code is ready to run without modification.
"""
            try:
                response = client.chat.completions.create(
                    model="llama3-70b-8192",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0
                )

                code = response.choices[0].message.content
                cleaned_code = clean_code(code)

                st.session_state["generated_code"] = cleaned_code  # Save code
                #st.code(cleaned_code, language.lower())

            except Exception as e:
                st.error(f"Error: {str(e)}")

# --- Run Generated Code ---
# After generating and saving st.session_state["generated_code"]
# --- Display Generated Code ---
user_input_text = st.text_area("Enter input for your program:", height=100, placeholder="One line per input, as your program expects...")

if "generated_code" in st.session_state:
    st.subheader("Generated Code")

    # Add an edit mode toggle
    if "edit_mode" not in st.session_state:
        st.session_state.edit_mode = False

    col1, col2, col3 = st.columns([7, 1, 1])
    with col1:
        if st.session_state.edit_mode:
            # Editable code area
            edited_code = st.text_area("Edit your code below:", st.session_state["generated_code"], height=300, key="editable_code")
        else:
            st.code(st.session_state["generated_code"], language.lower())
    with col2:
        if st.button("✏️ Edit" if not st.session_state.edit_mode else "💾 Save", key="edit_btn"):
            st.session_state.edit_mode = not st.session_state.edit_mode
            if not st.session_state.edit_mode:
                st.session_state["generated_code"] = st.session_state.get("editable_code", st.session_state["generated_code"])
    with col3:
        # --- Save to File Button ---
        # Map language to extension
        lang_ext = {
            "python": "py",
            "javascript": "js",
            "c++": "cpp",
            "java": "java"
        }
        ext = lang_ext.get(language.lower(), "txt")
        filename = f"solution.{ext}"
        st.download_button(
            label="💾 Save File",
            data=st.session_state.get("editable_code", st.session_state["generated_code"]) if st.session_state.edit_mode else st.session_state["generated_code"],
            file_name=filename,
            mime="text/plain"
        )

    # Add a "Run Code" button without replacing the code
    if st.button("▶ Run Code"):
        code_to_run = st.session_state.get("editable_code", st.session_state["generated_code"]) if st.session_state.edit_mode else st.session_state["generated_code"]
        stdout, stderr, compile_output = run_locally(language.lower(), code_to_run, stdin=user_input_text)

        # Create a new section below for output
        st.markdown("---")
        st.subheader("Execution Output")
        if stdout:
            st.success(f"Output:\n{stdout}")
        if stderr:
            st.error(f"Error:\n{stderr}")
        if compile_output:
            st.error(f"Compile Error:\n{compile_output}")
    