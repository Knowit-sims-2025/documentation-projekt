import React from "react";
import Switch from "./ui/switch";

interface ThemeToggleProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const checked = theme === "dark";
  const label = `Byt till ${checked ? "ljust" : "mörkt"} läge`;

  return (
    <Switch
      checked={checked}
      onChange={(next) => setTheme(next ? "dark" : "light")}
      ariaLabel={label}
      onLabel="🌙"
      offLabel="☀️"
      className="theme-toggle"
    />
  );
}
