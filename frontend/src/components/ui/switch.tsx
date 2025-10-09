import React from "react";

/**
 * Kontrollerad switch-komponent.
 * - "checked" styrs utifrån (parent state).
 * - "onChange" anropas med nästa boolean när användaren togglar.
 */
type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export default function Switch({
  checked,
  onChange,
  ariaLabel = "switch",
  className = "",
  disabled = false,
}: Props) {
  // Tangentbordsstöd (Space/Enter)
  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  }

  // Sätt bas-klass + ev. extra klasser från prop
  const classes = ["ui-switch", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={classes}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={onKeyDown}
    >
      <span className="ui-switch__slider" aria-hidden="true" />
    </button>
  );
}
