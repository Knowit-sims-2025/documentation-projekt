import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

export function Overlay({ children, onClose, title }: OverlayProps) {
  // Stäng med Escape-tangenten
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Lås body-scroll när overlay är öppen
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Återställ body-scroll när komponenten tas bort
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const overlayMarkup = (
    // Root-element för overlayen
    <div className="overlay" onClick={onClose}>
      {/* Själva kortet/panelen. Stoppar klick-propagering så att klick inuti inte stänger. */}
      <div className="overlay__card" onClick={(e) => e.stopPropagation()}>
        {/* Header med titel och stängknapp */}
        <div className="overlay__header">
          {title && <h3 className="overlay__title">{title}</h3>}
          <button
            className="overlay__close-btn"
            onClick={onClose}
            title="Stäng"
          >
            &times;
          </button>
        </div>
        {/* Här renderas innehållet (t.ex. en användarprofil) */}
        <div className="overlay__body">{children}</div>
      </div>
    </div>
  );

  // Använd en Portal för att rendera overlayen direkt i document.body.
  return createPortal(overlayMarkup, document.body);
}
