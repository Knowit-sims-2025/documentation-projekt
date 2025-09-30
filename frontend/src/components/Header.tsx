import React from "react";
import type { Theme } from "../hooks/useTheme";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  return (
    <header className="app__header">
      <div className="container">
        <h1 className="muted" style={{ margin: 0 }}>
          Dashboard
        </h1>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="muted">Theme</span>
          <select
            aria-label="Välj tema"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
      </div>
    </header>
  );
}
