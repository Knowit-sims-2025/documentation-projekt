import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useUsers } from "./hooks/useUsers";
import { useAuth } from "../auth/AuthContext";
import { Loading } from "../../components/ui/Loading";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import type { User } from "../../types/types";

import { useDailyLeaderboard } from "./hooks/useDailyLeaderboard";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { DailyControls } from "./DailyControls";
import { TotalList } from "./lists/TotalList";
import { DailyList } from "./lists/DailyLists";
import { StatsDisplay } from "../../components/StatsDisplay"; // Ny import
import { toLocalYYYYMMDD, clampToToday } from "../../utils/date";
import WeeklyCurrent from "./WeeklyCurrent";

interface UserLeaderBoardProps {
  showMyTierOnly: boolean;
  activeTab: Tab;
  onSelectUser: (user: User) => void;
  onTabChange: (tab: Tab) => void;
}

type Tab = "daily" | "weekly" | "total" | "stats";

export default function UserLeaderBoard({
  showMyTierOnly,
  activeTab,
  onSelectUser,
  onTabChange,
}: UserLeaderBoardProps) {
  const { data: users, loading, error } = useUsers();
  const { currentUser, isLoading: authLoading } = useAuth();

  // State för att fånga ID från Daily/Weekly listorna
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Daily datum-state
  const today = toLocalYYYYMMDD();
  const [dailyDate, setDailyDate] = useState(today);

  // Hook för daily
  const {
    data: daily,
    loading: dailyLoading,
    error: dailyError,
    updatedAt: dailyUpdatedAt,
    refetch: refetchDaily,
  } = useDailyLeaderboard({ date: dailyDate });

  const myTier = currentUser?.rankTier ?? null;
  const visibleUsers = useMemo(
    () =>
      showMyTierOnly && myTier
        ? users.filter((u) => u.rankTier === myTier)
        : users,
    [users, showMyTierOnly, myTier]
  );

  const handleDateChange = (value: string) =>
    setDailyDate(clampToToday(value, today));

  // Effekt som körs när ett ID väljs från Daily/Weekly.
  // Den letar upp hela användarobjektet och anropar onSelectUser för att visa overlay.
  useEffect(() => {
    if (selectedId !== null) {
      const userToView = users.find((u) => u.id === selectedId);
      if (userToView) onSelectUser(userToView);
      setSelectedId(null); // Nollställ för att kunna välja samma användare igen
    }
  }, [selectedId, users, onSelectUser]);

  // Gatekeeping
  if (loading || authLoading) return <Loading text="Laddar användare..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentUser) return <ErrorMessage message="Ingen användare inloggad." />;

  return (
    <div className="leaderboard">
      <LeaderboardTabs active={activeTab} onChange={onTabChange} />

      {activeTab === "total" && (
        <TotalList users={visibleUsers} onSelect={onSelectUser} />
      )}

      {activeTab === "daily" && (
        <>
          <DailyControls
            date={dailyDate}
            today={today}
            updatedAt={dailyUpdatedAt}
            onDateChange={handleDateChange}
            onResetToToday={() => setDailyDate(today)}
            onRefresh={refetchDaily}
          />
          {dailyLoading ? (
            <Loading text={`Laddar leaderboard för ${dailyDate}...`} />
          ) : dailyError ? (
            <ErrorMessage message={dailyError} />
          ) : (
            <DailyList data={daily} onSelectUserId={setSelectedId} />
          )}
        </>
      )}

      {activeTab === "weekly" && (
        <WeeklyCurrent onSelectUserId={setSelectedId} />
      )}
      {activeTab === "stats" && <StatsDisplay />}
    </div>
  );
}
