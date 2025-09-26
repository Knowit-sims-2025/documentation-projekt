package main

import (
	"gamification-api/backend/database"
	"log"
)

func main() {

	// I toppen av main.go

	// I början av main()-funktionen
	db, err := database.ConnectDB()
	if err == nil {
		log.Println("Lyckades ansluta till databasen!")
	}
	if err != nil {
		log.Fatalf("Kunde inte ansluta till databasen: %v", err)
	}
	defer db.Close() // Stäng anslutningen när programmet avslutas
}
