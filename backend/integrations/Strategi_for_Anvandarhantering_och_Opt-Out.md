# Strategi för Användarhantering och Opt-Out

Detta dokument beskriver en robust strategi för att hantera användares livscykel, inklusive hur de kan välja att inte längre delta i gamification-appen utan att datahistoriken förstörs.

---

## 1. Grundläggande Arkitektur: Proaktiv Provisionering

Vi behåller den ursprungliga idén:

- Systemet synkroniserar kontinuerligt aktivitet från Confluence.  
- När en ny `authorId` upptäcks, skapas automatiskt en användarprofil i vår databas.  
- All aktivitet kopplas till denna profil.  
- När en användare loggar in för första gången via Confluence, kopplas de till sin befintliga, förskapade profil.  

Detta säkerställer en komplett och korrekt datahistorik från start.

---

## 2. Problemet: Permanent Borttagning (Hard Delete)

Att permanent radera en användare (`DELETE FROM users...`) leder till två allvarliga problem:

- **"Zombie-användare"**: Vid nästa synkronisering kommer användaren att återskapas eftersom deras aktivitet fortfarande finns i Confluence.  
- **Förlorad datahistorik**: Användarens tidigare bidrag och poäng försvinner, vilket kan påverka och förvränga historiska resultat för team och tävlingar.

---

## 3. Lösningen: Mjuk Radering och Anonymisering

För att lösa detta implementerar vi en *soft delete*-strategi. Istället för att radera en användare, markerar vi dem som inaktiva och anonymiserar deras personliga data.

### Steg 1: Databas-schemaändring

Vi lägger till en ny kolumn i `users`-tabellen.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    confluence_author_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    -- NY KOLUMN: Markerar om användaren är aktiv eller har valt att sluta delta.
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Steg 2: Uppdatera Go-modellen

Vi lägger till det nya fältet i `User`-structen.

```go
type User struct {
    ID                 int64          `json:"id"`
    ConfluenceAuthorID string         `json:"-"`
    DisplayName        string         `json:"displayName"`
    AvatarURL          sql.NullString `json:"avatarUrl"`
    Total_points       int            `json:"totalPoints"`
    IsAdmin            bool           `json:"isAdmin"`
    IsActive           bool           `json:"isActive"` // NYTT FÄLT
    CreatedAt          time.Time      `json:"createdAt"`
    UpdatedAt          time.Time      `json:"updatedAt"`
}
```

### Steg 3: Ändra "Delete" till "Deactivate"

Vi skapar en ny funktion i `UserRepository` som inte raderar, utan inaktiverar och anonymiserar användaren.

```go
// DeactivateUser anonymiserar och inaktiverar en användare.
func (repo *UserRepository) DeactivateUser(id int64) error {
    query := `
        UPDATE users 
        SET 
            is_active = FALSE, 
            display_name = 'Anonymiserad användare', 
            avatar_url = '/static/avatars/default_avatar.png',
            confluence_author_id = 'anonymized_' || id::text || '_' || confluence_author_id
        WHERE id = $1`
    _, err := repo.DB.Exec(query, id)
    return err
}
```

Vi ändrar även `confluence_author_id` för att undvika unika nyckel-konflikter om personen skulle vilja komma tillbaka i framtiden.

### Steg 4: Uppdatera API-handlern

`DeleteUserHandler` ska nu anropa `DeactivateUser`.

```go
func (h *UserHandler) DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid user ID", http.StatusBadRequest)
        return
    }

    // Anropa den nya deaktiveringsfunktionen istället för DeleteUser
    if err := h.Repo.DeactivateUser(id); err != nil {
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}
```

### Steg 5: Uppdatera Synkroniseringslogiken

Synken måste nu ignorera inaktiva användare.

```go
// I loopen for _, page := range response.Results { ... }

// ... efter att du hämtat användaren ...
user, err := userRepo.GetUserByConfluenceID(page.Version.AuthorID)

// ...

// NYTT: Om användaren finns men har valt att sluta delta, ignorera all ny aktivitet.
if user != nil && !user.IsActive {
    log.Printf("Skipping activity for deactivated user with Confluence ID %s", page.Version.AuthorID)
    continue // Hoppa till nästa sida i loopen
}

// ... resten av logiken för att skapa användare och aktiviteter ...
```

### Steg 6: Filtrera bort inaktiva användare i API-svar

Alla funktioner som hämtar listor med användare (t.ex. leaderboards) måste nu filtrera bort inaktiva användare.

Exempel för `GetAllUsers`:

```go
func (repo *UserRepository) GetAllUsers() ([]models.User, error) {
    // LÄGG TILL "WHERE is_active = TRUE"
    rows, err := repo.DB.Query("SELECT ... FROM users WHERE is_active = TRUE ORDER BY total_points DESC")
    // ... resten av funktionen ...
}
```

---

## Sammanfattning av flödet

1. En användare vill bli borttagen: En admin klickar på "Ta bort" i ett gränssnitt.  
2. **API-anrop:** Frontend skickar `DELETE /api/v1/users/{id}`.  
3. **Backend-logik:** `DeactivateUser`-funktionen körs.  
4. **Resultat:**  
   - `is_active` sätts till `false`.  
   - Namn och bild anonymiseras.  
   - `confluence_author_id` ändras för att undvika framtida konflikter.  
   - Användarens poäng och aktiviteter behålls för historikens skull.  

---

## Framtida konsekvenser

- Användaren syns inte längre på topplistor eller i sökresultat.  
- Vid nästa Confluence-synk kommer systemet att ignorera all ny aktivitet från denna användare.  
- Problemet med "zombie-användare" är löst.
