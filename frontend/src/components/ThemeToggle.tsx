import React from "react";
import Switch from "./ui/switch";
// 1. Importera dina SVG-ikoner
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
    <Switch
      checked={checked}
      onChange={(next) => setTheme(next ? "dark" : "light")}
      ariaLabel={label}
      onLabel="🌙"
      offLabel="☀️"
      // 2. Använd ikonerna istället för emojis.
      //    Notera att prop-namnen är onIcon/offIcon.
      onIcon={<img src={darkModeIcon} alt="Dark mode" />}
      offIcon={<img src={lightModeIcon} alt="Light mode" />}
      className="theme-toggle"
    />
  );
}
