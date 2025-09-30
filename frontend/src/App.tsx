import React from "react";

export default function App() {
  // ungefärlig headerhöjd ~64–72px (vi ger main motsvarande padding)
  return (
    <div className="min-h-screen">
      {/* FIXED HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-yellow-500/40 bg-yellow-400 text-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <h1 className="text-lg font-bold">header</h1>
          <nav className="text-sm">/* meny / ikoner här senare */</nav>
        </div>
      </header>

      {/* GRID 2×4 (md och uppåt) — padding-top kompenserar för fixed header */}
      <main className="pt-20">
        <div className="grid h-[calc(100vh-5rem)] gap-2 md:grid-cols-4 md:grid-rows-2">
          <section className="bg-orange-500 md:col-start-1 md:row-span-2 h-full w-full flex items-center justify-center">
            Profil
          </section>

          <section className="bg-fuchsia-700 md:col-start-2 md:col-span-2 md:row-start-1 h-full w-full flex items-center justify-center">
            Individual leaderboard
          </section>

          <section className="bg-teal-500 md:col-start-2 md:row-start-2 h-full w-full flex items-center justify-center">
            Teams
          </section>

          <section className="bg-rose-600 md:col-start-3 md:row-start-2 h-full w-full flex items-center justify-center">
            Competition
          </section>

          <aside className="bg-amber-200 text-black md:col-start-4 md:row-span-2 h-full w-full flex items-center justify-center">
            Achievements
          </aside>
        </div>
      </main>
    </div>
  );
}
