package handlers

import (
	"database/sql"
	"encoding/json"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
	"strings"
	"time"
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

// GET /api/v1/teams/{id}
func (h *TeamHandler) GetTeamByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/teams/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	team, err := h.Repo.GetTeamByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Team not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(team)
}

// POST /api/v1/teams
func (h *TeamHandler) CreateTeamHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	team := &models.Team{
		Name:      requestBody.Name,
		CreatedAt: time.Now().UTC(),
	}

	id, err := h.Repo.CreateTeam(team)
	if err != nil {
		http.Error(w, "Failed to create team", http.StatusInternalServerError)
		return
	}

	team.ID = id
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(team)
}

// PUT /api/v1/teams/{id}
func (h *TeamHandler) UpdateTeamHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/teams/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	team := &models.Team{
		ID:   id,
		Name: requestBody.Name,
	}

	if err := h.Repo.UpdateTeam(team); err != nil {
		http.Error(w, "Failed to update team", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(team)
}

// DELETE /api/v1/teams/{id}
func (h *TeamHandler) DeleteTeamHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/teams/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.DeleteTeam(id); err != nil {
		http.Error(w, "Failed to delete team", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
