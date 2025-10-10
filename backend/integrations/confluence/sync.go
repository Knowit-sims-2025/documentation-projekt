package confluence

import (
	"database/sql"
	"fmt"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"log"
)

type Repositories struct {
	UserRepo     *database.UserRepository
	ActivityRepo *database.ActivityRepository
}

// SyncActivities är huvudfunktionen för att synkronisera data.
func SyncActivities(client *Client, repos Repositories) {
	log.Println("Startar Confluence-synkronisering...")

	pageResponse, err := client.GetPages()
	if err != nil {
		log.Printf("FEL vid hämtning från Confluence: %v", err)
		return
	}

	userCache := make(map[string]UserResponse)
	var newActivitiesCount int

	for _, page := range pageResponse.Results {
		if page.Version.By.AccountID == "" {
			continue // Hoppa över om sidan saknar författare
		}
		authorID := page.Version.By.AccountID

		userDetails, found := userCache[authorID]
		if !found {
			details, err := client.GetUserDetails(authorID)
			if err != nil {
				log.Printf("FEL vid hämtning av användardetaljer för ID %s: %v", authorID, err)
				continue
			}
			if details == nil {
				log.Printf("Hittade inga användardetaljer för ID %s, hoppar över.", authorID)
				continue
			}
			userCache[authorID] = *details
			userDetails = *details
		}
		authorName := userDetails.DisplayName

		exists, err := repos.ActivityRepo.ActivityExists(page.ID, page.Version.Number)
		if err != nil {
			log.Printf("FEL vid kontroll av aktivitet: %v", err)
			continue
		}
		if exists {
			continue // Hoppa över om den redan finns
		}

		user, err := findOrCreateUser(authorID, authorName, repos.UserRepo)
		if err != nil {
			log.Printf("FEL vid hantering av användare %s: %v", authorName, err)
			continue
		}

		// ---- Logik för att skilja på SKAPAD vs UPPDATERAD ----
		var activityType string
		var pointsAwarded int
		var logMessage string

		if page.Version.Number == 1 {
			activityType = "PAGE_CREATED"
			pointsAwarded = 25 // Ge fler poäng för att skapa en ny sida
			logMessage = fmt.Sprintf("Ny sida: Användare '%s' skapade sidan '%s'. Registrerar aktivitet...", user.DisplayName, page.Title)
		} else {
			activityType = "PAGE_UPDATED"
			pointsAwarded = 10 // Standardpoäng för en uppdatering
			logMessage = fmt.Sprintf("Siduppdatering: Användare '%s' uppdaterade sidan '%s' (v%d). Registrerar aktivitet...", user.DisplayName, page.Title, page.Version.Number)
		}
		log.Println(logMessage)
		// ---------------------------------------------------------

		activity := models.Activity{
			UserID:                  user.ID,
			ConfluencePageID:        page.ID,
			ConfluenceVersionNumber: page.Version.Number,
			ActivityType:            activityType,
			PointsAwarded:           pointsAwarded,
		}

		_, err = repos.ActivityRepo.CreateActivity(&activity)
		if err != nil {
			log.Printf("FEL vid skapande av aktivitet för sida %s: %v", page.ID, err)
			continue
		}
		if err := repos.UserRepo.UpdateUserPoints(int64(user.ID), user.TotalPoints+pointsAwarded); err != nil {
			log.Printf("FEL vid uppdatering av poäng för %s: %v", user.DisplayName, err)
			continue
		}
		newActivitiesCount++
	}

	log.Printf("Confluence-synkronisering slutförd. %d nya aktiviteter registrerades.", newActivitiesCount)
}

// findOrCreateUser letar efter en användare med ett Confluence-ID och skapar den om den inte finns.
func findOrCreateUser(authorID, authorName string, userRepo *database.UserRepository) (*models.User, error) {
	user, err := userRepo.GetUserByConfluenceID(authorID)
	if err != nil {
		return nil, fmt.Errorf("databasfel vid sökning efter användare: %w", err)
	}

	if user != nil {
		return user, nil
	}

	log.Printf("Ny användare upptäckt: %s. Skapar profil...", authorName)
	newUser := models.User{
		ConfluenceAuthorID: authorID,
		DisplayName:        authorName,
		AvatarURL:          sql.NullString{String: "", Valid: false},
	}

	newID, err := userRepo.CreateUser(&newUser)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa ny användare: %w", err)
	}
	newUser.ID = newID

	return &newUser, nil
}
