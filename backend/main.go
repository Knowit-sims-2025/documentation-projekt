package main

import (
	"fmt"
	"gamification-api/backend/auth" // Importera auth-paketet
	"gamification-api/backend/config"
	"gamification-api/backend/database"
	"gamification-api/backend/integrations/confluence"
	"gamification-api/backend/router"
	"log"
	"net/http"
	"time"
)

func main() {
	// Ladda konfiguration
	cfg := config.LoadConfig()

	auth.InitJWT(cfg.JWTSecret)
	// ------------------------------------

	// Anslut till databasen
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}

	// Skapa repositories
	userRepo := &database.UserRepository{DB: db}
	activityRepo := &database.ActivityRepository{DB: db} // Korrigerat från UserRepository

	// Skapa och starta Confluence-tjänsten
	confluenceClient := confluence.NewClient(cfg.ConfluenceBaseURL, cfg.ConfluenceEmail, cfg.ConfluenceAPIToken)
	confluenceService := confluence.NewService(confluenceClient, userRepo, activityRepo)
	confluenceService.Start(5 * time.Minute) // Rimligt intervall för normal drift

	// Hämta och starta routern
	r := router.InitializeAndGetRouter()

	// Starta webbservern
	port := "8081"
	fmt.Printf("Startar API-server på http://localhost:%s\n", port)
	err = http.ListenAndServe(":"+port, r)
	if err != nil {
		log.Fatalf("FATAL: Servern kunde inte starta: %v", err)
	}
}
