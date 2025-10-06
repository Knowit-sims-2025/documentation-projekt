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
      className="theme-toggle-wrap"
      title="Change theme light/dark"
      aria-label={label}
      role="group"
    >
      <img
        src={lightModeIcon}
        alt="Icon for light mode"
        aria-hidden="true"
        className="theme-toggle-wrap__icon"
        style={{ opacity: checked ? 0.3 : 1 }}
      />
      <Switch
        checked={checked}
        onChange={(next) => setTheme(next ? "dark" : "light")}
        ariaLabel={label}
      />
      <img
        src={darkModeIcon}
        alt="Icon for dark mode"
        aria-hidden="true"
        className="theme-toggle-wrap__icon"
        style={{ opacity: checked ? 1 : 0.3 }}
      />
    </div>
  );
}
