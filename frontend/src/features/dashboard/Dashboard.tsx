import React, { useEffect, useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";

import AchievementIconDisplay from "../achievements/AchievementIconDisplay";
import UserLeaderBoard from "../leaderboard/UserLeaderBoard";
import TeamLeaderboard from "../leaderboard/TeamLeaderboard";
import UserAchievements from "../achievements/Achievements";

import {
  layouts as defaultLayouts,
  breakpoints,
  cols,
} from "./dashboardLayout";

import Widget from "../../components/ui/Widget";
import Switch from "../../components/ui/switch";
import { useAuth } from "../auth/AuthContext";
import type { User } from "../../types/types";
import { Overlay } from "../../components/ui/Overlay";
import { ProfileCard } from "../profile/ProfileCard";
import Profile from "../profile/Profile";

import { rowsFromLayout } from "./rowsFromLayout";
import { useRGLRowHeight } from "./useRGLRowHeight";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Lokal storage-nyckel
const LS_DASHBOARD_KEY = "user-dashboard-layout";

// Hjälpare: lås alla widgets (ej draggable/resizable)
function lockLayouts(source: Layouts): Layouts {
  const out: Layouts = {};
  for (const bp in source) {
    out[bp] = source[bp].map((it) => ({
      ...it,
      isDraggable: false,
      isResizable: false,
    }));
  }
  return out;
}

type WidgetMeta = {
  i: string;
  title: React.ReactNode;
  content: React.ReactNode;
  headerControls?: React.ReactNode;
};

type Tab = "daily" | "weekly" | "total" | "stats";

export default function Dashboard() {
  const { currentUser, isLoading: authLoading } = useAuth();

  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [bp, setBp] = useState<keyof typeof breakpoints>("lg"); // följ aktuellt breakpoint
  const [rows, setRows] = useState<number>(rowsFromLayout(defaultLayouts.lg));

  const [showMyTierOnly, setShowMyTierOnly] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("total");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  // RGL parametrar som måste hållas i synk med hooken
  const MARGIN_Y = 8;
  const CONTAINER_PADDING_Y = 0;

  // Dynamisk rowHeight som exakt fyller utrymmet mellan header/footer
  const [rowHeight, kickRow] = useRGLRowHeight(rows, {
    marginY: MARGIN_Y,
    containerPaddingY: CONTAINER_PADDING_Y,
    outerSel: ".app__main",
    innerSel: ".dashboard",
    min: 28,
    max: 140,
  });

  // Debuggning av rowHeight
  // useEffect(() => {
  //   const appMain = document.querySelector(".app__main") as HTMLElement | null;
  //   const appMainHeight = appMain?.getBoundingClientRect().height ?? 0;
  //   const expectedGridHeight = rows * rowHeight + (rows - 1) * MARGIN_Y + 2 * CONTAINER_PADDING_Y;
  //   console.log({ bp, rows, rowHeight, expectedGridHeight, appMainHeight });
  // }, [bp, rows, rowHeight]);

  // Ladda ev. sparad layout (och lås default annars)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_DASHBOARD_KEY);
      if (stored) {
        const parsed: Layouts = JSON.parse(stored);
        setLayouts(parsed);
        // beräkna rows utifrån aktuellt breakpoint direkt
        const current = parsed[bp] ?? parsed.lg ?? defaultLayouts.lg;
        setRows(rowsFromLayout(current));
      } else {
        const locked = lockLayouts(defaultLayouts);
        setLayouts(locked);
        const current = locked[bp] ?? locked.lg ?? defaultLayouts.lg;
        setRows(rowsFromLayout(current));
      }
    } catch (error) {
      console.error("Kunde inte ladda layout, fallback till default.", error);
      const locked = lockLayouts(defaultLayouts);
      setLayouts(locked);
      setRows(rowsFromLayout(locked[bp] ?? locked.lg));
    }
    // Efter första mount, säkerställ korrekt mätning
    requestAnimationFrame(() => kickRow());
  }, [bp, kickRow]);

  // UI-texter
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
      <span className={showMyTierOnly ? "muted" : ""}>All</span>
      <Switch
        checked={showMyTierOnly}
        onChange={(next) => setShowMyTierOnly(next)}
        ariaLabel="Växla mellan att visa alla användare och bara de i din tier"
        disabled={authLoading}
      />
      <span className={!showMyTierOnly ? "muted" : ""}>My Tier</span>
    </div>
  );

  // Widget-listan
  const widgets: WidgetMeta[] = [
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
    // { i: "competition", title: "Statistik", content: <div>Stats</div> },
    {
      i: "achievements",
      title: "Achievements",
      content: currentUser ? (
        <AchievementIconDisplay
          user={currentUser}
          onIconClick={(badgeId) => setSelectedBadgeId(badgeId)}
        />
      ) : null,
    },
  ];

  // Runtime: spara layout + räkna rader från live-layouten
  function handleLayoutChange(currentLayout: Layout[], allLayouts: Layouts) {
    setLayouts(allLayouts);
    localStorage.setItem(LS_DASHBOARD_KEY, JSON.stringify(allLayouts));
    setRows(rowsFromLayout(currentLayout));
    requestAnimationFrame(() => kickRow());
  }

  // Breakpoint-bytare – påverkar vilken layout som används och hur många rader den har
  function handleBreakpointChange(next: string) {
    const key = next as keyof typeof breakpoints;
    setBp(key);
    const lay = layouts[key] ?? layouts.lg ?? defaultLayouts.lg;
    setRows(rowsFromLayout(lay));
    requestAnimationFrame(() => kickRow());
  }

  // Ta bort widget från alla breakpoints
  function handleRemoveWidget(widgetId: string) {
    const newLayouts: Layouts = {};
    for (const breakpoint in layouts) {
      newLayouts[breakpoint] = layouts[breakpoint].filter(
        (item) => item.i !== widgetId
      );
    }
    handleLayoutChange([], newLayouts);
  }

  // Lås/lås upp widget
  function handleToggleLock(widgetId: string) {
    const newLayouts: Layouts = {};
    for (const breakpoint in layouts) {
      newLayouts[breakpoint] = layouts[breakpoint].map((item) => {
        if (item.i === widgetId) {
          const currentlyLocked = item.isDraggable === false;
          return {
            ...item,
            isDraggable: currentlyLocked,
            isResizable: currentlyLocked,
          };
        }
        return item;
      });
    }
    handleLayoutChange([], newLayouts);
  }
  useEffect(() => {
    const onReset = () => {
      // 1) Rensa lagrad layout
      localStorage.removeItem("user-dashboard-layout");

      // 2) Sätt tillbaka låst default-layout
      const locked: Layouts = {};
      for (const bp in defaultLayouts) {
        locked[bp] = defaultLayouts[bp].map((it) => ({
          ...it,
          isDraggable: false,
          isResizable: false,
        }));
      }
      setLayouts(locked);

      // 3) Räkna rader för aktuellt breakpoint (bp) så rowHeight blir rätt direkt
      const current = locked[bp] ?? locked.lg ?? defaultLayouts.lg;
      setRows(rowsFromLayout(current));

      // 4) Kicka ommätning efter att DOM/CSS hunnit landa
      requestAnimationFrame(() => {
        // om du använder min hook som returnerar kickRow:
        // kickRow();
        // annars: trigga resize (fallback)
        window.dispatchEvent(new Event("resize"));
      });
    };

    window.addEventListener("dashboard:reset", onReset);
    return () => window.removeEventListener("dashboard:reset", onReset);
  }, [bp /*, kickRow om du har den */]);

  // 🔁 Mjuk reset (ingen reload) + kick för korrekt mätning efteråt
  // function handleResetLayout() {
  //   localStorage.removeItem(LS_DASHBOARD_KEY);

  //   const locked = lockLayouts(defaultLayouts);
  //   setLayouts(locked);

  //   const current = locked[bp] ?? locked.lg ?? defaultLayouts.lg;
  //   setRows(rowsFromLayout(current));

  //   requestAnimationFrame(() => kickRow());
  //   // Om du har en meny: stäng den här (ex. setIsMenuOpen(false))
  // }

  // Tidig return efter att ALLA hooks är definierade
  if (authLoading) {
    return <main className="app__main">Loading user...</main>;
  }

  return (
    <main className="app__main">
      <section className="dashboard">
        {/* Exempel: lägg en liten reset-knapp i headern på sidan om du vill testa */}
        {/* <button onClick={handleResetLayout}>Reset UI</button> */}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          margin={[8, 8]} // MÅSTE matcha hookens marginY
          containerPadding={[0, 0]} // MÅSTE matcha hookens containerPaddingY
          compactType="vertical"
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
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
                isLocked={
                  layouts.lg?.find((l) => l.i === w.i)?.isDraggable === false
                }
                onToggleLock={() => handleToggleLock(w.i)}
              >
                {w.content}
              </Widget>
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Overlay för användarprofil */}
        {selectedUser && (
          <Overlay
            onClose={() => setSelectedUser(null)}
            title={selectedUser.displayName}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: "0 0 320px" }}>
                <ProfileCard user={selectedUser} />
              </div>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <AchievementIconDisplay
                  onIconClick={(badgeId) => setSelectedBadgeId(badgeId)}
                  user={selectedUser}
                />
              </div>
            </div>
          </Overlay>
        )}

        {/* Overlay för en specifik achievement */}
        {selectedBadgeId && currentUser && (
          <Overlay
            onClose={() => setSelectedBadgeId(null)}
            title="Achievement Details"
          >
            <UserAchievements
              user={currentUser}
              initialSelectedBadgeId={selectedBadgeId}
            />
          </Overlay>
        )}
      </section>
    </main>
  );
}
