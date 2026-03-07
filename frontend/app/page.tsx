"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Interactive graphic: Delta-Epsilon Proof ──
function DeltaEpsilonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ y: 0.75 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // top of canvas = large epsilon, bottom = small epsilon
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const a = 1.4;
    const f = (x: number) => x * x;
    const L = f(a);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#08080e";
      ctx.fillRect(0, 0, w, h);

      const xMin = -0.2, xMax = 3.0;
      const yMin = -0.2, yMax = 4.5;
      const pad = { left: 44, right: 20, top: 80, bottom: 80 };
      const gw = w - pad.left - pad.right;
      const gh = h - pad.top - pad.bottom;

      const toSx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * gw;
      const toSy = (y: number) => pad.top + gh - ((y - yMin) / (yMax - yMin)) * gh;

      // Axes
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toSx(0), toSy(yMin));
      ctx.lineTo(toSx(0), toSy(yMax));
      ctx.moveTo(toSx(xMin), toSy(0));
      ctx.lineTo(toSx(xMax), toSy(0));
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "10px monospace";
      ctx.fillText("x", toSx(xMax) - 10, toSy(0) + 14);
      ctx.fillText("y", toSx(0) + 5, toSy(yMax) + 12);

      // Epsilon driven by cursor Y: top = large, bottom = small
      const eps = 0.07 + (1 - Math.max(0, Math.min(1, mouseRef.current.y))) * 0.63;
      const delta = eps / (2 * a + 0.5);

      // Epsilon band (horizontal strips)
      ctx.fillStyle = "rgba(255, 100, 100, 0.12)";
      ctx.fillRect(toSx(xMin), toSy(L + eps), gw, toSy(L - eps) - toSy(L + eps));
      ctx.strokeStyle = "rgba(255, 100, 100, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(toSx(xMin), toSy(L + eps));
      ctx.lineTo(toSx(xMax), toSy(L + eps));
      ctx.moveTo(toSx(xMin), toSy(L - eps));
      ctx.lineTo(toSx(xMax), toSy(L - eps));
      ctx.stroke();
      ctx.setLineDash([]);

      // Delta band (vertical strips)
      ctx.fillStyle = "rgba(51, 165, 196, 0.12)";
      ctx.fillRect(toSx(a - delta), toSy(yMax), toSx(a + delta) - toSx(a - delta), gh);
      ctx.strokeStyle = "rgba(51, 165, 196, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(toSx(a - delta), toSy(yMin));
      ctx.lineTo(toSx(a - delta), toSy(yMax));
      ctx.moveTo(toSx(a + delta), toSy(yMin));
      ctx.lineTo(toSx(a + delta), toSy(yMax));
      ctx.stroke();
      ctx.setLineDash([]);

      // f(x) = x^2 curve
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= gw; px++) {
        const x = xMin + (px / gw) * (xMax - xMin);
        const sx = toSx(x);
        const sy = toSy(f(x));
        px === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Dashed lines from (a, 0) up to (a, L) and over to (0, L)
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(toSx(a), toSy(0));
      ctx.lineTo(toSx(a), toSy(L));
      ctx.lineTo(toSx(0), toSy(L));
      ctx.stroke();
      ctx.setLineDash([]);

      // Point on curve (a, L)
      ctx.beginPath();
      ctx.arc(toSx(a), toSy(L), 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Labels
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "rgba(255,100,100,0.9)";
      ctx.fillText("ε", toSx(xMin) + 3, toSy(L + eps) - 3);
      ctx.fillText("ε", toSx(xMin) + 3, toSy(L - eps) + 12);

      ctx.fillStyle = "rgba(51,165,196,0.9)";
      ctx.fillText("δ", toSx(a - delta) - 12, toSy(yMin + 0.1));
      ctx.fillText("δ", toSx(a + delta) + 3, toSy(yMin + 0.1));

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px monospace";
      ctx.fillText("L", toSx(0) - 16, toSy(L) + 4);
      ctx.fillText("a", toSx(a) - 3, toSy(0) + 14);

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

// ── Interactive graphic: 3D Perspective Grid ──
function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const project = (x: number, y: number, z: number, w: number, h: number, rotX: number, rotY: number) => {
      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 4;
      const scale = fov / (fov + z2);
      return {
        x: w / 2 + x1 * scale * Math.min(w, h) * 0.35,
        y: h / 2 + y1 * scale * Math.min(w, h) * 0.35,
        scale,
      };
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#08080e";
      ctx.fillRect(0, 0, w, h);

      t += 0.005;
      const rotY = t + (mouseRef.current.x - 0.5) * 1.5;
      const rotX = 0.5 + (mouseRef.current.y - 0.5) * 0.8;

      const gridSize = 5;
      const step = 2 / gridSize;

      // Grid lines
      for (let i = 0; i <= gridSize; i++) {
        const a = -1 + i * step;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 165, 196, 0.25)";
        ctx.lineWidth = 0.8;
        for (let j = 0; j <= gridSize; j++) {
          const b = -1 + j * step;
          const p = project(a, -0.5, b, w, h, rotX, rotY);
          j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 165, 196, 0.25)";
        for (let j = 0; j <= gridSize; j++) {
          const b = -1 + j * step;
          const p = project(b, -0.5, a, w, h, rotX, rotY);
          j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Animated vectors
      const vectors = [
        { from: [0, -0.5, 0], to: [0.7, 0.3, 0], color: "#ffdd00" },
        { from: [0, -0.5, 0], to: [-0.4, 0.5, 0.5], color: "#ff4d4d" },
      ];
      for (const vec of vectors) {
        const p0 = project(vec.from[0], vec.from[1], vec.from[2], w, h, rotX, rotY);
        const p1 = project(
          vec.to[0] * Math.cos(t * 0.5),
          vec.to[1],
          vec.to[2] * Math.sin(t * 0.5 + 1),
          w, h, rotX, rotY
        );
        ctx.beginPath();
        ctx.strokeStyle = vec.color;
        ctx.lineWidth = 2;
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const hs = 10;
        ctx.beginPath();
        ctx.fillStyle = vec.color;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p1.x - hs * Math.cos(angle - 0.4), p1.y - hs * Math.sin(angle - 0.4));
        ctx.lineTo(p1.x - hs * Math.cos(angle + 0.4), p1.y - hs * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

// ── Interactive graphic: Bell Curve ──
function BellCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const normal = (x: number, mu: number, sigma: number) =>
      Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#08080e";
      ctx.fillRect(0, 0, w, h);

      t += 0.01;
      const mu = mouseRef.current.x; // 0–1 range
      const sigma = 0.1 + 0.04 * Math.sin(t * 0.5);
      const pad = 40;
      const graphW = w - pad * 2;
      const graphH = h - pad * 2;
      const maxY = normal(mu, mu, sigma);

      // Axis
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, h - pad);
      ctx.lineTo(w - pad, h - pad);
      ctx.stroke();

      // Filled area
      ctx.beginPath();
      for (let px = 0; px <= graphW; px++) {
        const xVal = px / graphW;
        const yVal = normal(xVal, mu, sigma) / maxY;
        const sx = pad + px;
        const sy = h - pad - yVal * graphH * 0.8;
        px === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.lineTo(w - pad, h - pad);
      ctx.lineTo(pad, h - pad);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
      grad.addColorStop(0, "rgba(51, 165, 196, 0.5)");
      grad.addColorStop(1, "rgba(51, 165, 196, 0.0)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve stroke
      ctx.beginPath();
      ctx.strokeStyle = "#33a5c4";
      ctx.lineWidth = 2.5;
      for (let px = 0; px <= graphW; px++) {
        const xVal = px / graphW;
        const yVal = normal(xVal, mu, sigma) / maxY;
        const sx = pad + px;
        const sy = h - pad - yVal * graphH * 0.8;
        px === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Mean line
      const muX = pad + mu * graphW;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 221, 0, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(muX, h - pad);
      ctx.lineTo(muX, pad + graphH * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);

      // μ label
      ctx.fillStyle = "rgba(255,221,0,0.8)";
      ctx.font = "11px monospace";
      ctx.fillText("μ", muX + 4, pad + graphH * 0.18);

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

// ── Main Page ──
export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.003;

      ctx.lineWidth = 0.5;
      const spacing = 60;
      const offset = (time * 30) % spacing;

      ctx.strokeStyle = "rgba(100, 180, 220, 0.08)";
      for (let i = -h; i < w + h; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i + offset, 0);
        ctx.lineTo(i + offset - h * 0.7, h);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(160, 160, 160, 0.06)";
      for (let i = -h; i < w + h; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i - offset, 0);
        ctx.lineTo(i - offset + h * 0.7, h);
        ctx.stroke();
      }

      ctx.lineWidth = 1.5;

      ctx.strokeStyle = "rgba(180, 80, 70, 0.25)";
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h * 0.3 + Math.sin((x / w) * 4 + time * 2) * 180 +
          Math.cos((x / w) * 2.5 + time) * 100;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(51, 165, 196, 0.2)";
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h * 0.7 + Math.sin((x / w) * 3 - time * 1.5) * 150 +
          Math.cos((x / w) * 5 + time * 0.5) * 80;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(220, 160, 50, 0.15)";
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h * 0.5 + Math.sin((x / w) * 6 + time * 3) * 120 +
          Math.sin((x / w) * 1.5 - time * 2) * 200;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      const dotColors = ["rgba(51, 165, 196, 0.4)", "rgba(100, 180, 220, 0.3)", "rgba(255, 255, 255, 0.2)"];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          const dx = w - 80 + col * 14;
          const dy = 30 + row * 14;
          const pulse = Math.sin(time * 3 + row * 0.5 + col * 0.7) * 0.5 + 0.5;
          ctx.fillStyle = dotColors[(row + col) % dotColors.length];
          ctx.globalAlpha = 0.3 + pulse * 0.4;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);


  const capabilities = [
    {
      icon: "⊹",
      title: "AI-Generated Animations",
      description: "Describe any math concept in plain language and get a fully animated visual explanation generated instantly.",
    },
    {
      icon: "◈",
      title: "Interactive Graphing",
      description: "Powered by Desmos — plot equations, curves, parametric forms, and geometric constructions with live interaction.",
    },
    {
      icon: "⋯",
      title: "Dynamic Proofs",
      description: "Watch mathematical proofs unfold step-by-step with narrated walkthroughs and annotated derivations.",
    },
    {
      icon: "⊞",
      title: "Multi-Domain Coverage",
      description: "Spans vectors, calculus, linear algebra, probability, geometry, and more — all in one unified tool.",
    },
    {
      icon: "⇅",
      title: "Adjustable Complexity",
      description: "Dial in the explanation depth from high school fundamentals to advanced late-undergrad formalism.",
    },
    {
      icon: "↗",
      title: "Export Ready",
      description: "Export your visualizations as MP4, WebM, or GIF to share, embed, or include in presentations.",
    },
  ];

  const howToSteps = [
    {
      step: "01",
      title: "Type a Prompt",
      description: "Describe any math concept in plain English — e.g. \"Show me the epsilon-delta definition of a limit\" or \"Visualize eigenvalue decomposition.\"",
    },
    {
      step: "02",
      title: "Pick a Style",
      description: "Choose between an animated proof walkthrough, an interactive graph, or a step-by-step derivation. Set the complexity level to match your background.",
    },
    {
      step: "03",
      title: "Interact & Explore",
      description: "Drag sliders, rotate 3D views, and scrub through animations. Every visual is live — adjust parameters and watch the math update in real time.",
    },
  ];

  const galleryItems = [
    {
      label: "Delta-Epsilon Proof",
      tag: "Real Analysis",
      description: "Watch ε and δ shrink together",
      graphic: <DeltaEpsilonCanvas />,
    },
    {
      label: "Vector Fields",
      tag: "Linear Algebra",
      description: "Drag to rotate the 3D view",
      graphic: <GridCanvas />,
    },
    {
      label: "Probability Distributions",
      tag: "Statistics",
      description: "Hover to shift the mean",
      graphic: <BellCanvas />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#0a0a0f",
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── Hero Section ── */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
        />
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
            zIndex: 1, pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative", zIndex: 2, width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
          }}
        >
          <header
            style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", padding: "28px 40px",
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px",
                color: "#e2e8f0", textTransform: "uppercase", textDecoration: "none",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(-10px)",
                transition: "all 0.6s ease 0.2s", display: "block",
              }}
            >
              MATHVIZ
            </Link>
          </header>

          <main
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", paddingBottom: "80px",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, color: "#ffffff",
                letterSpacing: "-2px", marginBottom: "16px", textAlign: "center", lineHeight: 1,
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
              }}
            >
              Math Visualizer
            </h1>
            <p
              style={{
                fontSize: "clamp(0.9rem, 2vw, 1.15rem)", color: "rgba(255,255,255,0.5)",
                letterSpacing: "1px", marginBottom: "40px", textAlign: "center",
                fontFamily: "'Geist Mono', monospace",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(15px)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
              }}
            >
              Vectors · Calculus · Probability · Linear Algebra
            </p>
            <div
              style={{
                display: "flex", gap: "16px",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(15px)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s",
              }}
            >
              <a href="#capabilities" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "14px 32px", fontSize: "0.95rem", fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
                    color: "#e2e8f0", cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "0.5px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                >
                  Learn More
                </button>
              </a>
              <Link href="/app" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "14px 32px", fontSize: "0.95rem", fontWeight: 700,
                    border: "none", borderRadius: "8px",
                    background: "linear-gradient(135deg, #33a5c4, #0ea5e9)",
                    color: "#000", cursor: "pointer", transition: "all 0.3s ease",
                    letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px",
                    boxShadow: "0 0 30px rgba(51, 165, 196, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 40px rgba(51, 165, 196, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(51, 165, 196, 0.3)";
                  }}
                >
                  Explore <span style={{ fontSize: "1.1rem" }}>→</span>
                </button>
              </Link>
            </div>
          </main>

          <div
            style={{
              position: "absolute", bottom: "32px", left: "50%",
              transform: "translateX(-50%)", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "6px",
              opacity: loaded ? 0.5 : 0, transition: "opacity 1s ease 1.2s",
              animation: "float 2.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace" }}>
              Scroll Down
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(51,165,196,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Capabilities Section ── */}
      <section
        id="capabilities"
        style={{
          padding: "120px 80px",
          background: "linear-gradient(180deg, #0a0a0f 0%, #0d0d14 100%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "4px", color: "#33a5c4", textTransform: "uppercase", marginBottom: "16px", fontFamily: "monospace" }}>
            System Capabilities
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", marginBottom: "16px", lineHeight: 1.1 }}>
            Everything you need to understand math
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", marginBottom: "64px", maxWidth: "520px", lineHeight: 1.7 }}>
            MathViz combines an AI script engine with a powerful graphing layer to generate explanations that are visual, accurate, and level-appropriate.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                style={{
                  padding: "28px 24px", background: "#0d0d14", transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(51,165,196,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#0d0d14";
                }}
              >
                <div style={{
                  width: "28px", height: "28px", marginBottom: "16px",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", color: "rgba(255,255,255,0.5)",
                }}>
                  {cap.icon}
                </div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px", letterSpacing: "-0.2px" }}>{cap.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section
        style={{
          padding: "120px 80px",
          background: "#0d0d14",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "4px", color: "#33a5c4", textTransform: "uppercase", marginBottom: "16px", fontFamily: "monospace" }}>
            How to Use
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", marginBottom: "16px", lineHeight: 1.1 }}>
            Up and running in seconds
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", marginBottom: "64px", maxWidth: "520px", lineHeight: 1.7 }}>
            No setup. No configuration. Just describe what you want to understand and MathViz handles the rest.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {howToSteps.map((s) => (
              <div
                key={s.step}
                style={{
                  padding: "36px", background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
                  position: "relative",
                }}
              >
                <div style={{
                  fontSize: "2.5rem", fontWeight: 900, color: "rgba(51,165,196,0.12)",
                  fontFamily: "monospace", letterSpacing: "-2px", lineHeight: 1,
                  marginBottom: "20px",
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "12px", letterSpacing: "-0.3px" }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── See What's Possible ── */}
      <section
        style={{
          padding: "120px 80px",
          background: "linear-gradient(180deg, #0d0d14 0%, #0a0a0f 100%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "4px", color: "#33a5c4", textTransform: "uppercase", marginBottom: "16px", fontFamily: "monospace" }}>
            Gallery
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", marginBottom: "64px", lineHeight: 1.1 }}>
            See what&apos;s possible.
          </h2>

          {/* 2-up top row + full-width bottom */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "380px 260px", gap: "16px" }}>
            {galleryItems.map((item, i) => (
              <div
                key={item.label}
                style={{
                  gridColumn: i === 2 ? "1 / -1" : undefined,
                  position: "relative",
                  background: "#08080e",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(51,165,196,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                {/* Canvas fills box */}
                <div style={{ position: "absolute", inset: 0 }}>
                  {item.graphic}
                </div>

                {/* Overlay label */}
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "20px 24px",
                    background: "linear-gradient(0deg, rgba(8,8,14,0.9) 0%, transparent 100%)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "2px", color: "#33a5c4", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "4px" }}>
                      {item.tag}
                    </div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e2e8f0" }}>
                      {item.label}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontStyle: "italic" }}>
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: "64px", display: "flex", flexDirection: "column", alignItems: "center",
              gap: "20px", padding: "64px",
              background: "rgba(51,165,196,0.04)", border: "1px solid rgba(51,165,196,0.12)",
              borderRadius: "16px", textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
              Ready to visualize?
            </h3>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.4)", maxWidth: "400px", lineHeight: 1.7 }}>
              Open the app, type a prompt, and your math animation will be ready in seconds.
            </p>
            <Link href="/app" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "16px 40px", fontSize: "1rem", fontWeight: 700, border: "none",
                  borderRadius: "8px", background: "linear-gradient(135deg, #33a5c4, #0ea5e9)",
                  color: "#000", cursor: "pointer", transition: "all 0.3s ease",
                  letterSpacing: "0.5px", boxShadow: "0 0 30px rgba(51,165,196,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 40px rgba(51,165,196,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(51,165,196,0.3)";
                }}
              >
                Open MathViz →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 80px", borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "3px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>MATHVIZ</span>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>Math made visible.</span>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
