# 🎮 Gamification API Guide

Detta dokument beskriver API:et för **Gamification-appen** och fungerar som ett kontrakt mellan backend (Go) och frontend.

**Bas-URL:** `/api/v1`

---

## 🧩 Datamodeller

### 🧑 User

Representerar en användare i systemet.

```json
{
  "id": 1,
  "displayName": "Anna Andersson",
  "avatarUrl": "/static/avatars/avatar_1_2025-10-08_15-30-00.jpg",
  "totalPoints": 150,
  "isAdmin": false,
  "createdAt": "2025-09-26T10:00:00Z",
  "updatedAt": "2025-09-26T12:00:00Z"
}
```

---

### ⚡ Activity

Representerar en händelse som har genererat poäng.

```json
{
  "id": 101,
  "userId": 1,
  "activityType": "PAGE_CREATED",
  "pointsAwarded": 15,
  "createdAt": "2025-09-26T10:00:00Z"
}
```

---

### 👥 Team

Representerar ett team av användare.

```json
{
  "id": 1,
  "name": "The A-Team",
  "createdAt": "2025-09-26T09:00:00Z"
}
```

---

### 🏅 Badge

Representerar en utmärkelse som en användare kan tjäna.

```json
{
  "id": 1,
  "name": "First Commit",
  "description": "Awarded for the first documentation contribution.",
  "icon_url": "/static/badges/badge_1_2025-10-08_15-30-00.png",
  "criteria_value": 1
}
```

---

### 🏆 Competition

Representerar en tävling inom en viss tidsram.

```json
{
  "id": 1,
  "name": "Oktober Dokumentations-sprint",
  "description": "Den som samlar flest poäng under oktober vinner!",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z",
  "status": "active",
  "createdAt": "2025-09-28T11:00:00Z"
}
```

---

# 🌐 API Endpoints

## 🔧 System

### `GET /api/v1`

**Beskrivning:** Hämtar rot-endpointen för API:et.  
Returnerar ett välkomstmeddelande och en lista över tillgängliga resurser och exempelanrop.

**Svar (200 OK):**

```json
{
  "message": "Welcome to the Gamification API v1",
  "status": "ok",
  "resources": {
    "users": "/api/v1/users",
    "teams": "/api/v1/teams",
    "competitions": "/api/v1/competitions"
  },
  "examples": {
    "Get a specific user by ID": "/api/v1/users/{id}"
  }
}
```

---

## 👤 Users (Användare)

### `GET /api/v1/users`

Hämtar en lista över alla användare, sorterade efter poäng i fallande ordning.

### `POST /api/v1/users`

Skapar en ny användare.

**Request Body:**

```json
{
  "confluenceAuthorId": "anna.andersson.id",
  "displayName": "Anna Andersson",
  "avatarUrl": ""
}
```

### `GET /api/v1/users/{id}`

Hämtar en specifik användare baserat på ID.

### `PUT /api/v1/users/{id}`

Uppdaterar en användares information.

**Request Body:**

```json
{
  "displayName": "Anna A. (Uppdaterad)",
  "isAdmin": false
}
```

### `DELETE /api/v1/users/{id}`

Tar bort en specifik användare.

---

## 👥 Teams

### `GET /api/v1/teams`

Hämtar en lista över alla team.

### `POST /api/v1/teams`

Skapar ett nytt team.

**Request Body:**

```json
{
  "name": "Frontend Wizards"
}
```

### `GET /api/v1/teams/{id}`

Hämtar ett specifikt team baserat på ID.

### `PUT /api/v1/teams/{id}`

Uppdaterar ett teams namn.

### `DELETE /api/v1/teams/{id}`

Tar bort ett team.

---

## 🧑‍🤝‍🧑 User & Team Management (`userteams`)

### `GET /api/v1/userteams/team/{teamId}`

Hämtar alla användare som är medlemmar i ett specifikt team.

### `POST /api/v1/userteams`

Lägger till en användare i ett team.

**Request Body:**

```json
{
  "user_id": 1,
  "team_id": 2
}
```

### `DELETE /api/v1/userteams/user/{userId}/team/{teamId}`

Tar bort en användare från ett team.

---

## 🏅 Badges (Utmärkelser)

### `GET /api/v1/badges`

Hämtar en lista över alla tillgängliga badges.

### `POST /api/v1/badges`

Skapar en ny badge.

**Request Body:**

```json
{
  "name": "Team Player",
  "description": "Awarded for collaborating on 5 team documents.",
  "iconUrl": "",
  "criteriaValue": 5
}
```

### `GET /api/v1/badges/{id}`

Hämtar en specifik badge.

### `PUT /api/v1/badges/{id}`

Uppdaterar en badge.

### `DELETE /api/v1/badges/{id}`

Tar bort en badge.

---

## 🎖️ User & Badge Management (`userbadges`)

### `POST /api/v1/userbadges`

Tilldelar en badge till en användare.

**Request Body:**

```json
{
  "userId": 1,
  "badgeId": 5
}
```

### `GET /api/v1/userbadges/{userId}/{badgeId}`

Kontrollerar om en användare har en specifik badge.

### `DELETE /api/v1/userbadges/{userId}/{badgeId}`

Tar bort en badge från en användare.

---

## 📈 Activities (Aktiviteter)

### `GET /api/v1/activities`

Hämtar en lista över alla poänggivande aktiviteter.

### `POST /api/v1/activities`

Skapar en ny aktivitet (t.ex. när en sida skapas i Confluence).

**Request Body:**

```json
{
  "userId": 1,
  "confluencePageId": "page-1234",
  "confluenceVersionNumber": 1,
  "activityType": "PAGE_CREATED",
  "pointsAwarded": 10
}
```

---

## 🏆 Competitions (Tävlingar)

### `GET /api/v1/competitions`

Hämtar en lista över alla tävlingar.

### `POST /api/v1/competitions`

Skapar en ny tävling.

**Request Body:**

```json
{
  "name": "November-utmaningen",
  "description": "Nya tag, nya poäng!",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z"
}
```

### `GET /api/v1/competitions/{id}`

Hämtar en specifik tävling.

### `DELETE /api/v1/competitions/{id}`

Tar bort en tävling.

---

## 📤 File Uploads

### `POST /api/v1/upload/avatar`

Laddar upp en avatar för en användare.  
Använder **multipart/form-data**.

**Form-data fält:**

- `userId` (t.ex. `11`)
- `uploadFile` (filen som ska laddas upp)

**Svar (200 OK):**

```json
{
  "avatarUrl": "/static/avatars/avatar_11_2025-10-08_15-45-00.png"
}
```

---

### `POST /api/v1/upload/badge`

Laddar upp en ikon för en badge.  
Använder **multipart/form-data**.

**Form-data fält:**

- `badgeId` (t.ex. `5`)
- `uploadFile` (filen som ska laddas upp)

**Svar (200 OK):**

```json
{
  "iconUrl": "/static/badges/badge_5_2025-10-08_15-50-00.png"
}
```
