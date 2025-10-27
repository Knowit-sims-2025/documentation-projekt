import { useState } from "react";
import { useTeams } from "./hooks/useTeams";
import { Loading } from "../../components/ui/Loading";
import { ErrorMessage } from "../../components/ui/ErrorMessage";
import type { User, RankedTeam } from "../../types/types";
import { Overlay } from "../../components/ui/Overlay";
import { TeamDetails } from "./TeamDetails";

function TeamRank({
  team,
  onSelect,
}: {
  team: RankedTeam;
  onSelect: () => void;
}) {
  return (
    <li
      className="leaderboard__item"
      onClick={onSelect}
      style={{ cursor: "pointer" }}
      title={`${team.name} har ${team.members.length} medlemmar`}
    >
      <span className="leaderboard__rank">{team.rank}.</span>
      <span className="leaderboard__name">{team.name}</span>
      <span className="leaderboard__points">{team.totalPoints} p</span>
    </li>
  );
}

interface TeamLeaderboardProps {
  onSelectUser: (user: User) => void;
}

export default function TeamLeaderboard({
  onSelectUser,
}: TeamLeaderboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<RankedTeam | null>(null);
  const { data: teams, loading, error, refetch } = useTeams();

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
          {" "}
          <p>Detta är teamets medlemmar, sorterade efter poäng:</p>
          <TeamDetails team={selectedTeam} onSelectUser={onSelectUser} />
        </Overlay>
      )}
    </div>
  );
}
