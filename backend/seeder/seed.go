package main

import (
	//"database/sql"
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

	// Rensa tabeller
	_, err = db.Exec(`
		TRUNCATE TABLE user_badges, user_stats, user_teams, users, teams RESTART IDENTITY CASCADE
	`)
	if err != nil {
		log.Fatalf("Kunde inte rensa tabeller: %v", err)
	}
	fmt.Println("🧹 Gamla data borttagna.")

	// --- 1. Skapa Teams ---
	teams := []string{"Engineering", "Marketing", "Design", "QA", "Product"}
	teamIDs := make(map[string]int)

	for _, team := range teams {
		var id int
		err := db.QueryRow("INSERT INTO teams (name) VALUES ($1) RETURNING id", team).Scan(&id)
		if err != nil {
			log.Fatalf("Kunde inte infoga team %s: %v", team, err)
		}
		teamIDs[team] = id
		fmt.Printf("Lade till team: %s (ID: %d)\n", team, id)
	}

	// --- 2. Skapa Users ---
	users := []struct {
	DisplayName        string
	ConfluenceAuthorID string
	AvatarURL          string
	IsAdmin            bool
	Team               string
}{
	// Engineering
	{"Alice Johnson", "alice-johnson", "https://i.pravatar.cc/150?u=alice-johnson", true, "Engineering"},
	{"Bob Smith", "bob-smith", "https://i.pravatar.cc/150?u=bob-smith", false, "Engineering"},
	{"Giulia Bianchi", "giulia-bianchi", "https://i.pravatar.cc/150?u=giulia-bianchi", false, "Engineering"},
	{"Hiro Tanaka", "hiro-tanaka", "https://i.pravatar.cc/150?u=hiro-tanaka", false, "Engineering"},
	{"Olga Ivanova", "olga-ivanova", "https://i.pravatar.cc/150?u=olga-ivanova", false, "Engineering"},
	{"Samuel Kim", "samuel-kim", "https://i.pravatar.cc/150?u=samuel-kim", false, "Engineering"},

	// Marketing
	{"Carlos Ramirez", "carlos-ramirez", "https://i.pravatar.cc/150?u=carlos-ramirez", false, "Marketing"},
	{"Diana Chen", "diana-chen", "https://i.pravatar.cc/150?u=diana-chen", false, "Marketing"},
	{"Fatima Hassan", "fatima-hassan", "https://i.pravatar.cc/150?u=fatima-hassan", false, "Marketing"},
	{"Liam O'Connor", "liam-oconnor", "https://i.pravatar.cc/150?u=liam-oconnor", false, "Marketing"},
	{"Nina Patel", "nina-patel", "https://i.pravatar.cc/150?u=nina-patel", false, "Marketing"},
	{"Youssef El-Sayed", "youssef-el-sayed", "https://i.pravatar.cc/150?u=youssef-el-sayed", false, "Marketing"},

	// Design
	{"Isabel Silva", "isabel-silva", "https://i.pravatar.cc/150?u=isabel-silva", false, "Design"},
	{"Johan Müller", "johan-muller", "https://i.pravatar.cc/150?u=johan-muller", false, "Design"},
	{"Emma Larsson", "emma-larsson", "https://i.pravatar.cc/150?u=emma-larsson", false, "Design"},
	{"Mateo Fernandez", "mateo-fernandez", "https://i.pravatar.cc/150?u=mateo-fernandez", false, "Design"},
	{"Sofia Rossi", "sofia-rossi", "https://i.pravatar.cc/150?u=sofia-rossi", false, "Design"},
	{"Chen Wei", "chen-wei", "https://i.pravatar.cc/150?u=chen-wei", false, "Design"},

	// QA
	{"Emilia Rossi", "emilia-rossi", "https://i.pravatar.cc/150?u=emilia-rossi", false, "QA"},
	{"Jamal Ahmed", "jamal-ahmed", "https://i.pravatar.cc/150?u=jamal-ahmed", false, "QA"},
	{"Lara Schmidt", "lara-schmidt", "https://i.pravatar.cc/150?u=lara-schmidt", false, "QA"},
	{"Omar Ali", "omar-ali", "https://i.pravatar.cc/150?u=omar-ali", false, "QA"},
	{"Paula Green", "paula-green", "https://i.pravatar.cc/150?u=paula-green", false, "QA"},
	{"Victor Gomez", "victor-gomez", "https://i.pravatar.cc/150?u=victor-gomez", false, "QA"},

	// Product
	{"Farid Khan", "farid-khan", "https://i.pravatar.cc/150?u=farid-khan", false, "Product"},
	{"Maya Singh", "maya-singh", "https://i.pravatar.cc/150?u=maya-singh", false, "Product"},
	{"Nikolai Petrov", "nikolai-petrov", "https://i.pravatar.cc/150?u=nikolai-petrov", false, "Product"},
	{"Olivia Reed", "olivia-reed", "https://i.pravatar.cc/150?u=olivia-reed", false, "Product"},
	{"Ravi Desai", "ravi-desai", "https://i.pravatar.cc/150?u=ravi-desai", false, "Product"},
	{"Zara Khan", "zara-khan", "https://i.pravatar.cc/150?u=zara-khan", false, "Product"},
}


	userIDs := make(map[string]int)

	stmt, err := db.Prepare(`
		INSERT INTO users (display_name, confluence_author_id, avatar_url, total_points, is_admin, lifetime_points)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`)
	if err != nil {
		log.Fatalf("Kunde inte förbereda statement för users: %v", err)
	}
	defer stmt.Close()

	rand.Seed(time.Now().UnixNano())
	for _, u := range users {
		totalPoints := rand.Intn(5000) + 500       // 500–5499
		lifetimePoints := totalPoints + rand.Intn(5000)
		var userID int
		err := stmt.QueryRow(u.DisplayName, u.ConfluenceAuthorID, u.AvatarURL, totalPoints, u.IsAdmin, lifetimePoints).Scan(&userID)
		if err != nil {
			log.Printf("Kunde inte infoga user %s: %v", u.DisplayName, err)
			continue
		}
		userIDs[u.DisplayName] = userID

		// Koppla användare till team
		teamID := teamIDs[u.Team]
		_, err = db.Exec("INSERT INTO user_teams (user_id, team_id) VALUES ($1, $2)", userID, teamID)
		if err != nil {
			log.Printf("Kunde inte koppla user %d till team %d: %v", userID, teamID, err)
		}

		// Skapa user_stats med realistiska värden baserat på poäng
		stats := map[string]int{
			"total_comments":        totalPoints / 10,
			"total_created_pages":   totalPoints / 20,
			"total_edits_made":      totalPoints / 15,
			"total_resolved_comments": totalPoints / 12,
		}
		_, err = db.Exec(`
			INSERT INTO user_stats (user_id, total_comments, total_created_pages, total_edits_made, total_resolved_comments)
			VALUES ($1, $2, $3, $4, $5)
		`, userID, stats["total_comments"], stats["total_created_pages"], stats["total_edits_made"], stats["total_resolved_comments"])
		if err != nil {
			log.Printf("Kunde inte skapa stats för user %d: %v", userID, err)
		}

		fmt.Printf("✅ User: %s (ID %d) med %d poäng\n", u.DisplayName, userID, totalPoints)
	}

	// --- 3. Uppdatera user_badges ---
	// Hämta alla badges
	rows, err := db.Query("SELECT id, criteria_type, criteria_value FROM badges")
	if err != nil {
		log.Fatalf("Kunde inte hämta badges: %v", err)
	}
	defer rows.Close()

	type Badge struct {
		ID           int
		CriteriaType string
		CriteriaValue int
	}

	badges := []Badge{}
	for rows.Next() {
		var b Badge
		err := rows.Scan(&b.ID, &b.CriteriaType, &b.CriteriaValue)
		if err != nil {
			log.Fatalf("Fel vid scanning badge: %v", err)
		}
		badges = append(badges, b)
	}

	// Skapa user_badges med progress som matchar user stats
	for _, userID := range userIDs {
		// Hämta total_points för användaren
		var totalPoints int
		err := db.QueryRow("SELECT total_points FROM users WHERE id=$1", userID).Scan(&totalPoints)
		if err != nil {
			log.Printf("Kunde inte hämta total_points för user %d: %v", userID, err)
			continue
		}

		for _, badge := range badges {
			progress := totalPoints * 100 / badge.CriteriaValue
			if progress > 100 {
				progress = 100
			} else if progress < 5 {
				progress = 5
			}
			_, err := db.Exec(`
				INSERT INTO user_badges (user_id, badge_id, progress)
				VALUES ($1, $2, $3)
			`, userID, badge.ID, progress)
			if err != nil {
				log.Printf("Kunde inte skapa user_badge för user %d, badge %d: %v", userID, badge.ID, err)
			}
		}
	}

	fmt.Println("\n🎉 Seeder är klar! Alla användare, stats och badges är uppdaterade.")
}
