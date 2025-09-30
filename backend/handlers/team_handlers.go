package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
)

type TeamHandler struct {
	Repo *database.TeamRepository
}

type UserTeamHandler struct {
	Repo *database.UserTeamRepository
}

// GetAllTeamsHandler hanterar förfrågningar till /api/v1/teams
func (h *TeamHandler) GetAllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	teams, err := h.Repo.GetAllTeams()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// GetAllUserTeamsHandler hanterar förfrågningar till /api/v1/user-teams
func (h *UserTeamHandler) GetAllUserTeamsHandler(w http.ResponseWriter, r *http.Request) {
	userTeams, err := h.Repo.GetAllUserTeams()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userTeams)
}
