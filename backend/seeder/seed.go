package main

import (
	"fmt"
	"gamification-api/backend/database"
	"log"
	"math/rand"
	"time"
)

func main() {
	// Anslut till databasen, precis som i main.go
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}
	defer db.Close()

	fmt.Println("Ansluten till databasen. Börjar seeda...")

	// Rensa befintliga användare och återställ ID-räknaren för att säkerställa konsekventa ID:n
	_, err = db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	if err != nil {
		log.Fatalf("Kunde inte rensa users-tabellen: %v", err)
	}
	fmt.Println("Gamla användare borttagna.")

	// Lista med Marvel-hjältar
	marvelUsers := []struct {
		DisplayName        string
		ConfluenceAuthorID string
		AvatarURL          string
		IsAdmin            bool
	}{
		{"Tony Stark", "iron-man", "https://i.pravatar.cc/150?u=iron-man", true},
		{"Steve Rogers", "captain-america", "https://i.pravatar.cc/150?u=captain-america", false},
		{"Natasha Romanoff", "black-widow", "https://i.pravatar.cc/150?u=black-widow", false},
		{"Thor Odinson", "thor", "https://i.pravatar.cc/150?u=thor", false},
		{"Bruce Banner", "hulk", "https://i.pravatar.cc/150?u=hulk", false},
		{"Clint Barton", "hawkeye", "https://i.pravatar.cc/150?u=hawkeye", false},
		{"Peter Parker", "spider-man", "https://i.pravatar.cc/150?u=spider-man", false},
		{"Wanda Maximoff", "scarlet-witch", "https://i.pravatar.cc/150?u=scarlet-witch", false},
		{"Stephen Strange", "dr-strange", "https://i.pravatar.cc/150?u=dr-strange", false},
		{"T'Challa", "black-panther", "https://i.pravatar.cc/150?u=black-panther", false},
		{"Carol Danvers", "captain-marvel", "https://i.pravatar.cc/150?u=captain-marvel", false},
		{"Scott Lang", "ant-man", "https://i.pravatar.cc/150?u=ant-man", false},
	}

	// Förbered SQL-frågan för att infoga användare
	stmt, err := db.Prepare(`
		INSERT INTO users (display_name, confluence_author_id, avatar_url, total_points, is_admin)
		VALUES ($1, $2, $3, $4, $5)
	`)
	if err != nil {
		log.Fatalf("Kunde inte förbereda SQL-statement: %v", err)
	}
	defer stmt.Close()

	// Loopa igenom och infoga varje hjälte
	for _, user := range marvelUsers {
		// Generera slumpmässiga poäng för variation
		points := rand.Intn(5000) + 500 // Poäng mellan 500 och 5499

		_, err := stmt.Exec(user.DisplayName, user.ConfluenceAuthorID, user.AvatarURL, points, user.IsAdmin)
		if err != nil {
			log.Printf("Kunde inte infoga användare %s: %v\n", user.DisplayName, err)
		} else {
			fmt.Printf("Lade till: %s med %d poäng.\n", user.DisplayName, points)
		}
	}

	fmt.Println("\nSeeding är klar!")
}

// Initiera random-generatorn
func init() {
	rand.Seed(time.Now().UnixNano())
}
