package main

import (
	"fmt"
	"gamification-api/backend/database"
	"gamification-api/backend/handlers"
	"log"
	"net/http"
)

func main() {
	// Steg 1: Anslut till databasen
	// Denna funktion kommer från er database/database.go fil (som ni skapar härnäst)
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}
	defer db.Close()

	// Steg 2: Skapa en instans av er UserRepository/BadgeRepository
	// Denna struct kommer från er database/user_repository.go fil
	userRepo := &database.UserRepository{DB: db}
	badgeRepo := &database.BadgeRepository{DB: db}

	// Steg 3: Skapa en instans av er UserHandler/BadgeHandler
	// Denna struct kommer från er handlers/user_handlers.go fil
	userHandler := &handlers.UserHandler{Repo: userRepo}
	badgeHandler := &handlers.BadgeHandler{Repo: badgeRepo}

	// Steg 4: Sätt upp en router och koppla er handler till en URL
	// Detta är "hovmästaren" som dirigerar trafik
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/users", userHandler.GetAllUsersHandler)
	mux.HandleFunc("/api/v1/badges", badgeHandler.GetAllBadgesHandler)

	// Steg 5: Starta webbservern
	port := "8081" // Använder 8081 för att inte krocka med Adminer på 8080
	fmt.Printf("Startar API-server på http://localhost:%s\n", port)
	err = http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Fatalf("FATAL: Servern kunde inte starta: %v", err)
	}
}
