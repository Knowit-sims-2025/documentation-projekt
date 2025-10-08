import React from "react";
import type { Theme } from "../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  return (
    <header className="app__header">
      <div className="container">
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}
