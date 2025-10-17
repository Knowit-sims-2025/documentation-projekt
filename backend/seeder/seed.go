package main

import (
	"fmt"
	"gamification-api/backend/database"
	"log"
	"math/rand"
	"time"
)

func main() {
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}
	defer db.Close()

	fmt.Println("✅ Ansluten till databasen. Börjar seeda...")

	// Rensa befintliga data
	_, err = db.Exec("TRUNCATE TABLE user_badges, badges, user_teams, users, teams RESTART IDENTITY CASCADE")
	if err != nil {
		log.Fatalf("Kunde inte rensa tabeller: %v", err)
	}
	fmt.Println("🧹 Gamla data borttagna.")

	// --- STEG 1: Skapa team ---
	teamDefinitions := map[string][]string{
		"Avengers":              {"Tony Stark", "Steve Rogers", "Natasha Romanoff", "Thor Odinson", "Bruce Banner", "Clint Barton", "Peter Parker", "Wanda Maximoff", "Stephen Strange", "T'Challa", "Carol Danvers", "Scott Lang"},
		"Justice League":        {"Bruce Wayne", "Clark Kent", "Diana Prince", "Barry Allen", "Arthur Curry", "Victor Stone", "Hal Jordan"},
		"Pioneers of Computing": {"Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds", "Guido van Rossum", "Dennis Ritchie", "Margaret Hamilton", "James Gosling"},
		"Rogues Gallery":        {"Selina Kyle", "Harleen Quinzel", "Lex Luthor", "Slade Wilson"},
	}
	teamIDs := make(map[string]int)

	fmt.Println("\n🏗️ Skapar team...")
	for teamName := range teamDefinitions {
		var teamID int
		err := db.QueryRow("INSERT INTO teams (name) VALUES ($1) RETURNING id", teamName).Scan(&teamID)
		if err != nil {
			log.Fatalf("Kunde inte infoga team %s: %v", teamName, err)
		}
		teamIDs[teamName] = teamID
		fmt.Printf("  → Lade till team: %s (ID: %d)\n", teamName, teamID)
	}

	// --- STEG 2: Skapa användare ---
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
		{"Bruce Wayne", "batman", "https://i.pravatar.cc/150?u=batman", false},
		{"Clark Kent", "superman", "https://i.pravatar.cc/150?u=superman", false},
		{"Diana Prince", "wonder-woman", "https://i.pravatar.cc/150?u=wonder-woman", false},
		{"Barry Allen", "flash", "https://i.pravatar.cc/150?u=flash", false},
		{"Arthur Curry", "aquaman", "https://i.pravatar.cc/150?u=aquaman", false},
		{"Victor Stone", "cyborg", "https://i.pravatar.cc/150?u=cyborg", false},
		{"Selina Kyle", "catwoman", "https://i.pravatar.cc/150?u=catwoman", false},
		{"Harleen Quinzel", "harley-quinn", "https://i.pravatar.cc/150?u=harley-quinn", false},
		{"Lex Luthor", "lex-luthor", "https://i.pravatar.cc/150?u=lex-luthor", false},
		{"Slade Wilson", "deathstroke", "https://i.pravatar.cc/150?u=deathstroke", false},
		{"Oliver Queen", "green-arrow", "https://i.pravatar.cc/150?u=green-arrow", false},
		{"Hal Jordan", "green-lantern", "https://i.pravatar.cc/150?u=green-lantern", false},
		{"Ada Lovelace", "ada-lovelace", "https://i.pravatar.cc/150?u=ada-lovelace", false},
		{"Alan Turing", "alan-turing", "https://i.pravatar.cc/150?u=alan-turing", false},
		{"Grace Hopper", "grace-hopper", "https://i.pravatar.cc/150?u=grace-hopper", false},
		{"Linus Torvalds", "linus-torvalds", "https://i.pravatar.cc/150?u=linus-torvalds", false},
		{"Guido van Rossum", "guido", "https://i.pravatar.cc/150?u=guido", false},
		{"Dennis Ritchie", "dennis-ritchie", "https://i.pravatar.cc/150?u=dennis-ritchie", false},
		{"Margaret Hamilton", "margaret-hamilton", "https://i.pravatar.cc/150?u=margaret-hamilton", false},
		{"James Gosling", "james-gosling", "https://i.pravatar.cc/150?u=james-gosling", false},
	}

	userIDs := make(map[string]int)
	fmt.Println("\n👤 Skapar användare...")

	stmt, err := db.Prepare(`
		INSERT INTO users (display_name, confluence_author_id, avatar_url, total_points, is_admin)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`)
	if err != nil {
		log.Fatalf("Kunde inte förbereda SQL-statement: %v", err)
	}
	defer stmt.Close()

	for _, user := range marvelUsers {
		points := rand.Intn(5000) + 500
		var userID int
		err := stmt.QueryRow(user.DisplayName, user.ConfluenceAuthorID, user.AvatarURL, points, user.IsAdmin).Scan(&userID)
		if err != nil {
			log.Printf("❌ Kunde inte infoga användare %s: %v\n", user.DisplayName, err)
			continue
		}
		userIDs[user.DisplayName] = userID
		fmt.Printf("  → %s (ID: %d, %d poäng)\n", user.DisplayName, userID, points)
	}

	// --- STEG 3: Koppla användare till team ---
	fmt.Println("\n🔗 Kopplar användare till team...")
	userTeamStmt, err := db.Prepare("INSERT INTO user_teams (user_id, team_id) VALUES ($1, $2)")
	if err != nil {
		log.Fatalf("Kunde inte förbereda user_teams statement: %v", err)
	}
	defer userTeamStmt.Close()

	for teamName, members := range teamDefinitions {
		teamID := teamIDs[teamName]
		for _, memberName := range members {
			userID, ok := userIDs[memberName]
			if !ok {
				log.Printf("⚠️  Användaren '%s' hittades inte för team '%s'", memberName, teamName)
				continue
			}
			_, err := userTeamStmt.Exec(userID, teamID)
			if err != nil {
				log.Printf("❌ Kunde inte koppla användare %d till team %d: %v", userID, teamID, err)
			}
		}
	}

	// --- STEG 4: Skapa badges ---
	fmt.Println("\n🏅 Skapar badges...")
	badgeData := []struct {
		Name, Description, IconURL string
		CriteriaValue              int
	}{
		{"Beginner documenter", "Awarded for creating your very first document.", "documents0", 1},
		{"Novice documenter", "Awarded for creating your 10th document.", "documents1", 10},
		{"Intermidiate documenter", "Awarded for creating your 50th document.", "documents2", 50},
		{"Proffesional documenter", "Awarded for creating your 100th document.", "documents3", 100},
		{"Beginner commenter", "Awarded for making your very first comment.", "comments0", 1},
		{"Novice commenter", "Awarded for making your 10th comment.", "comments1", 10},
		{"Intermidiate commenter", "Awarded for mmaking your 50th comment.", "comments2", 50},
		{"Proffesional commenter", "Awarded for making your 100th comment.", "comments3", 100},
		{"Beginner editor", "Awarded for making your very first edit.", "edits0", 1},
		{"Novice editor", "Awarded for making your 10th edit.", "edits1", 10},
		{"Intermidiate editor", "Awarded for making your 50th edit.", "edits2", 50},
		{"Proffesional editor", "Awarded for making your 100th edit.", "edits3", 100},
	}

	badges := make(map[int]int) // Map to store badgeID -> criteriaValue
	for _, b := range badgeData {
		var badgeID int
		err := db.QueryRow(`
			INSERT INTO badges (name, description, icon_url, criteria_value)
			VALUES ($1, $2, $3, $4) RETURNING id
		`, b.Name, b.Description, b.IconURL, b.CriteriaValue).Scan(&badgeID)
		if err != nil {
			log.Fatalf("❌ Kunde inte infoga badge %s: %v", b.Name, err)
		}
		badges[badgeID] = b.CriteriaValue
		fmt.Printf("  → Badge: %s (ID: %d)\n", b.Name, badgeID)
	}

	// --- STEG 5: Tilldela badges slumpmässigt till användare ---
	fmt.Println("\n🎯 Tilldelar badges till användare...")
	userBadgeStmt, err := db.Prepare(`
		INSERT INTO user_badges (user_id, badge_id, awarded_at, progress)
		VALUES ($1, $2, $3, $4)
	`)
	if err != nil {
		log.Fatalf("Kunde inte förbereda user_badges statement: %v", err)
	}
	defer userBadgeStmt.Close()

	// Loop through every user
	for _, userID := range userIDs {
		// Loop through every badge to assign it to the user
		for badgeID, criteria := range badges {
			awardedAt := time.Now().AddDate(0, 0, -rand.Intn(90)) // senaste 90 dagar
			// Generate random progress. Let's make it possible to exceed the criteria.
			progress := rand.Intn(criteria + criteria/2)
			_, err := userBadgeStmt.Exec(userID, badgeID, awardedAt, progress)
			if err != nil {
				log.Printf("⚠️ Kunde inte tilldela badge %d till user %d: %v", badgeID, userID, err) // This shouldn't happen with the new logic
			}
		}
	}

	fmt.Println("\n✅ Seeding komplett!")
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
