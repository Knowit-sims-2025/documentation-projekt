# Frontend-arkitektur: Gamification Dashboard

Detta dokument beskriver arkitekturen och implementationen av frontend-applikationen.

## 1. Översikt

Frontend är en **Single Page Application (SPA)** byggd med **React** och **TypeScript**. Applikationen är skapad med Vite, vilket ger en snabb och modern utvecklingsmiljö.

Arkitekturen är starkt influerad av **Feature-Sliced Design (FSD)**, en metod som organiserar kodbasen i logiska och funktionella "skivor" (features). Detta främjar modularitet, skalbarhet och gör det enklare för utvecklare att arbeta parallellt.

**Kärnteknologier:**

- **React:** För att bygga ett komponentbaserat och deklarativt användargränssnitt.
- **TypeScript:** För statisk typning, vilket ökar kodkvaliteten och minskar antalet fel vid körning.
- **React-Grid-Layout:** För att skapa en dynamisk och anpassningsbar dashboard där användaren kan flytta och ändra storlek på widgets.
- **CSS Modules (via filkonvention):** Styling är scopad till enskilda komponenter eller features (t.ex. `achievements.css`), vilket förhindrar globala stilkonflikter.

---

## 2. Mappstruktur

Strukturen följer FSD-principer för att separera ansvarsområden.

```
src/
├── components/ui/       # Återanvändbara, "dumma" UI-komponenter
├── features/            # Applikationens kärnfunktioner (features)
│   ├── achievements/
│   ├── auth/
│   ├── dashboard/
│   ├── leaderboard/
│   └── profile/
├── hooks/               # Delade, återanvändbara React Hooks
├── layout/              # Applikationens övergripande skal
├── services/            # Kommunikation med backend-API:et
├── styles/              # Globala stilar och variabler
├── types/               # Delade TypeScript-typer
└── utils/               # Hjälpfunktioner
```

### `components/ui/`

Innehåller små, presentationsfokuserade komponenter som saknar egen affärslogik. De tar emot data och funktioner via `props`.

- **Exempel:** `Widget.tsx`, `Overlay.tsx`, `Avatar.tsx`, `Switch.tsx`, `ProgressBar.tsx`.

### `features/`

Hjärtat i applikationen. Varje undermapp representerar en "feature" och är så självförsörjande som möjligt, med egna komponenter, hooks och stilar.

- `features/auth/`: Hanterar allt som rör autentisering, inklusive `AuthContext` som tillhandahåller användarstatus till hela appen, samt `LoginForm` och `LoginOverlay`.
- `features/dashboard/`: Innehåller `Dashboard.tsx`, den centrala komponenten som agerar "dirigent" och sätter samman alla andra features till en rutnätslayout.
- `features/leaderboard/`: Komponenter för att visa topplistor, som `UserLeaderBoard.tsx` och `TeamLeaderboard.tsx`.
- `features/profile/`: Komponenter för att visa användarprofiler, som `Profile.tsx` och den mer detaljerade `ProfileCard.tsx`.
- `features/achievements/`: Komponenter för att visa utmärkelser, som den kompakta `AchievementIconDisplay.tsx` och den detaljerade listan `Achievements.tsx`.

### `hooks/`

Innehåller anpassade React Hooks som delar stateful logik mellan flera komponenter.

- **Exempel:** `useTheme.ts` för att hantera temabyte (light/dark) och `useAuth.ts` som är en genväg för att konsumera `AuthContext`.

### `layout/`

Definierar applikationens övergripande visuella ramverk.

- **Exempel:** `Header.tsx`, `Footer.tsx`.

### `services/`

Detta lager agerar som en brygga till backend-API:et. Det ansvarar för att göra HTTP-anrop, hantera autentiseringstokens och normalisera data från backend till de typer som frontend förväntar sig.

- **Exempel:** `users.ts`, `teams.ts`, `auth.ts` (som innehåller `authFetch`, en wrapper runt `fetch` som automatiskt inkluderar JWT-token).

### `styles/`

Innehåller globala CSS-filer, variabler och teman. Feature-specifik CSS ligger dock direkt i respektive `features`-mapp (t.ex. `features/achievements/achievements.css`).

---

## 3. Centrala Flöden och Arkitekturbeslut

### 3.1. Applikationens Start och Autentisering

1.  Applikationen startar i `main.tsx`, som ser till att hela appen omsluts av `AuthProvider`.
2.  `App.tsx` renderar `Shell`-komponenten.
3.  `Shell` använder `useAuth()`-hooken för att kontrollera om användaren är inloggad (`isAuthenticated`).
4.  Om användaren **inte** är inloggad, visas en `LoginOverlay` som täcker hela skärmen och tvingar fram en inloggning via `LoginForm`.
5.  När inloggningen lyckas uppdateras `AuthContext`, `isAuthenticated` blir `true`, och `LoginOverlay` försvinner för att avslöja `Dashboard`.

### 3.2. Dashboard och Widget-systemet

`Dashboard.tsx` är den mest komplexa komponenten. Den använder `react-grid-layout` för att skapa ett dynamiskt rutnät.

- **Layout:** Layoutkonfigurationen (position och storlek på widgets) definieras i `dashboardLayout.ts` men kan anpassas av användaren. Ändringarna sparas i webbläsarens `localStorage` för att bibehållas mellan sessioner.
- **Orkestrering:** Dashboarden renderar inte innehåll direkt, utan fungerar som en container som placerar ut olika feature-komponenter (t.ex. `UserLeaderBoard`, `Profile`) inuti `Widget`-komponenter.

### 3.3. Dataflöde (Komponent -> Hook -> Service)

Applikationen följer ett konsekvent mönster för datahämtning:

1.  **Komponent:** En komponent (t.ex. `UserLeaderBoard`) behöver data.
2.  **Hook:** Den anropar en anpassad hook (t.ex. `useUsers()`).
3.  **Service:** Hooken anropar i sin tur en funktion i `services`-lagret (t.ex. `getAllUsers()` i `services/users.ts`).
4.  **API:** Service-funktionen gör det faktiska `fetch`-anropet till backend-API:et.

Detta mönster separerar ansvarsområden tydligt: komponenten behöver inte veta _hur_ data hämtas, bara _att_ den får data, laddningsstatus och eventuella fel från hooken.

### 3.4. Interaktivitet med Overlays

För att visa detaljerad information utan att byta sida används en `Overlay`-komponent.

- `Dashboard.tsx` äger state för vad som ska visas (t.ex. `selectedUser`).
- När en användare klickas i en lista anropas `setSelectedUser(user)`.
- Detta får `Dashboard` att rendera `<Overlay>` med en `ProfileCard` inuti, som får den valda användarens data som en prop.
- När overlayen stängs nollställs `selectedUser`, och komponenten försvinner.

### 3.5. Från Prototyp till Applikation

Utvecklingen startade med en statisk prototyp i mappen `Mock-up/`. Denna prototyp, byggd med ren HTML, CSS och JavaScript (`app.js`), var avgörande för att:

- **Definiera UI/UX:** Testa layout, färgscheman (`style.css`) och grundläggande interaktioner som temabyte och overlay-fönster.
- **Validera koncept:** Snabbt visualisera hur en dashboard med olika widgets skulle kunna se ut och fungera.

Erfarenheterna från prototypen översattes sedan till en robust React-arkitektur. CSS-reglerna i `style.css` delades upp och scopades till sina respektive komponenter, och logiken från `app.js` omvandlades till återanvändbara React-komponenter och hooks.
