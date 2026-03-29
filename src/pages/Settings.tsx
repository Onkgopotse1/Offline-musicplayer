import { Link } from "react-router-dom";
import React, { useState } from "react";
import "./Settings.css";

const accentColors = ["#3b82f6", "#a855f7", "#22c55e", "#ef4444", "#f97316"];

function Settings() {
  const [accent, setAccent] = useState(accentColors[0]);
  const [mode, setMode] = useState<"light" | "dark">("light");

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
            <span className="preview-badge">
              {mode === "light" ? "Light" : "Dark"}
            </span>
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