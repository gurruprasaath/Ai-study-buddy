from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
import io
from services.loacal_run import run_locally  # Local runner utility
import logging

# Basic logger setup
logging.basicConfig(
    level=logging.INFO,  # Can be DEBUG, INFO, WARNING, ERROR, CRITICAL
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/run-code/")
async def run_code_api(
    code: str = Form(...),
    language: str = Form(...),
    stdin: str = Form("")
):
    logger.info(f"Running code in {language} with stdin: {stdin}")
    try:
        stdout, stderr, compile_output = run_locally(language.lower(), code, stdin=stdin)
        return {
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": compile_output
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/save-code/")
async def save_code(
    code: str = Form(...),
    language: str = Form(...)
):
    lang_ext = {
        "python": "py",
        "javascript": "js",
        "c++": "cpp",
        "java": "java"
    }
    ext = lang_ext.get(language.lower(), "txt")
    filename = f"solution.{ext}"
    file_bytes = io.BytesIO(code.encode("utf-8"))
    return StreamingResponse(
        file_bytes,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )