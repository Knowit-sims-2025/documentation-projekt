package handlers

import (
	"database/sql"
	"encoding/json"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type ActivityHandler struct {
	Repo *database.ActivityRepository
}

// GetAllActivitiesHandler
func (h *ActivityHandler) GetAllActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	activities, err := h.Repo.GetAllActivities()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activities)
}

// GetActivityByIDHandler
func (h *ActivityHandler) GetActivityByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid activity ID", http.StatusBadRequest)
		return
	}

	activity, err := h.Repo.GetActivityByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Activity not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activity)
}

// CreateActivityHandler
func (h *ActivityHandler) CreateActivityHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		UserID                  int64  `json:"userId"`
		ConfluencePageID        string `json:"confluencePageId"`
		ConfluenceVersionNumber int    `json:"confluenceVersionNumber"`
		ActivityType            string `json:"activityType"`
		PointsAwarded           int    `json:"pointsAwarded"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	activity := &models.Activity{
		UserID:                  requestBody.UserID,
		ConfluencePageID:        requestBody.ConfluencePageID,
		ConfluenceVersionNumber: requestBody.ConfluenceVersionNumber,
		ActivityType:            requestBody.ActivityType,
		PointsAwarded:           requestBody.PointsAwarded,
		CreatedAt:               time.Now().UTC(),
	}

	id, err := h.Repo.CreateActivity(activity)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	activity.ID = id

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(activity)
}

// UpdateActivityHandler
func (h *ActivityHandler) UpdateActivityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid activity ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		UserID                  int64  `json:"userId"`
		ConfluencePageID        string `json:"confluencePageId"`
		ConfluenceVersionNumber int    `json:"confluenceVersionNumber"`
		ActivityType            string `json:"activityType"`
		PointsAwarded           int    `json:"pointsAwarded"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	activity := &models.Activity{
		ID:                      id,
		UserID:                  requestBody.UserID,
		ConfluencePageID:        requestBody.ConfluencePageID,
		ConfluenceVersionNumber: requestBody.ConfluenceVersionNumber,
		ActivityType:            requestBody.ActivityType,
		PointsAwarded:           requestBody.PointsAwarded,
	}

	if err := h.Repo.UpdateActivity(activity); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteActivityHandler
func (h *ActivityHandler) DeleteActivityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid activity ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.DeleteActivity(id); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
