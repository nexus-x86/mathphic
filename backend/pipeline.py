import os
import time
import anthropic
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
claude_client = anthropic.Anthropic(api_key=os.environ.get("CLAUDE_API_KEY"))
gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

gemini_model = "gemini-3.1-pro-preview"
claude_model = "claude-sonnet-4-6"

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")

def read_file(filename: str) -> str:
    with open(os.path.join(PROMPTS_DIR, filename), "r") as f:
        return f.read()

def read_root_file(filename: str) -> str:
    with open(os.path.join(os.path.dirname(__file__), filename), "r") as f:
        return f.read()

def generate_gemini_response(payload: str) -> str:
    response = gemini_client.models.generate_content(
        model=gemini_model,
        contents=payload
    )
    return response.text

def generate_claude_response(payload: str) -> str:
    response = claude_client.messages.create(
        model=claude_model,
        max_tokens=8192,
        messages=[{"role": "user", "content": payload}]
    )
    return response.content[0].text

def run_pipeline(user_message: str):
    print("==================================================")
    print(f"User Message: {user_message}\n")
    start_time = time.time()

    # Read all prompt files
    robot_md = read_root_file("robot.md")
    planner_prompt = read_file("planning.md")
    validator_prompt = read_file("validator.md")

    # Step 1: Planner (Gemini Pro)
    print("--- [1] Planner Phase Started (Gemini Pro) ---")
    planner_payload = f"{planner_prompt}\n\nUSER MESSAGE: {user_message}"
    plan = generate_gemini_response(planner_payload)
    print("--- [1] Planner Phase Done ---\n")

    # Step 2: Interpreter (Claude Sonnet)
    print("--- [2] Interpreter Phase Started (Claude Sonnet) ---")
    interpreter_payload = f"{robot_md}\n\nPLANNER OUTPUT:\n{plan}"
    script_v1 = generate_claude_response(interpreter_payload)
    print("--- [2] Interpreter Phase Done ---\n")

    # Step 3: Validator (Claude Sonnet)
    print("--- [3] Validator Phase Started (Claude Sonnet) ---")
    validator_payload = f"{validator_prompt}\n\nDESP LANGUAGE REFERENCE:\n{robot_md}\n\nCURRENT SCRIPT TO VALIDATE AND CORRECT:\n{script_v1}"
    final_script = generate_claude_response(validator_payload)
    print("--- [3] Validator Phase Done ---\n")

    print(plan)
    print("\n\n==================================================")
    print("FINAL DESP SCRIPT (validated):")
    print("==================================================")
    print(final_script)
    print("==================================================\n")

    # Write final script to output.txt
    output_path = os.path.join(os.path.dirname(__file__), "prompts", "output.txt")
    with open(output_path, "w") as f:
        f.write(final_script)
    print(f"Script written to {output_path}")

    end_time = time.time()
    print(f"Total time elapsed: {end_time - start_time:.2f} seconds\n")

    return final_script

if __name__ == "__main__":
    test_msg = "explain to me the riemann definition of integrability"
    run_pipeline(test_msg)
