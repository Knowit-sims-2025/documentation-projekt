package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

// RegisterLeaderboardRoutes registrerar alla endpoints för leaderboard.
func RegisterLeaderboardRoutes(r *mux.Router, h *handlers.LeaderboardHandler) {
	s := r.PathPrefix("/leaderboard").Subrouter()

	// GET /api/v1/leaderboard?date=YYYY-MM-DD
	s.HandleFunc("", h.GetLeaderboardByDate).Methods("GET")
}
