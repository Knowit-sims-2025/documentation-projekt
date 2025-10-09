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
        // Sortera medlemmar efter poäng
        data.sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
        setMembers(data);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Ett okänt fel uppstod");
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
    <ul className="leaderboard__list">
      {members.map((member) => (
        <li key={member.id} className="leaderboard__item">
          <Avatar name={member.displayName} src={member.avatarUrl} />
          <span className="leaderboard__name">{member.displayName}</span>
          <span className="leaderboard__points">
            {member.totalPoints ?? 0} p
          </span>
        </li>
      ))}
    </ul>
  );
}
