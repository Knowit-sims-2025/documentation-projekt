// components/WeeklyControlsWeek.tsx
import React, { useRef } from "react";
import {
  dateToISOWeekString,
  isoWeekStringToMonday,
  maxISOWeekStringForToday,
} from "../utils/week";

export function WeeklyControlsWeek({
  monday,
  updatedAt,
  onRefresh,
  onChange, // (nextMonday: string) => void
  minWeek,
  maxWeek,
  // rangeLabel är valfritt – visa det om du vill
  rangeLabel,
}: {
  monday: string;
  updatedAt: Date | null;
  onRefresh: () => void;
  onChange: (nextMonday: string) => void;
  minWeek?: string; // "YYYY-Www"
  maxWeek?: string; // "YYYY-Www"
  rangeLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const weekValue = dateToISOWeekString(monday);
  const computedMax = maxWeek ?? maxISOWeekStringForToday();

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    // Chrome/Safari m.fl.
    // @ts-expect-error: showPicker finns inte i TS-typerna för alla inputs
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click(); // fallback
  };

  const handleChange = (val: string) => {
    if (!val) return;
    onChange(isoWeekStringToMonday(val));
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
      {/* ⬇️ Gör hela vänstra blocket klickbart */}
      <div
        onClick={openPicker}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
        title="Välj vecka"
        role="button"
        aria-controls="weekly-week"
      >
        {/* Label kopplad till input (bra för a11y) */}
        <label
          htmlFor="weekly-week"
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          Välj vecka:
        </label>

        {/* Själva week-inputen – behåll synlig, men vi öppnar den även via openPicker */}
        <input
          ref={inputRef}
          id="weekly-week"
          type="week"
          value={weekValue}
          min={minWeek}
          max={computedMax}
          onChange={(e) => handleChange(e.target.value)}
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

        {/* Valfritt: liten text bredvid */}
        {rangeLabel && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {rangeLabel}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Uppdaterad {updatedAt?.toLocaleTimeString() ?? "—"}
        </span>
        <button
          className="widget__remove"
          onClick={onRefresh}
          title="Uppdatera"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
