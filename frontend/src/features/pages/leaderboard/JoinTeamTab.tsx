import React, { useState } from "react";
import { useTeams } from "../../../hooks/useTeams";
import { Loading } from "../../../components/Loading";
import { ErrorMessage } from "../../../components/ErrorMessage";
import type { RankedTeam } from "../../../types/team";
import { joinTeam, leaveTeam } from "../../../services/teams";
import { useAuth } from "../../../features/auth/AuthContext";
import Switch from "../../../components/switch";
import "../../../styles/teamLeaderboard.css"; // Import the new CSS file

interface JoinTeamTabProps {}

export function JoinTeamTab({}: JoinTeamTabProps) {
  const { data: teams, loading, error, refetch } = useTeams();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) return <Loading text="Loading teams..." />;
  if (error) return <ErrorMessage message={error} />;

  const handleToggleJoin = async (
    teamId: number,
    isCurrentlyJoined: boolean
  ) => {
    if (!currentUser) {
      setSubmitError("You must be logged in to join/leave a team.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (isCurrentlyJoined) {
        await leaveTeam(teamId, currentUser.id);
      } else {
        await joinTeam(teamId, currentUser.id);
      }
      refetch();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="join-team-container">
      {submitError && <ErrorMessage message={submitError} />}

      {/* Header Row */}
      <div className="join-team-header">
        <span className="join-team-header-name">Team name</span>
        <span className="join-team-header-members">Total members</span>
        <span className="join-team-header-toggle">Leave/Join</span>
      </div>

      <ul className="leaderboard__list">
        {(teams || []).map((team) => {
          const isCurrentUserMember = team.members.some(
            (member) => member.id === currentUser?.id
          );
          return (
            <li
              key={team.id}
              className={`leaderboard__item join-team-item ${
                isCurrentUserMember ? "is-member" : ""
              }`}
            >
              <span className="join-team-item-name">{team.name}</span>{" "}
              {/* Left */}
              <div className="join-team-item-members">
                {" "}
                {/* Middle */}
                <span>{team.members.length} members</span>
              </div>
              <div className="join-team-item-toggle">
                {" "}
                {/* Right */}
                <Switch
                  checked={isCurrentUserMember}
                  onChange={() =>
                    handleToggleJoin(team.id, isCurrentUserMember)
                  }
                  ariaLabel={`Toggle membership for ${team.name}`}
                  disabled={isSubmitting}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
