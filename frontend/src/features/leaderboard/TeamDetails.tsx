import React, { useEffect, useState } from "react";
import type { User } from "../../types/user";
import { Loading } from "../../components/Loading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Avatar } from "../../components/Avatar";

interface TeamDetailsProps {
  teamId: number;
}

async function getTeamMembers(
  teamId: number,
  signal?: AbortSignal
): Promise<User[]> {
  const res = await fetch(`/api/v1/user-teams/team/${teamId}/users`, {
    signal,
  });
  if (!res.ok)
    throw new Error(
      `Kunde inte hämta teammedlemmar: ${res.status} ${res.statusText}`
    );
  return res.json();
}

export default function TeamDetails({ teamId }: TeamDetailsProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTeamMembers(teamId, ac.signal);
        // valfritt: sortera på poäng desc, annars alfabetiskt
        data.sort(
          (a, b) =>
            (b.totalPoints ?? 0) - (a.totalPoints ?? 0) ||
            a.displayName.localeCompare(b.displayName)
        );
        setMembers(data);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Okänt fel");
        }
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ac.abort();
  }, [teamId]);

  if (isLoading) return <Loading text="Laddar medlemmar..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Medlemmar</h4>
      <ul className="leaderboard__list" role="list">
        {members.length > 0 ? (
          members.map((m) => (
            <li className="leaderboard__item" key={m.id}>
              <Avatar
                name={m.displayName}
                src={m.avatarUrl}
                className="leaderboard__avatar"
              />

              <span className="leaderboard__name muted">{m.displayName}</span>

              <span className="leaderboard__points">
                {m.totalPoints ?? 0} p
              </span>
            </li>
          ))
        ) : (
          <li className="leaderboard__item" aria-disabled="true">
            Inga medlemmar i detta team.
          </li>
        )}
      </ul>
    </div>
  );
}
