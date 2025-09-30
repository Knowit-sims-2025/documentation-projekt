import { useEffect, useState } from "react";

/**
 * Lärar-kommentar:
 * - Denna komponent ansvarar för toppen av sidan (header + innehåll).
 * - Temat lagras i state och synkas till <html data-theme="..."> + localStorage.
 */
export default function App() {
  // 1) Läs starttema från DOM (sattes tidigt i index.html) eller default 'dark'
  const initialTheme =
    document.documentElement.getAttribute("data-theme") || "dark";

  // 2) State för tema
  const [theme, setTheme] = useState<"light" | "dark">(
    initialTheme === "light" ? "light" : "dark"
  );

  // 3) Synka state -> DOM + localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 4) UI: header + 2x4 grid enligt dina klasser
  return (
    <>
      <header className="app__header">
        <div className="container">
          <h1 className="muted" style={{ margin: 0 }}>
            Min Dashboard
          </h1>

          {/* Liten temaväljare – pedagogisk och lätt att ta bort */}
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="muted">Theme</span>
            <select
              aria-label="Välj tema"
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value === "light" ? "light" : "dark")
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
        </div>
      </header>

      <main className="app__main">
        <section className="dashboard">
          {/* Kolumn 1, två rader hög */}
          <div className="profile card">Profile</div>

          {/* Kolumn 2–3, rad 1 */}
          <div className="individual card">Individual</div>

          {/* Kolumn 2, rad 2 */}
          <div className="teams card">Teams</div>

          {/* Kolumn 3, rad 2 */}
          <div className="competition card">Competition</div>

          {/* Kolumn 4, två rader hög */}
          <div className="achievements card">Achievements</div>
        </section>
      </main>
    </>
  );
}
