package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type TeamHandler struct {
	Repo *database.TeamRepository
}

type UserTeamHandler struct {
	Repo *database.UserTeamRepository
}

// GetAllTeamsHandler
func (h *TeamHandler) GetAllTeamsHandler(w http.ResponseWriter, r *http.Request) {
	teams, err := h.Repo.GetAllTeams()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// GetTeamByIDHandler
func (h *TeamHandler) GetTeamByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
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

// CreateTeamHandler
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

// UpdateTeamHandler
func (h *TeamHandler) UpdateTeamHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
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
}

// DeleteTeamHandler
func (h *TeamHandler) DeleteTeamHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid team ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.DeleteTeam(id); err != nil {
		http.Error(w, "Failed to delete team", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetAllUserTeamsHandler
func (h *UserTeamHandler) GetAllUserTeamsHandler(w http.ResponseWriter, r *http.Request) {
	userTeams, err := h.Repo.GetAllUserTeams()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userTeams)
}

// GetUsersByTeamHandler
func (h *UserTeamHandler) GetUsersByTeamHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamID, err := strconv.ParseInt(vars["teamId"], 10, 64)
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

// AddUserToTeamHandler
func (h *UserTeamHandler) AddUserToTeamHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		UserID int64 `json:"user_id"`
		TeamID int64 `json:"team_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if input.UserID <= 0 || input.TeamID <= 0 {
		http.Error(w, "user_id and team_id must be positive integers", http.StatusBadRequest)
		return
	}

	if err := h.Repo.AddUserToTeam(input.UserID, input.TeamID); err != nil {
		http.Error(w, "Failed to add user to team", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "User %d added to Team %d", input.UserID, input.TeamID)
}

// RemoveUserFromTeamHandler
func (h *UserTeamHandler) RemoveUserFromTeamHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	teamID, err2 := strconv.ParseInt(vars["teamId"], 10, 64)

	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid user or team ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.RemoveUserFromTeam(userID, teamID); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
