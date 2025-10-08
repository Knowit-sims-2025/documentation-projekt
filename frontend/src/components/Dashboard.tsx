import React from "react";
import UserLeaderBoard from "./UserLeaderBoard";
import Profile from "./Profile";

export default function Dashboard() {
  return (
    <main className="app__main">
      <section className="dashboard">
        {/* Kolumn 1, två rader hög */}
        <div className="profile card">
          <Profile/>
        </div>

        {/* Kolumn 2–3, rad 1 */}
        <div className="individual card">
          <UserLeaderBoard />
        </div>

        {/* Kolumn 2, rad 2 */}
        <div className="teams card">Teams</div>

        {/* Kolumn 3, rad 2 */}
        <div className="competition card">Competition</div>

        {/* Kolumn 4, två rader hög */}
        <div className="achievements card">Achievements</div>
      </section>
    </main>
  );
}
