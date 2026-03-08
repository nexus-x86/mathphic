"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SidebarProps {
    settings: {
        narration: boolean;
        conceptLevel: number;
    };
    onSettingsChange: (key: string, value: any) => void;
    scriptText?: string;
    isRunning?: boolean;
    onPlay?: () => void;
    onStop?: () => void;
}

export default function Sidebar({ settings, onSettingsChange, scriptText, isRunning, onPlay, onStop }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<"settings" | "script">("settings");

    const conceptLabels = ["High School", "Early Undergrad", "Late Undergrad"];

    return (
        <div
            style={{
                width: "300px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "rgba(12, 12, 18, 0.95)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                overflow: "hidden",
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                style={{
                    padding: "20px 24px 0",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    color: "#e2e8f0",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "block",
                }}
            >
                MATHVIZ
            </Link>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    padding: "16px 24px 0",
                    gap: "0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {(["settings", "script"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            fontSize: "0.8rem",
                            fontWeight: activeTab === tab ? 600 : 400,
                            color: activeTab === tab ? "#33a5c4" : "rgba(255,255,255,0.4)",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab ? "2px solid #33a5c4" : "2px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textTransform: "capitalize",
                            letterSpacing: "0.5px",
                            fontFamily: "inherit",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                }}
            >
                {activeTab === "settings" ? (
                    <>
                        {/* Toggle: Narration */}
                        <ToggleRow
                            label="Narration"
                            value={settings.narration}
                            onChange={(v) => onSettingsChange("narration", v)}
                        />

                        {/* Concept Level */}
                        <div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "rgba(255,255,255,0.5)",
                                    marginBottom: "8px",
                                    letterSpacing: "0.3px",
                                }}
                            >
                                Concept Level
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={2}
                                step={1}
                                value={settings.conceptLevel}
                                onChange={(e) => onSettingsChange("conceptLevel", parseInt(e.target.value))}
                                style={{
                                    width: "100%",
                                    accentColor: "#33a5c4",
                                    cursor: "pointer",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.6rem",
                                    color: "rgba(255,255,255,0.35)",
                                    marginTop: "4px",
                                }}
                            >
                                {conceptLabels.map((label, i) => (
                                    <span
                                        key={label}
                                        style={{
                                            color: settings.conceptLevel === i ? "#33a5c4" : undefined,
                                            fontWeight: settings.conceptLevel === i ? 600 : 400,
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                            <ActionButton label="Load" variant="load" />
                            <ActionButton label="Export" variant="primary" />
                        </div>
                    </>
                ) : activeTab === "script" ? (
                    scriptText ? (
                        <pre
                            style={{
                                margin: 0,
                                padding: "12px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: "8px",
                                color: "rgba(255,255,255,0.7)",
                                fontSize: "0.72rem",
                                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                                lineHeight: 1.65,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowX: "hidden",
                            }}
                        >
                            {scriptText}
                        </pre>
                    ) : (
                        <div
                            style={{
                                color: "rgba(255,255,255,0.3)",
                                fontSize: "0.8rem",
                                textAlign: "center",
                                paddingTop: "40px",
                                fontStyle: "italic",
                            }}
                        >
                            No script yet
                        </div>
                    )
                ) : null}
            </div>

            {/* Play/Stop button — bottom right */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "12px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <button
                    onClick={isRunning ? onStop : onPlay}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: "none",
                        background: isRunning ? "rgba(239, 68, 68, 0.15)" : "rgba(51, 165, 196, 0.15)",
                        color: isRunning ? "#ef4444" : "#33a5c4",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = isRunning ? "rgba(239, 68, 68, 0.28)" : "rgba(51, 165, 196, 0.28)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = isRunning ? "rgba(239, 68, 68, 0.15)" : "rgba(51, 165, 196, 0.15)";
                    }}
                >
                    {isRunning ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

// -- Sub-components --

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: "40px",
                    height: "22px",
                    borderRadius: "11px",
                    border: "none",
                    background: value ? "#33a5c4" : "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                }}
            >
                <div
                    style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: "3px",
                        left: value ? "21px" : "3px",
                        transition: "left 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                />
            </button>
        </div>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{label}</span>
            {children}
        </div>
    );
}



function SelectInput({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "6px",
                padding: "5px 10px",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "0.75rem",
                outline: "none",
                cursor: "pointer",
                fontFamily: "inherit",
            }}
        >
            {options.map((opt) => (
                <option key={opt} value={opt} style={{ background: "#1a1a1a" }}>
                    {opt}
                </option>
            ))}
        </select>
    );
}

function ActionButton({ label, variant }: { label: string; variant: "primary" | "secondary" | "load" }) {
    const styles = {
        primary: {
            border: "none",
            background: "linear-gradient(135deg, #33a5c4, #0ea5e9)",
            color: "#000",
            hoverBg: "linear-gradient(135deg, #33a5c4, #0ea5e9)",
            leaveBg: "linear-gradient(135deg, #33a5c4, #0ea5e9)",
        },
        secondary: {
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.6)",
            hoverBg: "rgba(255,255,255,0.08)",
            leaveBg: "rgba(255,255,255,0.04)",
        },
        load: {
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.85)",
            hoverBg: "rgba(255,255,255,0.16)",
            leaveBg: "rgba(255,255,255,0.1)",
        },
    }[variant];

    const isPrimary = variant === "primary";
    return (
        <button
            style={{
                padding: "10px",
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: styles.border,
                background: styles.background,
                color: styles.color,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                letterSpacing: "0.3px",
                boxShadow: isPrimary ? "0 0 30px rgba(51, 165, 196, 0.3)" : "none",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.hoverBg;
                if (isPrimary) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 40px rgba(51, 165, 196, 0.5)";
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = styles.leaveBg;
                if (isPrimary) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(51, 165, 196, 0.3)";
                }
            }}
        >
            {label}
        </button>
    );
}
