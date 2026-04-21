import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../styles/local styles/Settings.css";

const accentColors = ["#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#f97316", "#a09797" ];

function Settings() {
  const [accent, setAccent] = useState<string>(() => {
    try {
      return localStorage.getItem("accent") || "#3b82f6";
    } catch {
      return "#3b82f6";
    }
  });

  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("theme");
      return (saved as "light" | "dark") || "light";
    } catch {
      return "light";
    }
  });

  // Apply theme class and persist whenever `mode` changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(mode === "light" ? "theme-light" : "theme-dark");
    try {
      localStorage.setItem("theme", mode);
    } catch {}
  }, [mode]);

  // Apply accent color CSS variable and persist whenever it changes
  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--accent-color", accent);
      localStorage.setItem("accent", accent);
    } catch {}
  }, [accent]);

  return (
    <div className="right-main">
         <div className={`settings-page ${mode === "dark" ? "dark" : ""}`}>
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>

        {/* Accent Color */}
        <div className="settings-card">
          <h2>Accent Color</h2>
          <div className="accent-options">
            {accentColors.map((color) => (
              <button
                key={color}
                className={`accent-btn ${accent === color ? "active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setAccent(color)}
              />
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="settings-card">
          <h2>Theme Mode</h2>
          <div className="theme-grid">
            <div
              className={`theme-btn ${mode === "light" ? "active" : ""}`}
              onClick={() => setMode("light")}
            >
              Light Mode
            </div>
            <div
              className={`theme-btn ${mode === "dark" ? "active" : ""}`}
              onClick={() => setMode("dark")}
            >
              Dark Mode
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="settings-card">
          <h2>App Theme Preview</h2>
          <div className="preview-row">
            <span>Current Theme</span>
          </div>

          <div className="preview-box">
            <p>This is how your app will look with the selected theme.</p>
            <button
              className="preview-accent"
              style={{ backgroundColor: accent }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  );
}

export default Settings;