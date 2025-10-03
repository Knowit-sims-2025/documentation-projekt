import React from "react";

type Props = {
  checked: boolean; // true/false state
  onChange: (next: boolean) => void; // callback när man togglar
  onIcon?: React.ReactNode; // ikon/text för ON
  offIcon?: React.ReactNode; // ikon/text för OFF
  ariaLabel?: string; // tillgänglighetslabel
  className?: string; // extra klasser
};

export default function Switch({
  checked,
  onChange,
  onIcon = "🌙",
  offIcon = "☀️",
  ariaLabel = "toggle",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`ui-switch ${className}`}
    >
      <span className="ui-switch__off" aria-hidden="true">
        {offIcon}
      </span>
      <span className="ui-switch__on" aria-hidden="true">
        {onIcon}
      </span>
      <span className="ui-switch__slider" aria-hidden="true" />
    </button>
  );
}
