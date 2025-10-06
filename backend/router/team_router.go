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

func RegisterUserTeamRoutes(mux *http.ServeMux, h *handlers.UserTeamHandler) {
	// GET /api/v1/userTeams → alla relationer
	mux.HandleFunc("/api/v1/userTeams", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/userTeams" {
			http.NotFound(w, r)
			return
		}

		switch r.Method {
		case http.MethodGet:
			h.GetAllUserTeamsHandler(w, r)
		case http.MethodPost:
			h.AddUserToTeamHandler(w, r) // läser JSON-body
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// GET /api/v1/userTeams/{teamId} → alla users i ett team
	mux.HandleFunc("/api/v1/userTeams/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			h.GetUsersByTeamHandler(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// DELETE /api/v1/userTeams/user/{userId}/{teamId}
	mux.HandleFunc("/api/v1/userTeams/user/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			h.RemoveUserFromTeamHandler(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
