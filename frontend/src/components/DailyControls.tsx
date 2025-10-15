import React, { useRef, useCallback } from "react";

export function DailyControls({
  date,
  today,
  updatedAt,
  onDateChange,
  onResetToToday,
  onRefresh,
}: {
  date: string;
  today: string;
  updatedAt: Date | null;
  onDateChange: (next: string) => void;
  onResetToToday: () => void;
  onRefresh: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Öppna native date-picker för hela klickytan
  const openPicker = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    const withPicker = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") {
      withPicker.showPicker();
    } else {
      el.click(); // fallback
    }
  }, []);

  // A11y: Enter/Space på “knappen” ska öppna pickern
  const onKeyOpen: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  // Klampa till today om användaren försöker välja framtida datum
  const handleInputChange = (val: string) => {
    if (!val) return;
    onDateChange(val > today ? today : val);
  };

  return (
    <div
      className="leaderboard__controls"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
      }}
    >
      {/* HELA blocket klickbart */}
      <div
        onClick={openPicker}
        onKeyDown={onKeyOpen}
        role="button"
        tabIndex={0}
        aria-controls="daily-date"
        title="Välj datum"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <label
          htmlFor="daily-date"
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          Välj datum:
        </label>

        <input
          ref={inputRef}
          id="daily-date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => handleInputChange(e.target.value)}
          // Viktigt: låt input vara fokuserbar och klickbar (för tillgänglighet),
          // men den öppnas också när man klickar på hela blocket.
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "4px 8px",
            font: "inherit",
            cursor: "pointer",
          }}
        />

        {date !== today && (
          <button
            className="widget__remove"
            title="Tillbaka till idag"
            onClick={(e) => {
              // Stoppa bubbla så vi inte öppnar pickern samtidigt
              e.stopPropagation();
              onResetToToday();
            }}
          >
            ⟲
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Uppdaterad {updatedAt?.toLocaleTimeString() ?? "—"}
        </span>
        <button
          className="widget__remove"
          onClick={(e) => {
            // Stoppa bubbla så refresh inte öppnar pickern
            e.stopPropagation();
            onRefresh();
          }}
          title="Uppdatera"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
