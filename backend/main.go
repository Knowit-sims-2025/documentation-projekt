package main

import (
	"fmt"
	"gamification-api/backend/router" // Importera endast din router
	"log"
	"net/http"
)

func main() {
	r := router.InitializeAndGetRouter()

	// Starta webbservern
	port := "8081"
	fmt.Printf("Startar API-server på http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, r)
	if err != nil {
		log.Fatalf("FATAL: Servern kunde inte starta: %v", err)
	}
}