# Gamification App API Contract (v2)

Detta dokument beskriver API:et för **Gamification-appen**.  
Det fungerar som ett kontrakt mellan **backend (Go)** och **frontend (React)** för att säkerställa smidig kommunikation.

**Base URL:** `/api/v1`

---

## 📌 Data Models

### User
Ett objekt som representerar en användare.

```json
{
  "id": 1,
  "displayName": "Anna Andersson",
  "avatarUrl": "https://example.com/avatar1.png",
  "totalPoints": 1250,
  "isAdmin": false
}
```

---

### Activity
Ett objekt som representerar en händelse som gett poäng.

```json
{
  "id": 101,
  "description": "Skapade sidan 'Ny API-dokumentation'",
  "pointsAwarded": 15,
  "timestamp": "2025-09-26T10:00:00Z",
  "user": {
    "id": 1,
    "displayName": "Anna Andersson"
  }
}
```

---

### Competition
Ett objekt som representerar en tävling.

```json
{
  "id": 1,
  "name": "Oktober Dokumentations-sprint",
  "description": "Den som samlar flest poäng under oktober vinner!",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z",
  "status": "active" // Kan vara 'upcoming', 'active', 'finished'
}
```

---

## 🌍 Public Endpoints

### Hämta Global Leaderboard
Returnerar en topplista med de 10 användare som har högst totalpoäng.

- **Endpoint:** `GET /leaderboard`

**Svar (200 OK):**

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "displayName": "Erik Svensson",
        "avatarUrl": "https://example.com/avatar5.png"
      },
      "totalPoints": 2550
    }
    // ... 9 fler användare
  ]
}
```

---

### Hämta Globalt Aktivitetsflöde
Returnerar de 20 senaste händelserna som har gett poäng.

- **Endpoint:** `GET /activities/feed`

**Svar (200 OK):**

```json
{
  "feed": [
    // ... en lista av Activity-objekt
  ]
}
```

---

## 👤 User Endpoints

### Hämta en Användares Profil
Returnerar detaljerad information om en specifik användare.

- **Endpoint:** `GET /users/:userId/profile`

**Svar (200 OK):**

```json
{
  "user": {
    "id": 1,
    "displayName": "Anna Andersson",
    "avatarUrl": "https://example.com/avatar1.png",
    "totalPoints": 1250
  },
  "badges": [
    {
      "id": 1,
      "name": "First Commit",
      "description": "Första dokumentationsbidraget",
      "iconUrl": "/badges/first-commit.png"
    }
  ],
  "recentActivities": [
    // ... en lista av Activity-objekt för denna användare
  ]
}
```

---

### Hämta alla användare
Returnerar en lista på alla användare i systemet.  
Användbart för "Vem är du?"-dropdown.

- **Endpoint:** `GET /users`

**Svar (200 OK):**

```json
{
  "users": [
    // ... en lista av User-objekt
  ]
}
```

---

## 🏆 Competition Endpoints

### Hämta alla Tävlingar
Returnerar en lista på alla tävlingar.

- **Endpoint:** `GET /competitions`

**Svar (200 OK):**

```json
{
  "competitions": [
    // ... en lista av Competition-objekt
  ]
}
```

---

### Hämta Leaderboard för en Tävling
Returnerar en topplista för en specifik tävling, baserat på poäng som samlats enbart under tävlingens tidsperiod.

- **Endpoint:** `GET /competitions/:competitionId/leaderboard`

**Svar (200 OK):**

```json
{
  "competitionName": "Oktober Dokumentations-sprint",
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "displayName": "Erik Svensson"
      },
      "pointsInCompetition": 255
    }
    // ... fler användare
  ]
}
```

---

## 🔑 Admin Endpoints
Dessa endpoints kräver att användaren är autentiserad och har `isAdmin = true`.

---

### Skapa en ny Tävling
- **Endpoint:** `POST /admin/competitions`

**Request Body:**

```json
{
  "name": "November-utmaningen",
  "description": "Nya tag, nya poäng!",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z"
}
```

**Svar (201 Created):** Returnerar det nyskapade Competition-objektet.

---

### Uppdatera en Tävling
- **Endpoint:** `PUT /admin/competitions/:competitionId`

**Request Body:** (samma som ovan)

**Svar (200 OK):** Returnerar det uppdaterade Competition-objektet.

---

### Ta bort en Tävling
- **Endpoint:** `DELETE /admin/competitions/:competitionId`

**Svar (204 No Content):** Inget innehåll returneras vid lyckad borttagning.
