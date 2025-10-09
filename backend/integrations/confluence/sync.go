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

	// En enkel cache för att undvika att fråga efter samma användare flera gånger
	userCache := make(map[string]UserResponse)
	var newActivitiesCount int

	for _, page := range pageResponse.Results {
		// Författar-ID finns nu inuti page.Version.By.AccountID
		if page.Version.By.AccountID == "" {
			continue // Hoppa över om sidan saknar författare
		}
		authorID := page.Version.By.AccountID

		// Kolla om vi redan har hämtat denna användares detaljer
		userDetails, found := userCache[authorID]
		if !found {
			// Hämta användarens namn via ett separat API-anrop
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

		// Kolla om vi redan har registrerat denna specifika sidversion
		exists, err := repos.ActivityRepo.ActivityExists(page.ID, page.Version.Number)
		if err != nil {
			log.Printf("FEL vid kontroll av aktivitet: %v", err)
			continue
		}
		if exists {
			continue // Hoppa över om den redan finns
		}

		// Hitta användaren i vår databas, eller skapa en ny om den inte finns
		user, err := findOrCreateUser(authorID, authorName, repos.UserRepo)
		if err != nil {
			log.Printf("FEL vid hantering av användare %s: %v", authorName, err)
			continue
		}

		// Skapa den nya aktiviteten
		activity := models.Activity{
			UserID:                  user.ID,
			ConfluencePageID:        page.ID,
			ConfluenceVersionNumber: page.Version.Number,
			ActivityType:            "PAGE_UPDATED",
			PointsAwarded:           10, // Sätt en standardpoäng
		}

		_, err = repos.ActivityRepo.CreateActivity(&activity)
		if err != nil {
			log.Printf("FEL vid skapande av aktivitet för sida %s: %v", page.ID, err)
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

	// Användaren finns inte, skapa en ny
	log.Printf("Ny användare upptäckt: %s. Skapar profil...", authorName)
	newUser := models.User{
		ConfluenceAuthorID: authorID,
		DisplayName:        authorName,
		AvatarURL:          sql.NullString{String: "", Valid: false}, // Får en default-bild i databasen
	}

	newID, err := userRepo.CreateUser(&newUser)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa ny användare: %w", err)
	}
	newUser.ID = newID

	return &newUser, nil
}

