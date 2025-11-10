import React from "react";
import type { RankedTeam } from "../../../types/team";
import type { User } from "../../../types/user";
import { Overlay } from "./Overlay";
import { TeamDetails } from "./TeamDetails";
import { useState } from "react";

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
      title={`${team.name} has ${team.members.length} members`}
    >
      <span className="leaderboard__rank">{team.rank}.</span>
      <span className="leaderboard__name">{team.name}</span>
      <span className="leaderboard__points">{team.totalPoints} p</span>
    </li>
  );
}

interface TeamListTabProps {
  teams: RankedTeam[];
  onSelectUser: (user: User) => void;
}

export function TeamListTab({ teams, onSelectUser }: TeamListTabProps) {
  const [selectedTeam, setSelectedTeam] = useState<RankedTeam | null>(null);

  return (
    <>
      <ul className="leaderboard__list">
        {(teams || []).map((team) => (
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
          <p>These are the team's members, sorted by points:</p>
          <TeamDetails team={selectedTeam} onSelectUser={onSelectUser} />
        </Overlay>
      )}
    </>
  );
}
