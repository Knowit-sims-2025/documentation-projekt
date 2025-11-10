import React, { useState } from "react";
import { useTeams } from "../../../hooks/useTeams";
import { Loading } from "../../../components/Loading";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { createTeam } from "../../../services/teams";
import "../../../styles/teamLeaderboard.css"; // Import the new CSS file

function CreateTeamForm({
  onCreate,
  onCancel,
  isSubmitting,
}: {
  onCreate: (name: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="create-team-container">
      <form onSubmit={handleSubmit} className="create-team-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team name"
          required
          disabled={isSubmitting}
          className="create-team-input"
        />
        <div className="create-team-buttons">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="create-team-button-cancel">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="create-team-button-submit">
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface CreateTeamTabProps {
  onTeamCreated: () => void;
}

export function CreateTeamTab({ onTeamCreated }: CreateTeamTabProps) {
  const { refetch } = useTeams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCreate = async (teamName: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createTeam(teamName);
      refetch(); // Refetch teams
      onTeamCreated(); // Notify parent to switch tab
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-team-container">
      {submitError && <ErrorMessage message={submitError} />}
      <CreateTeamForm
        onCreate={handleCreate}
        onCancel={onTeamCreated} // Go back to teams list
        isSubmitting={isSubmitting}
      />
    </div>
  );
}