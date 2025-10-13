package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterTeamRoutes(r *mux.Router, h *handlers.TeamHandler) {
	s := r.PathPrefix("/teams").Subrouter()
	s.HandleFunc("", h.GetAllTeamsHandler).Methods("GET")
	s.HandleFunc("", h.CreateTeamHandler).Methods("POST")

	s.HandleFunc("/{id:[0-9]+}", h.GetTeamByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateTeamHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteTeamHandler).Methods("DELETE")

	s.HandleFunc("/{id:[0-9]+}/points", h.GetTeamPointsHandler).Methods("GET")
}

func RegisterUserTeamRoutes(r *mux.Router, h *handlers.UserTeamHandler) {
	s := r.PathPrefix("/userteams").Subrouter()

	s.HandleFunc("", h.GetAllUserTeamsHandler).Methods("GET")
	s.HandleFunc("", h.AddUserToTeamHandler).Methods("POST") // Läser JSON body

	// GET /api/v1/userteams/team/{teamId} -> alla users i ett team
	s.HandleFunc("/team/{teamId:[0-9]+}", h.GetUsersByTeamHandler).Methods("GET")

	// DELETE /api/v1/userteams/user/{userId}/team/{teamId}
	s.HandleFunc("/user/{userId:[0-9]+}/team/{teamId:[0-9]+}", h.RemoveUserFromTeamHandler).Methods("DELETE")
}
