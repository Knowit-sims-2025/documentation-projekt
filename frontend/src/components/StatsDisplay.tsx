import React, { useEffect, useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../features/auth/AuthContext";
import { getUserStats } from "../services/userStats";
import type { UserStats } from "../types/userStats";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";

interface StatLeader {
  statName: string;
  leaderName: string;
  leaderScore: number;
  currentUserScore: number;
}

export function StatsDisplay() {
  const { data: users, loading: loadingUsers, error: errorUsers } = useUsers();
  const { currentUser } = useAuth();
  const [leaders, setLeaders] = useState<StatLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!users.length || !currentUser) return;

    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const allStats: UserStats[] = await Promise.all(
          users.map((user) => getUserStats(user.id))
        );

        if (allStats.length > 0) {
          const statsToTrack: { key: keyof UserStats; name: string }[] = [
            { key: "totalCreatedPages", name: "Most Total Documents Created" },
            { key: "totalComments", name: "Most Total Comments Made" },
            { key: "totalEditsMade", name: "Most Total Edits Done" },
            {
              key: "totalResolvedComments",
              name: "Most Total Comments Resolved",
            },
          ];

          const newLeaders = statsToTrack.map((stat) => {
            const leaderStats = allStats.reduce((max, current) =>
              (current[stat.key] as number) > (max[stat.key] as number)
                ? current
                : max
            );
            const leaderUser = users.find(
              (user) => user.id === leaderStats.userId
            );
            const currentUserStats = allStats.find(
              (s) => s.userId === currentUser!.id
            );

            return {
              statName: stat.name,
              leaderName: leaderUser ? leaderUser.displayName : "Unknown",
              leaderScore: leaderStats[stat.key] as number,
              currentUserScore: currentUserStats
                ? (currentUserStats[stat.key] as number)
                : 0,
            };
          });
          setLeaders(newLeaders);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [users, currentUser]);

  if (loadingUsers || loading) {
    return <Loading text="Loading stats..." />;
  }

  if (errorUsers) {
    return <ErrorMessage message={errorUsers} />;
  }

  return (
    <div className="stats-tab-content">
      <h2>Statistics and Insights</h2>
      {leaders.map((leader) => (
        <div key={leader.statName} style={{ marginBottom: "1rem" }}>
          <strong>{leader.statName}:</strong> {leader.leaderName},{" "}
          {leader.leaderScore}
          <br />
          <em>
            {leader.currentUserScore >= leader.leaderScore
              ? "You are in 1st place!"
              : `You have: ${leader.currentUserScore}, only ${
                  leader.leaderScore - leader.currentUserScore
                } to go to claim 1st place!`}
          </em>
        </div>
      ))}
    </div>
  );
}
