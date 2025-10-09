import React from "react";

interface SettingsButtonProps {
  onClick: () => void;
}

export default function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      className="icon-button"
      onClick={onClick}
      aria-label="Inställningar"
      title="Inställningar"
    >
      <div className="icon-button__icon" />
    </button>
  );
}
