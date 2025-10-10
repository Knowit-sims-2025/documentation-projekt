package main

import (
	"fmt"
	"gamification-api/backend/config"
	"gamification-api/backend/database"
	"gamification-api/backend/integrations/confluence"
	"gamification-api/backend/router"
	"log"
	"net/http"
	"time"
)

func main() {
	// Ladda konfiguration från miljövariabler eller .env-fil
	cfg := config.LoadConfig()

	// Anslut till databasen
	db, err := database.ConnectDB() // Anta att denna funktion nu tar cfg för anslutningsinfo, eller så är den hårdkodad.
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}

	// Skapa repositories
	userRepo := &database.UserRepository{DB: db}
	activityRepo := &database.ActivityRepository{DB: db}

	// Skapa en Confluence API-klient
	confluenceClient := confluence.NewClient(cfg.ConfluenceBaseURL, cfg.ConfluenceEmail, cfg.ConfluenceAPIToken)

	//Skapa den nya tjänsten med klienten och våra repositories
	confluenceService := confluence.NewService(confluenceClient, userRepo, activityRepo)

	//Starta den automatiska synkroniseringen. Kör var 5:e sekund
	confluenceService.Start(5 * time.Second)
	// -----------------------------------------

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

