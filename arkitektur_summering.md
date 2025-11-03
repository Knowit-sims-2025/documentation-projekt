# Frontend Arkitektur: En Detaljerad Genomgång

## 1. Grundläggande Arkitektur

Applikationen följer ett tydligt och modernt mönster: **Component -> Hook -> Service -> API**.

- **Component:** En React-komponent som antingen visar data ("dum" komponent) eller hanterar UI-logik ("smart" komponent).
- **Hook:** En custom React Hook (`use...`) som isolerar logik för state-hantering och datahämtning. Det är dessa som anropar services.
- **Service:** En JavaScript/TypeScript-fil som exporterar funktioner som utför de faktiska `fetch`-anropen till backend. De ansvarar också för att normalisera (städa upp) datan från backend.
- **API:** Backend-serverns endpoints (t.ex. `/api/v1/...`).

---

## 2. Applikationens Huvudstruktur

1.  **`main.tsx`**: Startpunkten som renderar `App.tsx`.
2.  **`App.tsx`**: Rot-komponenten.
    - Omsluter hela appen i en **`AuthProvider`**, vilket gör all autentiserings-data tillgänglig överallt.
    - Renderar en **`Shell`**-komponent som bygger upp sidans layout.
3.  **`Shell`-komponenten**:
    - Renderar **`Header.tsx`**, **`Dashboard.tsx`**, och **`Footer.tsx`**.
    - Använder `useAuth()` för att kolla om användaren är inloggad. Om inte, visas **`LoginOverlay.tsx`** som ett heltäckande lager.

---

## 3. Komponent-katalog

Här är en detaljerad uppdelning av appens komponenter, per funktion.

### 3.1 Autentisering

- **`AuthContext.tsx`**: Hjärtat i systemet. En React Context som håller koll på `currentUser`, `allUsers`, och `isAuthenticated`. Den innehåller funktionerna `login`, `logout` och `updateCurrentUserAvatar`. Vid start kollar den `localStorage` efter en token och försöker logga in användaren automatiskt.
- **`LoginOverlay.tsx`**: En modal/overlay som visas när användaren inte är inloggad. Den använder `createPortal` för att renderas på toppnivå i DOM.
- **`LoginForm.tsx`**: Själva inloggningsformuläret med ett fält för "Confluence Author ID". Anropar `login`-funktionen från `AuthContext`.

### 3.2 Layout & Dashboard

- **`Header.tsx`**: Sidhuvudet. Innehåller `SettingsButton`, `SettingsMenu` och `ThemeToggle`. Hanterar även logiken för att ladda upp en ny avatar.
- **`Footer.tsx`**: Enkel sidfot med copyright-text.
- **`Dashboard.tsx`**: Huvudvyn efter inloggning. Använder `react-grid-layout` för att skapa ett anpassningsbart rutnät av widgets.
- **`Widget.tsx`**: Den generiska "ramen" för varje widget på dashboarden. Tillhandahåller rubrik, samt knappar för att låsa och minimera widgeten.

### 3.3 Leaderboards

- **`UserLeaderBoard.tsx`**: En "smart" komponent som agerar container för de individuella topplistorna.
  - **`LeaderboardTabs.tsx`**: Renderar flikarna (Daily, Weekly, Total, Stats).
- **Total-vyn**:
  - **`TotalList.tsx`**: Renderar en lista av `IndividualRank`-komponenter.
  - **`IndividualRank.tsx`**: Visar en rad för en användare med totalpoäng, rank, avatar och namn.
- **Daily-vyn**:
  - **`DailyControls.tsx`**: UI för att välja datum.
  - **`DailyList.tsx`**: Renderar en lista av `DailyRankItem`-komponenter.
  - **`DailyRankItem.tsx`**: Visar en rad för en användare med dagens poäng.
- **Weekly-vyn**:
  - **`WeeklyCurrent.tsx`**: "Smart" komponent för veckovyn som använder `useWeeklyLeaderboard`.
  - **`WeeklyControls.tsx`**: UI för att välja vecka.
  - **`WeeklyList.tsx`**: Renderar en lista med rader för veckans poäng.
- **Team-vyn**:
  - **`TeamLeaderboard.tsx`**: Visar en rankad lista över team. Använder `useTeams`.
  - **`TeamDetails.tsx`**: Visas i en overlay och listar medlemmarna i ett valt team.

### 3.4 Achievements

_Notering: Det finns en stavningsinkonsekvens i filnamnen (`Achivements.tsx` och `achivementCard.tsx`)._

- **`AchievementIconDisplay.tsx`**: Visas på dashboarden. Renderar ett rutnät av alla achievement-ikoner. Visar upplåsta i färg och låsta i gråskala.
- **`AchievementHoverCard.tsx`**: En "tooltip"-komponent som visas när man hovrar över en ikon i `AchievementIconDisplay`. Visar namn, beskrivning och en progressbar.
- **`Achivements.tsx`**: En enkel "wrapper"-komponent. Används i overlayen för att visa detaljer.
- **`achievementCard.tsx`**: Den huvudsakliga "detaljvyn" för achievements. Visar en komplett lista av alla achievements med progressbars för varje. Man kan klicka på en för att se en ännu mer detaljerad vy.

### 3.5 Profil

- **`Profile.tsx`**: Används i "Profile"-widgeten på dashboarden. Hämtar `currentUser` och renderar `ProfileCard`.
- **`ProfileCard.tsx`**: Ett "rikt" kort som visar en användares profil. Använder `useUserStats`.
  - Visar avatar, namn, admin-status.
  - Renderar **`UserLifeTimeStats.tsx`** för att visa livstidsstatistik.
  - Visar en progressbar för användarens framsteg mot nästa rank.
- **`UserLifeTimeStats.tsx`**: Enkel komponent som visar totala kommentarer, skapade sidor, redigeringar etc.

### 3.6 Generiska & Återanvändbara Komponenter

- **`Avatar.tsx`**: Visar en användarbild med en bra fallback.
- **`ProgressBar.tsx`**: Flexibel progressbar som används för både rank och achievements.
- **`Switch.tsx`**: Generisk och tillgänglig toggle-komponent.
- **`ThemeToggle.tsx`**: UI för att byta ljust/mörkt tema.
- **`Overlay.tsx`**: Generisk modal/pop-up-komponent.
- **`SettingsMenu.tsx`**: Dropdown-meny för inställningar.
- **`ErrorMessage.tsx`** & **`Loading.tsx`**: Simpla komponenter för att visa fel och laddningsmeddelanden.

### 3.7 Ofärdiga / Placeholder-komponenter

- **`StatsDisplay.tsx`**: En placeholder för den framtida "Stats"-fliken.
- **`features/stats/PointsChart.tsx`**: En ofärdig fil som importerar `recharts` men saknar en färdig komponent.

---
