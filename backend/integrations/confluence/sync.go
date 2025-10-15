package confluence

import (
	"database/sql"
	"fmt"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"log"
	"strings"
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

	for _, content := range pageResponse.Results {
		page := content

		newActivitiesCount += syncPageActivities(client, repos, page, userCache)
		newActivitiesCount += syncCommentActivities(client, repos, page, userCache)
	}

	log.Printf("Confluence-synkronisering slutförd. %d nya aktiviteter registrerades.", newActivitiesCount)
}

// Hanterar “PAGE_CREATED” och “PAGE_UPDATED” activities
func syncPageActivities(client *Client, repos Repositories, page Content, userCache map[string]UserResponse) int {
	var newActivities int

	if page.Version.By.AccountID == "" {
		return 0
	}

	authorID := page.Version.By.AccountID
	userDetails := getCachedUserDetails(client, authorID, userCache)
	if userDetails == nil {
		return 0
	}

	exists, err := repos.ActivityRepo.ActivityExists(page.ID, page.Version.Number)
	if err != nil {
		log.Printf("FEL vid kontroll av sidaktivitet: %v", err)
		return 0
	}
	if exists {
		return 0
	}

	user, err := findOrCreateUser(authorID, userDetails.DisplayName, repos.UserRepo)
	if err != nil {
		log.Printf("FEL vid hantering av sid-användare %s: %v", userDetails.DisplayName, err)
		return 0
	}

	var activityType string
	var pointsAwarded int
	if page.Version.Number == 1 {
		activityType = "PAGE_CREATED"
		pointsAwarded = PointsForPageCreated()
	} else {
		activityType = "PAGE_UPDATED"

		oldVersion := page.Version.Number - 1
		oldContent, err := client.GetPageVersionContent(page.ID, oldVersion)
		if err != nil {
			log.Printf("FEL: Kunde inte hämta gammal version (%d) för sida %s: %v", oldVersion, page.ID, err)
			pointsAwarded = 0
		}
		log.Printf("OLD version %d content length: %d", oldVersion, len(oldContent))

		newContent, err := client.GetPageVersionContent(page.ID, page.Version.Number)
		if err != nil {
			log.Printf("FEL: Kunde inte hämta ny version (%d) för sida %s: %v", page.Version.Number, page.ID, err)
			pointsAwarded = 0
		}

		if err == nil {
			pointsAwarded = PointsForPageUpdated(oldContent, newContent)
			log.Printf("Poäng utdelade: %d (diff mellan version %d → %d)", pointsAwarded, oldVersion, page.Version.Number)
		}
		log.Printf("NEW version %d content length: %d", page.Version.Number, len(newContent))

	}

	log.Printf("Sida: %s av %s (%s)", page.Title, user.DisplayName, activityType)

	activity := models.Activity{
		UserID:                  user.ID,
		ConfluencePageID:        page.ID,
		ConfluenceVersionNumber: page.Version.Number,
		ActivityType:            activityType,
		PointsAwarded:           pointsAwarded,
	}

	if _, err := repos.ActivityRepo.CreateActivity(&activity); err == nil {
		err := repos.UserRepo.UpdateUserPoints(user.ID, pointsAwarded)
		if err != nil {
			return 0
		}
		newActivities++
	}

	return newActivities
}

// hanterar “COMMENT_CREATED” och “RESOLVED_COMMENT" activities
func syncCommentActivities(client *Client, repos Repositories, page Content, userCache map[string]UserResponse) int {
	var newActivities int

	if page.Children.Comment == nil {
		return 0
	}

	for _, comment := range page.Children.Comment.Results {
		if comment.Type != "comment" || comment.Version.By.AccountID == "" {
			continue
		}

		fullComment, err := client.GetCommentDetails(comment.ID)
		if err != nil {
			if strings.Contains(err.Error(), "404") {
				// Kommentaren är troligen borttagen — hoppa tyst över
				continue
			}
			// Något annat gick fel — logga men krascha inte
			log.Printf("Varning: Kunde inte hämta detaljer för kommentar %s: %v", comment.ID, err)
			continue
		}

		activityType := ""
		points := 0
		version := fullComment.Version.Number
		var ownerID, ownerName string

		isResolved := fullComment.Extensions != nil &&
			fullComment.Extensions.Resolution != nil &&
			fullComment.Extensions.Resolution.Status == "resolved"

		if isResolved {
			resHistory, err := client.GetCommentResolutionHistory(fullComment.ID)
			if err != nil || !resHistory.Found {
				continue
			}
			ownerID = resHistory.AccountID
			userDetails := getCachedUserDetails(client, ownerID, userCache)
			if userDetails == nil {
				continue
			}
			ownerName = userDetails.DisplayName
			activityType = "RESOLVED_COMMENT"
			points = PointsForResolvedComment()
			version += 100000
		} else if fullComment.Version.Number == 1 {
			ownerID = fullComment.Version.By.AccountID
			userDetails := getCachedUserDetails(client, ownerID, userCache)
			if userDetails == nil {
				continue
			}
			ownerName = userDetails.DisplayName
			activityType = "COMMENT_CREATED"
			points = PointsForCommentCreated()
		} else {
			continue
		}

		exists, err := repos.ActivityRepo.ActivityExists(fullComment.ID, version)
		if err != nil || exists {
			continue
		}

		user, err := findOrCreateUser(ownerID, ownerName, repos.UserRepo)
		if err != nil {
			continue
		}
		log.Printf("Sida: %s av %s (%s), Gav poäng:%d", page.Title, user.DisplayName, activityType, points)

		activity := models.Activity{
			UserID:                  user.ID,
			ConfluencePageID:        fullComment.ID,
			ConfluenceVersionNumber: version,
			ActivityType:            activityType,
			PointsAwarded:           points,
		}

		if _, err := repos.ActivityRepo.CreateActivity(&activity); err == nil {
			err := repos.UserRepo.UpdateUserPoints(user.ID, points)
			if err != nil {
				return 0
			}
			newActivities++
		}
	}

	return newActivities
}

// Hjälpfunktion för caching
func getCachedUserDetails(client *Client, accountID string, cache map[string]UserResponse) *UserResponse {
	if details, found := cache[accountID]; found {
		return &details
	}

	details, err := client.GetUserDetails(accountID)
	if err != nil || details == nil {
		log.Printf("FEL vid hämtning av användardetaljer för ID %s: %v", accountID, err)
		return nil
	}

	cache[accountID] = *details
	return details
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
