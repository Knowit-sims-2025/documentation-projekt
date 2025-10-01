package main

import (
	"fmt"
	"gamification-api/backend/database" // Byt ut 'gamification-api' mot ert Go-modulnamn
	"gamification-api/backend/handlers" // Byt ut 'gamification-api' mot ert Go-modulnamn
	"gamification-api/backend/router"   // Importera er router
	"log"
	"net/http"
)

func main() {
	// Steg 1: Anslut till databasen
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}
	defer db.Close()

	// Steg 2: Skapa era repositories
	userRepo := &database.UserRepository{DB: db}
	// competitionRepo := &database.CompetitionRepository{DB: db} // (läggs till senare)

	// Steg 3: Skapa era handlers
	userHandler := &handlers.UserHandler{Repo: userRepo}
	// competitionHandler := &handlers.CompetitionHandler{Repo: competitionRepo} // (läggs till senare)

	// Steg 4: Skapa en ny, tom router
	mux := http.NewServeMux()

	// Steg 5: Anropa er registreringsfunktion för att konfigurera routern
	// Detta är nyckeln! main.go behöver inte känna till de specifika URL:erna.
	router.RegisterUserRoutes(mux, userHandler)

	// När ni skapar fler delar, anropar ni bara deras registreringsfunktioner här:
	// router.RegisterCompetitionRoutes(mux, competitionHandler)
	// router.RegisterBadgeRoutes(mux, badgeHandler)

	// Steg 6: Starta webbservern
	port := "8081"
	fmt.Printf("Startar API-server på http://localhost:%s\n", port)
	err = http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Fatalf("FATAL: Servern kunde inte starta: %v", err)
	}
}
