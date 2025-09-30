import React, { useState, useEffect } from "react";

// Definierar typen för en användare baserat på din API.md och Go-modellen
interface User {
  id: number;
  displayName: string;
  avatarUrl?: string; // Valfri
  totalPoints: number;
  rank: number; // Vi lägger till rank i frontend
  isAdmin: boolean;
}

export default function SimpleUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Anropar endpointen för att hämta alla användare
        const response = await fetch("/api/v1/users");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Lägg till rankning till varje användare. Listan är redan sorterad från backend.
        const rankedUsers = data.map((user: any, index: number) => ({
          ...user,
          rank: index + 1,
        }));
        setUsers(rankedUsers);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ett okänt fel inträffade vid hämtning av användare.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []); // Tom array betyder att effekten bara körs en gång när komponenten monteras

  if (loading) {
    return <p className="muted">Laddar användare...</p>;
  }

  if (error) {
    return <p style={{ color: "var(--err)" }}>Fel: {error}</p>;
  }

  return (
    <div className="leaderboard-container">
      <h2>Användare</h2>
      <ul className="leaderboard-list">
        {users.map((user) => (
          <li
            key={user.id}
            className="leaderboard-item"
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log(`Klickade på användare med ID: ${user.displayName}`); // Placeholder för framtida funktionalitet
            }}
          >
            <span className="leaderboard-rank">{user.rank}.</span>
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="leaderboard-avatar"
              />
            )}
            <span className="leaderboard-name">{user.displayName}</span>
            <span className="leaderboard-points">{user.totalPoints} p</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
