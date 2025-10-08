package router 

import (
	"gamification-api/backend/handlers" // Byt ut mot ert modulnamn
	"github.com/gorilla/mux"
)

// RegisterCompetitionRoutes registrerar alla vägar som har med tävlingar att göra.
func RegisterCompetitionRoutes(r *mux.Router, h *handlers.CompetitionHandler) {
	// Skapa en subrouter för att undvika att skriva /api/v1 hela tiden
	s := r.PathPrefix("/api/v1/competitions").Subrouter()

	// GET /api/v1/competitions - Hämtar alla tävlingar
	// POST /api/v1/competitions - Skapar en ny tävling
	s.HandleFunc("", h.GetAllCompetitionsHandler).Methods("GET")
	s.HandleFunc("", h.CreateCompetitionHandler).Methods("POST")

	// GET /api/v1/competitions/{id} - Hämtar en specifik tävling
	s.HandleFunc("/{id:[0-9]+}", h.GetCompetitionByIDHandler).Methods("GET")

	// GET /api/v1/competitions/{id}/leaderboard - Hämtar leaderboard för en tävling
	// s.HandleFunc("/{id:[0-9]+}/leaderboard", h.GetCompetitionLeaderboardHandler).Methods("GET")

	// PUT /api/v1/competitions/{id} - Uppdaterar en tävling
	// s.HandleFunc("/{id:[0-9]+}", h.UpdateCompetitionHandler).Methods("PUT")

	// DELETE /api/v1/competitions/{id} - Tar bort en tävling
	s.HandleFunc("/{id:[0-9]+}", h.DeleteCompetitionHandler).Methods("DELETE")
}

