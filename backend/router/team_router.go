package router

import (
	"gamification-api/backend/handlers"
	"net/http"
)

func RegisterTeamRoutes(mux *http.ServeMux, h *handlers.TeamHandler) {
	// /api/v1/teams hanterar GET (alla) och POST (skapa nytt team)
	mux.HandleFunc("/api/v1/teams", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetAllTeamsHandler(w, r)
		case http.MethodPost:
			h.CreateTeamHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// /api/v1/teams/{id} hanterar GET (specifik), PUT (uppdatera) och DELETE (ta bort)
	mux.HandleFunc("/api/v1/teams/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetTeamByIDHandler(w, r)
		case http.MethodPut:
			h.UpdateTeamHandler(w, r)
		case http.MethodDelete:
			h.DeleteTeamHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
