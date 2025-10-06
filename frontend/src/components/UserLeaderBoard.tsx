import React, { useMemo, useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../features/AuthContext";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";
import { IndividualRank } from "../features/leaderboard/IndividualRank";

export default function UserLeaderBoard() {
  // 1) Hooks: MÅSTE alltid kallas i samma ordning, varje render
  const { data: users, loading, error } = useUsers();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [showMyTierOnly, setShowMyTierOnly] = useState(true);

  // 2) Härled värden för filtrering (säkert även om currentUser saknas)
  const myTier = currentUser?.rankTier ?? null;

  // 3) Sortera alltid (hook kallas alltid)
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.totalPoints - a.totalPoints),
    [users]
  );

  // 4) Filtrera alltid (hook kallas alltid). Om myTier saknas, visa sortedUsers.
  const visibleUsers = useMemo(
    () =>
      showMyTierOnly && myTier
        ? sortedUsers.filter((u) => u.rankTier === myTier)
        : sortedUsers,
    [sortedUsers, showMyTierOnly, myTier]
  );

  // 5) Små UI-hjälpare (ej hooks)
  const totalCount = users.length;
  const tierCount = myTier
    ? users.filter((u) => u.rankTier === myTier).length
    : 0;

  // 6) Ingen tidig return före hooks. Gör villkorlig rendering i JSX.
  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div
        className="leaderboard-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Individual ranking{" "}
          <span style={{ color: "var(--muted)" }}>
            ({showMyTierOnly ? myTier ?? "—" : "Alla"})
          </span>
        </h2>

        <button
          className="btn"
          onClick={() => setShowMyTierOnly((v) => !v)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          disabled={loading || authLoading}
        >
          {showMyTierOnly
            ? `Visa alla (${totalCount})`
            : `Visa bara ${myTier ?? "min tier"} (${tierCount})`}
        </button>
      </div>

      {/* Innehåll: villkorligt i JSX i stället för tidig return */}
      {loading || authLoading ? (
        <Loading text="Laddar användare..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !currentUser ? (
        <ErrorMessage message="Ingen användare inloggad." />
      ) : (
        <ul className="leaderboard-list">
          {visibleUsers.map((user) => (
            <IndividualRank key={user.id} user={user} />
          ))}
        </ul>
      )}
    </div>
  );
}
