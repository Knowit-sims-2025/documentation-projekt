import React, { useState, useEffect, useCallback } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import UserLeaderBoard from "./leaderboard/UserLeaderBoard";
import TeamLeaderboard from "./leaderboard/TeamLeaderboard"; // <-- NY: Importera
import UserAchievements from "../../components/Achivements";
import {
  layouts as defaultLayouts,
  breakpoints,
  cols,
} from "../../styles/dashboardLayout";
import Widget from "../../components/Widget";
import Switch from "../../components/switch";
import { useAuth } from "../../features/auth/AuthContext";
import type { User } from "../../types/user";
import { Overlay } from "./leaderboard/Overlay";
import { ProfileCard } from "../profile/ProfileCard";
import Profile from "../../components/Profile";
import { useAutoRowHeight } from "../../hooks/useAutoRowHeight";

const ResponsiveGridLayout = WidthProvider(Responsive);

type Widget = {
  i: string;
  title: React.ReactNode;
  content: React.ReactNode;
  headerControls?: React.ReactNode;
};

type Tab = "daily" | "weekly" | "total";

// Key för localStorage
const LS_KEY = "user-dashboard-layout";

export default function Dashboard() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [showMyTierOnly, setShowMyTierOnly] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("total");

  const myTier = currentUser?.rankTier ?? null;

  const individualTitle = (
    <>
      Individual Ranking{" "}
      <span style={{ color: "var(--text-muted)" }}>
        ({showMyTierOnly ? myTier ?? "—" : "All"})
      </span>
    </>
  );

  const individualControls = (
    <div
      title="Filter all users by tier"
      className="leaderboard__filter_button"
      style={{ fontSize: "0.8rem" }}
    >
      <span className={!showMyTierOnly ? "muted" : ""}>All</span>
      <Switch
        checked={showMyTierOnly}
        onChange={(next) => setShowMyTierOnly(next)}
        ariaLabel="Växla mellan att visa alla användare och bara de i din tier"
        disabled={authLoading}
      />
      <span className={showMyTierOnly ? "muted" : ""}>My Tier</span>
    </div>
  );

  const widgets: Widget[] = [
    { i: "profile", title: "Profile", content: <Profile /> },
    {
      i: "individual",
      title: individualTitle,
      content: (
        <UserLeaderBoard
          showMyTierOnly={showMyTierOnly}
          onSelectUser={setSelectedUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ),
      headerControls: activeTab === "total" ? individualControls : null,
    },
    {
      i: "teams",
      title: "Team Leaderboard",
      content: <TeamLeaderboard onSelectUser={setSelectedUser} />,
    },
    { i: "competition", title: "Statistik", content: <div>Stats</div> },
    {
      i: "achievements",
      title: "Achievements",
      content: currentUser ? <UserAchievements user={currentUser} /> : null,
    },
  ];

  // Ladda layout från localStorage om den finns
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      setLayouts(JSON.parse(stored));
    }
  }, []);

  // Spara layout när användaren flyttar/ändrar storlek
  function handleLayoutChange(currentLayout: Layout[], allLayouts: Layouts) {
    setLayouts(allLayouts);
    localStorage.setItem(LS_KEY, JSON.stringify(allLayouts));
  }

  // Funktion för att ta bort en widget från alla layouts
  function handleRemoveWidget(widgetId: string) {
    const newLayouts: Layouts = {};
    // Gå igenom varje breakpoint (lg, md, sm...)
    for (const breakpoint in layouts) {
      // Filtrera bort den widget som ska tas bort
      newLayouts[breakpoint] = layouts[breakpoint].filter(
        (item) => item.i !== widgetId
      );
    }
    handleLayoutChange([], newLayouts); // Spara den nya layouten
  }

  if (authLoading) {
    return <main className="app__main">Loading user...</main>;
  }

  // TODO: Flytta ut denna knapp till en mer passande plats, t.ex. en inställningsmeny

  return (
    <main className="app__main">
      <section className="dashboard">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={40}
          margin={[8, 8]}
          compactType="vertical"
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget__header"
          useCSSTransforms={false}
          // preventCollision={true}
          // isBounded={true}
        >
          {widgets.map((w) => (
            <div key={w.i}>
              <Widget
                title={w.title}
                onHide={() => handleRemoveWidget(w.i)}
                headerControls={w.headerControls}
              >
                {w.content}
              </Widget>
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Overlay för användarprofil, hanteras nu centralt */}
        {selectedUser && (
          <Overlay
            onClose={() => setSelectedUser(null)}
            title={selectedUser.displayName}
          >
            {/* Använd flexbox för att placera korten sida vid sida */}
            <div>
              {/* Profilkortet får en fast bredd */}
              <div>
                <ProfileCard user={selectedUser} />
              </div>
              {/* Achievements fyller resten av ytan */}
              <div>
                <UserAchievements user={selectedUser} />
              </div>
            </div>
          </Overlay>
        )}
      </section>
    </main>
  );
}
