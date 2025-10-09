import React from "react";
import Switch from "./ui/switch";
import darkModeIcon from "../assets/dark_mode.svg";
import lightModeIcon from "../assets/light_mode.svg";

interface ThemeToggleProps {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const checked = theme === "dark";
  const label = `Byt till ${checked ? "ljust" : "mörkt"} läge`;

  return (
    <div
      className="theme-toggle"
      title="Change theme light/dark"
      aria-label={label}
      role="group"
    >
      <div
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--sun"
        style={{ opacity: checked ? 0.3 : 1 }}
      />
      <Switch
        checked={checked}
        onChange={(next) => setTheme(next ? "dark" : "light")}
        ariaLabel={label}
      />
      <div
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--moon"
        style={{ opacity: checked ? 1 : 0.3 }}
      />
    </div>
  );
}
