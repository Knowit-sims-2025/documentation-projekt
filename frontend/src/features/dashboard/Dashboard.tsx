import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import UserLeaderBoard from "../leaderboard/UserLeaderBoard";
import TeamLeaderboard from "../leaderboard/TeamLeaderboard"; // <-- NY: Importera
import {
  layouts as defaultLayouts,
  breakpoints,
  cols,
} from "../../styles/dashboardLayout";
import Widget from "../../components/Widget";
import Switch from "../../components/ui/switch";
import { useAuth } from "../AuthContext";

const ResponsiveGridLayout = WidthProvider(Responsive);

type Widget = {
  i: string;
  title: React.ReactNode;
  content: React.ReactNode;
  headerControls?: React.ReactNode;
};

// Key för localStorage
const LS_KEY = "user-dashboard-layout";

export default function Dashboard() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [showMyTierOnly, setShowMyTierOnly] = useState(true);

  const myTier = currentUser?.rankTier ?? null;

  const individualTitle = (
    <>
      Individual{" "}
      <span style={{ color: "var(--text-muted)" }}>
        ({showMyTierOnly ? myTier ?? "—" : "All"})
      </span>
    </>
  );

  const individualControls = (
    <div
      title="Filter all users by tier"
      className="leaderboard__filter_button"
    >
      <span className="muted" style={{ minWidth: 60, textAlign: "right" }}>
        {showMyTierOnly ? "Show All" : "Show my tier"}
      </span>
      <Switch
        checked={showMyTierOnly}
        onChange={(next) => setShowMyTierOnly(next)}
        ariaLabel="Filtrera till min tier"
        disabled={authLoading}
      />
    </div>
  );

  // Dina widgets — motsvarar dina tidigare divar
  const widgets: Widget[] = [
    { i: "profile", title: "Profile", content: <div>Profile</div> },
    {
      i: "individual",
      title: individualTitle,
      content: <UserLeaderBoard showMyTierOnly={showMyTierOnly} />,
      headerControls: individualControls,
    },
    { i: "teams", title: "Teams", content: <TeamLeaderboard /> },
    { i: "competition", title: "Competition", content: <div>Competition</div> },
    {
      i: "achievements",
      title: "Achievements",
      content: <div>Achievements</div>,
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

  return (
    <main className="app__main">
      <section className="dashboard">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={30}
          margin={[8, 8]}
          compactType="vertical"
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget__header"
          useCSSTransforms={false}
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
      </section>
    </main>
  );
}
