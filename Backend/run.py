import requests
import json
import base64

JUDGE0_URL = "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true"

LANGUAGE_IDS = {
    "python": 71,   # Python 3.8.1
    "java": 62,     # Java 17
    "cpp": 54,      # C++17
    "javascript": 63
}

def run_code(language, code):
    payload = {
        "language_id": LANGUAGE_IDS[language.lower()],
        "source_code": base64.b64encode(code.encode()).decode(),
        "stdin": base64.b64encode("".encode()).decode()
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(JUDGE0_URL, headers=headers, data=json.dumps(payload))
    result = response.json()

    stdout = base64.b64decode(result.get("stdout", "")).decode() if result.get("stdout") else ""
    stderr = base64.b64decode(result.get("stderr", "")).decode() if result.get("stderr") else ""
    compile_output = base64.b64decode(result.get("compile_output", "")).decode() if result.get("compile_output") else ""

    return stdout, stderr, compile_output
