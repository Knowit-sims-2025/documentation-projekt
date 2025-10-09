import React, { useState, useCallback } from "react";
import type { Team } from "../../types/team";
import { Loading } from "../../components/Loading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Overlay } from "../../components/Overlay";
import TeamDetails from "./TeamDetails";
import { useTeams } from "../../hooks/useTeams";

export default function TeamLeaderboard() {
  const { data: teams, isLoading, error } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const openTeam = useCallback((team: Team) => setSelectedTeam(team), []);

  if (isLoading) return <Loading text="Laddar team..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="leaderboard">
      <ul className="leaderboard__list">
        {teams.length === 0 ? (
          <li className="leaderboard__item" aria-disabled="true">
            Det finns inga team att visa.
          </li>
        ) : (
          teams.map((team) => (
            <li
              key={team.id}
              className="leaderboard__item"
              role="button"
              tabIndex={0}
              title={`Visa teamet ${team.name}`}
              onClick={() => openTeam(team)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && openTeam(team)
              }
            >
              <span className="leaderboard__name">{team.name}</span>
            </li>
          ))
        )}
      </ul>

      {selectedTeam && (
        <Overlay
          onClose={() => setSelectedTeam(null)}
          title={`Team: ${selectedTeam.name}`}
        >
          <TeamDetails teamId={selectedTeam.id} />
        </Overlay>
      )}
    </div>
  );
}
