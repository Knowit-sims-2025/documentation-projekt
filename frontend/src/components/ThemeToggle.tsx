import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const label = `Byt till ${theme === "light" ? "mörkt" : "ljust"} läge`;

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__sun" aria-hidden="true">
        ☀️
      </span>
      <span className="theme-toggle__moon" aria-hidden="true">
        🌙
      </span>
      <span className="theme-toggle__slider"></span>
    </button>
  );
};

export default ThemeToggle;
