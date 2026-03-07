# Desp

A lightweight, modular scripting engine for the [Desmos Graphing Calculator API](https://www.desmos.com/api). This project allows you to drive complex Desmos mathematical animations and plots using simple, line-by-line text commands, rather than relying on the default Desmos UI or hardcoded javascript. Meant to make it easy for LLMs to create demsos visualization. 

Preview

### Manim / 3Blue1Brown Aesthetic
When picking colors for your commands (like graphs and equations), you MUST use hex codes corresponding to standard Manim/3B1B color themes:
- **Blue:** `"#58C4DD"`
- **Yellow:** `"#FFFF00"`
- **Green:** `"#83C167"`
- **Red:** `"#FC6255"`
- **Purple:** `"#9A72AC"`
- **Teal:** `"#29ABCA"`
- **Orange:** `"#FF862F"`

---


## Capabilities & Syntax Structure

### 1. Global Commands
These commands require zero arguments.
- `resetViewport` : Wipes the entire Desmos graph and camera to a blank slate.
- `freeAll` : Removes all items and variables created by the script engine.
- `pauseAnimations` : Forcefully stops all active interpolation and slide animations.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

The application features a split-pane layout:
- **Left Pane:** A `<textarea>` where you write your scripting commands.
- **Right Pane:** The live Desmos graphing calculator instance.

Write your commands in the text area (one command per line) and click **"Run Script"** to execute them.

The scripting engine uses a simple `command arg1 arg2 ...` format. Arguments containing spaces or special characters should be wrapped in double quotes `" "`.

### Graphing Commands (Desmos)

- **`plotEquation <id> <equation_latex> [color_hex]`**
  Plots a static math equation.
  *Example:* `plotEquation "eq2" "y=\sin(x)" "#ff0000"`

- **`plotCoordinate <id> <x> <y> [color_hex]`**
  Plots a static point on the graph.
  *Example:* `plotCoordinate "pt1" 0 0 "#00ff00"`

- **`animateCoordinate <id> <coordinate_latex> <slider_variable> <min_val> <max_val> [color_hex] [duration_ms]`**
  Animates a coordinate's movement over time.
  *Example:* `animateCoordinate "pt1" "(c, 0)" "c" -5 5 "#0000ff" 2000`

- **`animateDottedEquation <id> <equation_latex> <slider_variable> <min_val> <max_val> [color_hex] [duration_ms]`**
  Animates a dotted line (like an asymptote or sweep).
  *Example:* `animateDottedEquation "line1" "x=a" "a" -5 0 "#ffff00" 5000`

- **`zoomToPoint <x> <y> [viewport_size]`**
  Smoothly pans the camera to a specific coordinate.
  *Example:* `zoomToPoint 0 0 10`

### Equation Rendering (Canvas / Manim-Style)

## Best Practices for LLMs
1. **Always use standard LaTeX:** Desmos requires standard math LaTeX formatting. For absolute values, use `\abs(x)` instead of `|x|`. For square roots, use `\sqrt{x}`.
2. **Sequential Animations run concurrently:** If you write two `animateCoordinate` commands back to back, they will execute at the exact same time. There is no built-in `delay` natively in the text script.
3. **Escaping backslashes:** When generating strings, ensure LaTeX backslashes are properly escaped if your generation environment requires it (e.g., `\\sin(x)` in JSON payloads vs `\sin(x)` in raw text).
4. **Always setup the graph:** It is strongly recommended to start your scripts with `resetViewport` and a `zoomToPoint` command to ensure the viewport is completely clean before plotting.
