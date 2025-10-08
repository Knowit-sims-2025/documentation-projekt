import React, { useMemo, useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import UserLeaderBoard from "../leaderboard/UserLeaderBoard";
import {
  layouts as defaultLayouts,
  breakpoints,
  cols,
} from "../../styles/dashboardLayout";
import { useAuth } from "../AuthContext";

const ResponsiveGridLayout = WidthProvider(Responsive);

type Widget = {
  i: string;
  title: string;
  content: React.ReactNode;
};

// Key för localStorage (om du vill spara layout)
const LS_KEY = "user-dashboard-layout";

export default function Dashboard() {
  const { isLoading } = useAuth();
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

  // Dina widgets — motsvarar dina tidigare divar
  const widgets: Widget[] = [
    { i: "profile", title: "Profile", content: <div>Profile</div> },
    { i: "individual", title: "Individual", content: <UserLeaderBoard /> },
    { i: "teams", title: "Teams", content: <div>Teams</div> },
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

  if (isLoading) {
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
        >
          {widgets.map((w) => (
            <div key={w.i} className="card widget">
              <div className="widget__header">
                <h3 className="widget__title">{w.title}</h3>
                <button
                  className="widget__remove"
                  onClick={() =>
                    console.warn(
                      "Remove-function needs to be updated for responsive layouts"
                    )
                  }
                  title="Ta bort"
                >
                  ✕
                </button>
              </div>
              <div className="widget__body">{w.content}</div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </section>
    </main>
  );
}
