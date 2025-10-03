package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

// GET /api/v1/userTeams
func (h *UserTeamHandler) GetAllUserTeamsHandler(w http.ResponseWriter, r *http.Request) {
	userTeams, err := h.Repo.GetAllUserTeams()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userTeams)
}

// GET /api/v1/userTeams/{teamId}
func (h *UserTeamHandler) GetUsersByTeamHandler(w http.ResponseWriter, r *http.Request) {
	// Ta bort prefixen
	rest := strings.TrimPrefix(r.URL.Path, "/api/v1/userTeams/")
	// Om det finns ett extra "/" i slutet (t.ex. /api/v1/userTeams/1/2) -> fel
	if rest == "" || strings.Contains(rest, "/") {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	teamID, err := strconv.ParseInt(rest, 10, 64)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	users, err := h.Repo.GetUsersByTeamID(teamID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// POST /api/v1/userTeams  json body används
func (h *UserTeamHandler) AddUserToTeamHandler(w http.ResponseWriter, r *http.Request) {
	// Kontrollera att metoden är POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Läs JSON-body
	var input struct {
		UserID int64 `json:"user_id"`
		TeamID int64 `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// Validera värden
	if input.UserID <= 0 || input.TeamID <= 0 {
		http.Error(w, "user_id and team_id must be positive integers", http.StatusBadRequest)
		return
	}

	// Lägg till user i team via repository
	if err := h.Repo.AddUserToTeam(input.UserID, input.TeamID); err != nil {
		http.Error(w, "Failed to add user to team", http.StatusInternalServerError)
		return
	}

	// Returnera 201 Created
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(fmt.Sprintf("User %d added to Team %d", input.UserID, input.TeamID)))
}

// DELETE /api/v1/userTeams/{userId}/{teamId}
func (h *UserTeamHandler) RemoveUserFromTeamHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/userTeams/user/"), "/")
	if len(parts) != 2 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	userID, err1 := strconv.ParseInt(parts[0], 10, 64)
	teamID, err2 := strconv.ParseInt(parts[1], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid IDs", http.StatusBadRequest)
		return
	}

	if err := h.Repo.RemoveUserFromTeam(userID, teamID); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
