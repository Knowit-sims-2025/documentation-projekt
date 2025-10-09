import React, { useEffect, useState, useCallback } from "react";
import type { TeamWithDetails } from "../../types/team";
import { Loading } from "../../components/Loading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Overlay } from "../../components/Overlay";
import TeamDetails from "./TeamDetails";
import { getTeams } from "../../services/teams";

export default function TeamLeaderboard() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(
    null
  );

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTeams(ac.signal);
        setTeams(data);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Ett okänt fel uppstod");
        }
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const openTeam = useCallback((team: TeamWithDetails) => {
    setSelectedTeam(team);
  }, []);
  const onKeyRow: React.KeyboardEventHandler<HTMLLIElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const id = (e.currentTarget as HTMLLIElement).dataset.id;
      const t = teams.find((x) => String(x.id) === id);
      if (t) setSelectedTeam(t);
    }
  };

  if (isLoading) return <Loading text="Laddar team..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <ul className="leaderboard__list" role="list">
        {teams.length === 0 ? (
          <li className="leaderboard__item" aria-disabled="true">
            Inga team hittades.
          </li>
        ) : (
          teams.map((team) => (
            <li
              key={team.id}
              data-id={team.id}
              className="leaderboard__item muted"
              role="button"
              tabIndex={0}
              aria-selected={selectedTeam?.id === team.id || undefined}
              title={`Visa teamet ${team.name}`}
              onClick={() => openTeam(team)}
              onKeyDown={onKeyRow}
            >
              <span className="leaderboard__name">{team.name}</span>
              <span className="leaderboard__points muted">
                {team.totalPoints} p
              </span>
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
    </>
  );
}
