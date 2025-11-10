import { useState } from "react";
import { useTeams } from "../../../hooks/useTeams";
import { Loading } from "../../../components/Loading";
import { ErrorMessage } from "../../../components/ErrorMessage";
import type { User } from "../../../types/user";
import type { RankedTeam } from "../../../types/team";

// Import sub-components
import { TeamListTab } from "./TeamListTab";
import { JoinTeamTab } from "./JoinTeamTab";
import { CreateTeamTab } from "./CreateTeamTab";

// --- Main Component ---

interface TeamLeaderboardProps {
  onSelectUser: (user: User) => void;
}

type TeamTab = "teams" | "join" | "create";

const TABS: { id: TeamTab; label: string }[] = [
  { id: "teams", label: "Teams" },
  { id: "join", label: "Join a team" },
  { id: "create", label: "Create a team" },
];

export default function TeamLeaderboard({
  onSelectUser,
}: TeamLeaderboardProps) {
  const { data: teams, loading, error } = useTeams();
  const [activeTab, setActiveTab] = useState<TeamTab>("teams");

  if (loading) {
    return <Loading text="Loading teams..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="leaderboard">
      {/* Tabs */}
      <div className="leaderboard__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`leaderboard__tab ${
              activeTab === tab.id ? "is-active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === "teams" && (
        <TeamListTab teams={teams} onSelectUser={onSelectUser} />
      )}
      {activeTab === "join" && <JoinTeamTab />}
      {activeTab === "create" && (
        <CreateTeamTab onTeamCreated={() => setActiveTab("teams")} />
      )}
    </div>
  );
}
