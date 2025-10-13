import React, { useMemo, useState, useCallback } from "react";
import { useUsers } from "../../../hooks/useUsers";
import { useAuth } from "../../AuthContext";
import { Loading } from "../../../components/Loading";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { IndividualRank } from "./IndividualRank";
import { Overlay } from "./Overlay";
import type { User } from "../../../types/user";

interface UserLeaderBoardProps {
  showMyTierOnly: boolean;
}

export default function UserLeaderBoard({
  showMyTierOnly,
}: UserLeaderBoardProps) {
  const { data: users, loading, error } = useUsers();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "total">(
    "total"
  );

  const myTier = currentUser?.rankTier ?? null;

  const visibleUsers = useMemo(
    () =>
      showMyTierOnly && myTier
        ? users.filter((u) => u.rankTier === myTier)
        : users,
    [users, showMyTierOnly, myTier]
  );

  // Använd useCallback för att undvika onödiga re-renders av list-items
  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  return (
    <div className="leaderboard">
      {loading || authLoading ? (
        <Loading text="Laddar användare..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !currentUser ? (
        <ErrorMessage message="Ingen användare inloggad." />
      ) : (
        <>
          <div className="leaderboard__tabs">
            <button
              className={`leaderboard__tab ${
                activeTab === "daily" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("daily")}
            >
              Daily
            </button>
            <button
              className={`leaderboard__tab ${
                activeTab === "weekly" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly
            </button>
            <button
              className={`leaderboard__tab ${
                activeTab === "total" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("total")}
            >
              Total
            </button>
          </div>

          {activeTab === "total" && (
            <ul className="leaderboard__list">
              {visibleUsers.map((user) => (
                <IndividualRank
                  key={user.id}
                  user={user}
                  onSelect={handleUserSelect}
                />
              ))}
            </ul>
          )}
          {(activeTab === "daily" || activeTab === "weekly") && (
            <div className="leaderboard__placeholder">
              <p>Data för {activeTab} topplista är ännu inte tillgänglig.</p>
            </div>
          )}

          {/* Visa overlay om en användare är vald */}
          {selectedUser && (
            <Overlay
              onClose={() => setSelectedUser(null)}
              title={selectedUser.displayName}
            >
              <p>
                Här kan mer information om användaren visas i framtiden.
                <br />
                <br />
                Mer och mer information.
                <br />
                Ännu mera text.
              </p>
              <p>Poäng: {selectedUser.totalPoints}</p>
            </Overlay>
          )}
        </>
      )}
    </div>
  );
}
