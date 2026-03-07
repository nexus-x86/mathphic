import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Initialize the Gemini client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

model_name = "gemini-3-flash-preview"  # Requested FLASH model

def read_robot_md():
    with open(os.path.join(os.path.dirname(__file__), "robot.md"), "r") as f:
        return f.read()

INTERPRETER_PROMPT = """
You are the Interpreter. Your job is to generate a 'Desp' script based on the specific point of instruction provided.
A 'Desp' script is a specialized plaintext scripting language to animate math inside the Desmos Graphing Calculator.

Here are the rules for Desp:
{robot_md}

CRITICAL RULES:
- ONLY output valid Desp script text. Do not wrap your response in markdown code blocks. Every valid command must be on its own line.
- The `say` command MUST ONLY output human readable and TTS-friendly language. ABSOLUTELY NO LaTeX output in the `say` command. Speak naturally to the student.
- Make sure to choose colors for your lines, curves, and points that have high contrast and are clearly visible against a white background (e.g., use vibrant or dark colors, avoid white or very light yellow).
- Simply execute whatever the plan specified to create the instructions.
- ONLY generate the Desp instructions for the CURRENT POINT requested. Do not generate the entire script. Assume previous commands have already run.
"""

points = [
    """*   **Point 1: Setting the Target ($c$ and $L$)**
    *   *What is shown:* The user sees a graph of $f(x)$. They can drag a point $c$ on the x-axis, and a dotted line traces up to the function and over to the y-axis to find $L$.
    *   *What it demonstrates:* This anchors the user in the intuitive definition of a limit before introducing the rigorous math. It establishes the "target" we are trying to hit.""",

    """*   **Point 2: The Skeptic's Challenge (Introducing $\epsilon$)**
    *   *What is shown:* The user is given an $\epsilon$ slider. Adjusting it creates a blue shaded horizontal band across the entire graph from $y = L-\epsilon$ to $y = L+\epsilon$. 
    *   *What it demonstrates:* This introduces the first half of the formal definition ($|f(x) - L| < \epsilon$). It explains that $\epsilon$ is simply an acceptable margin of error for our output.""",

    """*   **Point 3: The Prover's Response (Introducing $\delta$)**
    *   *What is shown:* The user is given a $\delta$ slider. Adjusting it creates a yellow shaded vertical band from $x = c-\delta$ to $x = c+\delta$. 
    *   *What it demonstrates:* This introduces the second half of the formal definition ($|x - c| < \delta$). It shows that $\delta$ is the control knob we use on the input to try and satisfy the $\epsilon$ error margin.""",

    """*   **Point 4: The Intersection Box (The Testing Ground)**
    *   *What is shown:* The intersection of the horizontal $\epsilon$-band and vertical $\delta$-band creates a distinct rectangular "bounding box" around the limit point. 
    *   *What it demonstrates:* This visualizes the conditional statement "IF we restrict x to the $\delta$ window, THEN the outputs map to the $\epsilon$ window." The user focuses their attention strictly on what happens to the function *inside* this box.""",

    """*   **Point 5: The "Win" Condition (Color-Coded Feedback)**
    *   *What is shown:* If any part of the function exits the *top or bottom* of the bounding box, the box turns **Red**. If the function exits strictly through the *left and right* sides of the box, it turns **Green**.
    *   *What it demonstrates:* This allows the user to intuitively "play the game." It demonstrates exactly what constitutes a successful $\delta$ choice: keeping the graph's outputs strictly within the allowed $\epsilon$ tolerance.""",

    """*   **Point 6: Shrinking Epsilon (The "For Every" Clause)**
    *   *What is shown:* An automated animation takes over. The system artificially shrinks the $\epsilon$ band. The box turns Red. The user must manually shrink their $\delta$ slider to turn it Green again. This repeats for increasingly smaller values.
    *   *What it demonstrates:* This teaches the phrase "For *every* $\epsilon > 0$". It proves that finding just one $\delta$ isn't enough; a true limit means you can always find a $\delta$, all the way down to an infinitely small $\epsilon$. """,

    """*   **Point 7: The Punctured Neighborhood (The Exception)**
    *   *What is shown:* The graph switches to one with a literal hole at $(c, L)$, and a defined point floating somewhere else on the y-axis. The center vertical line at $x=c$ is removed from the $\delta$ band.
    *   *What it demonstrates:* This explains the mysterious $0 < |x - c|$ part of the proof. It shows that we care about the window *around* $c$, but absolutely not what happens *at* $c$. The bounding box game works perfectly even if the point is missing.""",

    """*   **Point 8: The Breaking Point (When Limits Fail)**
    *   *What is shown:* The graph switches to a jump discontinuity. The user is prompted to set a large $\epsilon$ (which works) and then forced to shrink $\epsilon$ smaller than the jump gap. No matter how small they make $\delta$, the box stays Red.
    *   *What it demonstrates:* By seeing how the definition breaks, the user truly understands how it works. It proves that limits do not exist at jumps because it is impossible to satisfy a small $\epsilon$ tolerance when the outputs are fundamentally disconnected."""
]

def generate_gemini_response(payload: str) -> str:
    response = client.models.generate_content(
        model=model_name,
        contents=payload
    )
    return response.text

def main():
    print("==================================================")
    print("Testing Gemini Flash Step-by-Step with Benchmarking")
    print("==================================================\n")

    robot_md = read_robot_md()
    interpreter_prompt = INTERPRETER_PROMPT.format(robot_md=robot_md)

    final_script_parts = []
    total_start_time = time.time()

    for idx, point in enumerate(points):
        print(f"--- [Point {idx+1}] Processing Started ---")
        
        point_start_time = time.time()
        
        payload = f"SYSTEM SETUP: {interpreter_prompt}\n\nCurrent Instruction for Step {idx+1}:\n{point}"
        script_part = generate_gemini_response(payload)
        
        point_end_time = time.time()
        point_duration = point_end_time - point_start_time
        
        final_script_parts.append(f"# --- Point {idx+1} ---")
        final_script_parts.append(script_part.strip())
        
        print(f"--- [Point {idx+1}] Done | Time Elapsed: {point_duration:.2f} seconds ---\n")

    total_end_time = time.time()
    total_duration = total_end_time - total_start_time

    print("==================================================")
    print("FINAL AGGREGATED DESP SCRIPT:")
    print("==================================================")
    print("\n".join(final_script_parts))
    print("==================================================")
    print(f"TOTAL TIME ELAPSED: {total_duration:.2f} seconds")
    print("==================================================")

if __name__ == "__main__":
    main()