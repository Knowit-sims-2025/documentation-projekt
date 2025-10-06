import React from "react";
import UserLeaderBoard from "../../components/UserLeaderBoard";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { isLoading } = useAuth();

  // Visa en enkel laddningsindikator medan AuthProvider hämtar den initiala användaren.
  if (isLoading) {
    return <main className="app__main">Loading user...</main>;
  }

  return (
    <main className="app__main">
      <section className="dashboard">
        <div className="profile card">Profile</div>

        <div className="individual card">
          <UserLeaderBoard />
        </div>

        <div className="teams card">Teams</div>

        <div className="competition card">Competition</div>

        <div className="achievements card">Achievements</div>
      </section>
    </main>
  );
}
