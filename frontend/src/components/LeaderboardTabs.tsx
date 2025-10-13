import React from "react";

type Tab = "daily" | "weekly" | "total";

export function LeaderboardTabs({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="leaderboard__tabs">
      {(["daily", "weekly", "total"] as Tab[]).map((t) => (
        <button
          key={t}
          className={`leaderboard__tab ${active === t ? "is-active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
