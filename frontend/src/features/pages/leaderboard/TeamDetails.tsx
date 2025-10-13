import type { Team } from "../../../types/team";
import { Avatar } from "../../../components/Avatar";

interface TeamDetailsProps {
  team: Team;
}

/**
 * Visar en detaljerad vy av ett team, inklusive en lista över dess medlemmar.
 */
export function TeamDetails({ team }: TeamDetailsProps) {
  // Sortera medlemmar efter poäng, högst först
  const sortedMembers = [...team.members].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  return (
    <div className="team-details">
      <ul className="team-details__member-list">
        {sortedMembers.map((member) => (
          <li key={member.id} className="team-details__member">
            <Avatar src={member.avatarUrl} alt={member.displayName} size="sm" />
            <span className="team-details__member-name">
              {member.displayName}
            </span>
            <span className="team-details__member-points">
              {member.totalPoints} p
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
