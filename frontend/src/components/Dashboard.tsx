import React from "react";
import UserLeaderBoard from "./UserLeaderBoard";
import UserLeaderBoard from "../../components/UserLeaderBoard";
import { initialLayout } from "./dashboardLayout"; // Importera layouten
import { MovableGrid } from "../../components/MovableGrid"; // Importera din nya komponent

export default function Dashboard() {
// En enkel platshållare för korten som inte har innehåll än.
const PlaceholderCard: React.FC<{ title: string }> = ({ title }) => (
  // style-attributen behövs inte längre, .card-klassen och grid-layout sköter detta.
  <h3>{title}</h3>
);

export function Dashboard() {
  return (
    <main className="app__main">
      <section className="dashboard">
        {/* Kolumn 1, två rader hög */}
        <div className="profile card">Profile</div>
      {/*
        Notera: Du behöver installera biblioteket:
        npm install react-grid-layout @types/react-grid-layout
      */}
      <MovableGrid layout={initialLayout}>
        {/*
          Varje div måste ha en `key` som matchar ett `i` i din layout-array.
          Jag har lagt till klassen "card" för att de ska få din kort-styling.
        */}
        <div key="profile" className="card">
          <PlaceholderCard title="Profile" />
        </div>

        {/* Kolumn 2–3, rad 1 */}
        <div className="individual card">
        <div key="individual" className="card">
          <UserLeaderBoard />
        </div>

        {/* Kolumn 2, rad 2 */}
        <div className="teams card">Teams</div>
        <div key="teams" className="card">
          <PlaceholderCard title="Teams" />
        </div>

        {/* Kolumn 3, rad 2 */}
        <div className="competition card">Competition</div>
        <div key="competition" className="card">
          <PlaceholderCard title="Competition" />
        </div>

        {/* Kolumn 4, två rader hög */}
        <div className="achievements card">Achievements</div>
      </section>
        <div key="achievements" className="card">
          <PlaceholderCard title="Achievements" />
        </div>
      </MovableGrid>
    </main>
  );
}
