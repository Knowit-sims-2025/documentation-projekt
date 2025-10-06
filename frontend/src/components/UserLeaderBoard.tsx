import React, { useMemo, useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../features/AuthContext";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";
import { IndividualRank } from "../features/leaderboard/IndividualRank";
import Switch from "../components/ui/switch"; // ⬅️ lägg till

export default function UserLeaderBoard() {
  const { data: users, loading, error } = useUsers();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [showMyTierOnly, setShowMyTierOnly] = useState(true);

  const myTier = currentUser?.rankTier ?? null;

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.totalPoints - a.totalPoints),
    [users]
  );

  const visibleUsers = useMemo(
    () =>
      showMyTierOnly && myTier
        ? sortedUsers.filter((u) => u.rankTier === myTier)
        : sortedUsers,
    [sortedUsers, showMyTierOnly, myTier]
  );

  const totalCount = users.length;
  const tierCount = myTier
    ? users.filter((u) => u.rankTier === myTier).length
    : 0;

  // Tillgänglighetsvänlig label för switchen
  const switchAria = `Filtrera till min tier: ${showMyTierOnly ? "på" : "av"}`;
  const switchHint = showMyTierOnly
    ? `Visa alla (${totalCount})`
    : `Visa bara ${myTier ?? "min tier"} (${tierCount})`;

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
          gap: "12px",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Individual ranking{" "}
          <span style={{ color: "var(--muted)" }}>
            ({showMyTierOnly ? myTier ?? "—" : "All"})
          </span>
        </h2>

        {/* Filter med etikett + switch */}
        <div
          title="Filter all users by tier"
          className="leaderboard-filter"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.85rem",
          }}
        >
          {/* Visar text beroende på state */}
          <span className="muted" style={{ minWidth: 60, textAlign: "right" }}>
            {showMyTierOnly ? "Show All" : "Show my tier"}
          </span>

          <Switch
            checked={showMyTierOnly}
            onChange={(next) => setShowMyTierOnly(next)}
            ariaLabel="Filtrera till min tier"
            disabled={loading || authLoading}
          />
        </div>
      </div>

      {/* Innehåll */}
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
