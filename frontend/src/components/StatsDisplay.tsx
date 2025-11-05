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

        setLeaders(newLeaders);
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
          {leader.leaderScore} st
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
