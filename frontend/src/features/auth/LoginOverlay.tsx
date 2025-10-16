// src/features/auth/LoginOverlay.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  dismissible?: boolean;
}

export function LoginOverlay({
  children,
  onClose,
  title,
  dismissible = true,
}: OverlayProps) {
  useEffect(() => {
    if (!dismissible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, dismissible]);

  const overlayMarkup = (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Login"}
      onClick={() => {
        if (dismissible) onClose();
      }}
    >
      <div className="overlay__card" onClick={(e) => e.stopPropagation()}>
        <div className="overlay__header">
          {title && <h3 className="overlay__title">{title}</h3>}
          {dismissible && (
            <button
              className="overlay__close-btn"
              onClick={onClose}
              title="Stäng"
            >
              &times;
            </button>
          )}
        </div>
        <div className="overlay__body">{children}</div>
      </div>
    </div>
  );

  return createPortal(overlayMarkup, document.body);
}
