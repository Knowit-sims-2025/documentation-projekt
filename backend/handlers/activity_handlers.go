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
	ActivityRepo  *database.ActivityRepository
	UserBadgeRepo *database.UserBadgeRepository
}

// GetAllActivitiesHandler
func (h *ActivityHandler) GetAllActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	activities, err := h.ActivityRepo.GetAllActivities()
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

	activity, err := h.ActivityRepo.GetActivityByID(id)
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

	id, err := h.ActivityRepo.CreateActivity(activity)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	activity.ID = id

	// After creating an activity, check and award badges for the user
	if err := h.UserBadgeRepo.CheckAndAwardBadges(activity.UserID); err != nil {
		// Log the error but don't return an HTTP error, as the activity was successfully created.
		// Badge awarding can be a background process or less critical than activity creation.
		// Depending on requirements, this could be made more robust (e.g., retry mechanism).
		http.Error(w, "Activity created, but failed to check/award badges: "+err.Error(), http.StatusInternalServerError)
		return
	}

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

	if err := h.ActivityRepo.UpdateActivity(activity); err != nil {
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

	if err := h.ActivityRepo.DeleteActivity(id); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
