import { useState } from "react";
import { useTeams } from "../../../hooks/useTeams";
import { Loading } from "../../../components/Loading";
import { ErrorMessage } from "../../../components/ErrorMessage";
import type { User } from "../../../types/user";
import type { RankedTeam } from "../../../types/team";
import { Overlay } from "./Overlay";
import { TeamDetails } from "./TeamDetails";
import { ProfileCard } from "../../profile/ProfileCard";
import UserAchievements from "../../../components/Achivements";

function TeamRank({
  team,
  onSelect,
}: {
  team: RankedTeam;
  onSelect: () => void;
}) {
  // Enkel rad-komponent för ett team
  return (
    <li
      className="leaderboard__item"
      onClick={onSelect}
      style={{ cursor: "pointer" }}
      title={`${team.name} har ${team.members.length} medlemmar`}
    >
      <span className="leaderboard__rank">{team.rank}.</span>
      {/* Här kan vi lägga till en team-avatar i framtiden */}
      <span className="leaderboard__name">{team.name}</span>
      <span className="leaderboard__points">{team.totalPoints} p</span>
    </li>
  );
}

export default function TeamLeaderboard() {
  const [selectedTeam, setSelectedTeam] = useState<RankedTeam | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: teams, loading, error } = useTeams();

  if (loading) {
    return <Loading text="Laddar team..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="leaderboard">
      <ul className="leaderboard__list">
        {teams.map((team) => (
          <TeamRank
            key={team.id}
            team={team}
            onSelect={() => setSelectedTeam(team)}
          />
        ))}
      </ul>

      {selectedTeam && (
        <Overlay
          onClose={() => setSelectedTeam(null)}
          title={`Team: ${selectedTeam.name}`}
        >
          <TeamDetails team={selectedTeam} onSelectUser={setSelectedUser} />
        </Overlay>
      )}

      {/* Overlay för en enskild användare, visas när man klickar i TeamDetails */}
      {selectedUser && (
        <Overlay
          onClose={() => setSelectedUser(null)}
          title={selectedUser.displayName}
        >
          <ProfileCard user={selectedUser} />
          <UserAchievements user={selectedUser} />
        </Overlay>
      )}
    </div>
  );
}
