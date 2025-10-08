package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

// RegisterTeamRoutes registrerar alla routes som har med team att göra.
func RegisterTeamRoutes(r *mux.Router, h *handlers.TeamHandler) {
	s := r.PathPrefix("/teams").Subrouter()
	s.HandleFunc("", h.GetAllTeamsHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.GetTeamByIDHandler).Methods("GET")
	s.HandleFunc("", h.CreateTeamHandler).Methods("POST")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateTeamHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteTeamHandler).Methods("DELETE")
}

// RegisterUserTeamRoutes registrerar alla routes som har med user-team-kopplingar att göra.
func RegisterUserTeamRoutes(r *mux.Router, h *handlers.UserTeamHandler) {
	s := r.PathPrefix("/user-teams").Subrouter()
	// Denna route behövs för att hämta alla medlemskap
	s.HandleFunc("", h.GetAllUserTeamsHandler).Methods("GET")
	s.HandleFunc("/team/{teamId:[0-9]+}/users", h.GetUsersByTeamHandler).Methods("GET")
}
