package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
)

type LeaderboardHandler struct {
	Repo *database.LeaderBoardRepository
}

func (h *LeaderboardHandler) GetLeaderboardByDate(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	if date == "" {
		http.Error(w, "Query parameter 'date' is required (format: YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	leaderboard, err := h.Repo.GetLeaderboardByDate(date)
	if err != nil {
		http.Error(w, "Failed to fetch leaderboard: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leaderboard)
}
