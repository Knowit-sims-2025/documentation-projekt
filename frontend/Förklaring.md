
---

## 📂 Mappbeskrivningar

### `assets/`
- Ikoner (SVG/PNG), fonter, bakgrundsbilder, statiska resurser.

### `components/`
- Små, återanvändbara UI-byggstenar.
- Exempel: `Button.tsx`, `Card.tsx`, `Table.tsx`, `Modal.tsx`.

### `features/`
- Varje “slice” av funktionalitet bor här.
- Exempel:  
  - `auth/` → inloggning, session  
  - `leaderboard/` → listor, ranking  
  - `achievements/` → badges, modaler  
  - `stale-docs/` → filter, listor  
  - `teams/` → laghantering  
  - `profile/` → användarinställningar  
  - `dashboard/` → översikt

### `hooks/`
- Custom hooks som används av flera features eller komponenter.

### `pages/`
- Routing-nivåkomponenter (kopplade till `react-router-dom`).

### `services/`
- API-anrop (REST/GraphQL), adapters, mock-data.
- `http.ts` → wrapper runt fetch/axios.
- `adapters/` → samma signatur, men mock vs real.

### `store/`
- Global state management (t.ex. Redux Toolkit, Zustand eller Recoil).
- Hanterar auth-state, UI-preferenser (tema), ev. cache som inte hör hemma i React Query.

### `styles/`
- Globala styles och teman.
- Tailwind-config, variabler, reset.css eller tokens.

---

## 🚀 Rekommenderat arbetssätt

1. **Feature-first**  
   Ny funktion = ny mapp i `features/`. Lägg sidor i `pages/` om de har egen route.  
   
2. **Delad UI**  
   Återanvändbara komponenter i `components/`.  
   
3. **Kontraktstyrd utveckling**  
   API-typer i `services/` → mock först, backend sen.  

4. **Tema & responsivitet**  
   Gemensamma tokens i `styles/` → använd i `components/`.  

---

## 👥 Ansvarsfördelning – Vertikala slices

### Dev A – *“Upplevelse & Navigering”*
**Äger:**
- `app/layout` (TopNav, SideNav, AppLayout, routing)
- `styles/` (tema-tokens, dark/light)
- `features/auth/` (Login, sessionflöde)
- `features/dashboard/` (översikt, statskort)
- `features/profile/` (profilformulär)

**Leverabler:**
- Pixel-perfect layout
- Responsiv design
- Temaväxling (light/dark)
- Inloggning & routing
- Grundskelett för appen

---

### Dev B – *“Gamification-features”*
**Äger:**
- `features/leaderboard/` (listor, pagination, filter)
- `features/achievements/` (badge-grid, progress, modal)
- `features/stale-docs/` (filter 15/30/60/120, listor, länkar)
- `features/teams/` (teamboard, lagranking)

**Leverabler:**
- Datahämtning via adapter
- Filterlogik (kopplad till URL-query)
- Laddning/fel/tomt-tillstånd
- Tabeller & listor redo för backend-integration

---

### Delat ansvar
- `components/` (UI-kit: Button, Card, Modal, Table, Tabs, Select)
- `services/` (API-typer & adapters – samma signatur, mock vs HTTP)
- `hooks/` (delade hooks som `useAuth`, `useTheme`)

> **Regel:** API-typer (`services/types/*`) låses tidigt och ändras bara i samråd.  
> **Mock först:** jobba mot mockar, byt sedan till backend utan att ändra feature-kod.

---

## 🌳 Exempel på filträd för `features/leaderboard`
