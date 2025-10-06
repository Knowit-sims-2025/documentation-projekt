package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ActivityHandler struct {
	Repo *database.ActivityRepository
}

// GetAllActivitiesHandlers hanterar förfrågningar till /api/v1/activities
func (h *ActivityHandler) GetAllActivitiesHandler(w http.ResponseWriter, r *http.Request) {
	// Anropa funktionen ni precis skapade i er repository.
	activities, err := h.Repo.GetAllActivities()
	if err != nil {
		// Om något går fel med databasen, skicka ett serverfel.
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sätt en header för att tala om för webbläsaren att vi skickar JSON.
	w.Header().Set("Content-Type", "application/json")

	// Omvandla er lista av användare till JSON och skicka den.
	json.NewEncoder(w).Encode(activities)
}

// GET /api/v1/activities/{id}
func (h *ActivityHandler) GetActivityByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/activities/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid activity ID", http.StatusBadRequest)
		return
	}

	activity, err := h.Repo.GetActivityByID(id)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activity)
}

// POST /api/v1/activities
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

// PUT /api/v1/activities/{id}
func (h *ActivityHandler) UpdateActivityHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/activities/")
	id, err := strconv.ParseInt(idStr, 10, 64)
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

// DELETE /api/v1/activities/{id}
func (h *ActivityHandler) DeleteActivityHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/activities/")
	id, err := strconv.ParseInt(idStr, 10, 64)
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

