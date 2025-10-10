import React, { useMemo, useState, useEffect } from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
import UserLeaderBoard from "../../components/UserLeaderBoard";
import { useAuth } from "../AuthContext";
import Profile from "../../components/Profile";
import Achivements from "../../components/Achivements";

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
  const [layout, setLayout] = useState<Layout[]>([]);

  // Dina widgets — motsvarar dina tidigare divar
  const widgets: Widget[] = [
    { i: "profile", title: "Profile", content: <div><Profile/></div> },
    { i: "individual", title: "Individual", content: <UserLeaderBoard /> },
    { i: "teams", title: "Teams", content: <div>Teams</div> },
    { i: "competition", title: "Competition", content: <div>Competition</div> },
    { i: "achievements", title: "Achievements", content: <div><Achivements /></div>},
  ];

  // Standardlayout (ersätter din tidigare CSS grid)
  const defaultLayout: Layout[] = useMemo(
    () => [
      { i: "profile", x: 0, y: 0, w: 3, h: 6 },
      { i: "individual", x: 3, y: 0, w: 5, h: 6 },
      { i: "teams", x: 0, y: 6, w: 4, h: 5 },
      { i: "competition", x: 4, y: 6, w: 4, h: 5 },
      { i: "achievements", x: 8, y: 0, w: 4, h: 11 },
    ],
    []
  );

  // Ladda layout från localStorage om den finns
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    setLayout(stored ? JSON.parse(stored) : defaultLayout);
  }, [defaultLayout]);

  // Spara layout när användaren flyttar/ändrar storlek
  function handleLayoutChange(newLayout: Layout[]) {
    setLayout(newLayout);
    localStorage.setItem(LS_KEY, JSON.stringify(newLayout));
  }

  if (isLoading) {
    return <main className="app__main">Loading user...</main>;
  }

  return (
    <main className="app__main">
      <section className="dashboard">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
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
                    setLayout((prev) => prev.filter((l) => l.i !== w.i))
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
