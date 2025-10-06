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

type BadgeHandler struct {
	Repo *database.BadgeRepository
}

type UserBadgeHandler struct {
	Repo *database.UserBadgeRepository
}

// GetAllUsersHandler hanterar förfrågningar till /api/v1/users
func (h *BadgeHandler) GetAllBadgesHandler(w http.ResponseWriter, r *http.Request) {
	// Anropa funktionen ni precis skapade i er repository.
	badges, err := h.Repo.GetAllBadges()
	if err != nil {
		// Om något går fel med databasen, skicka ett serverfel.
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sätt en header för att tala om för webbläsaren att vi skickar JSON.
	w.Header().Set("Content-Type", "application/json")

	// Omvandla er lista av användare till JSON och skicka den.
	json.NewEncoder(w).Encode(badges)
}

// GET /api/v1/badges/{id}
func (h *BadgeHandler) GetBadgeByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/badges/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	badge, err := h.Repo.GetBadgeByID(id)
	if err != nil {
		http.Error(w, "Badge not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badge)
}

// POST /api/v1/badges
func (h *BadgeHandler) CreateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Name          string `json:"name"`
		Description   string `json:"description"`
		IconUrl       string `json:"iconUrl"`
		CriteriaValue int    `json:"criteriaValue"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	badge := &models.Badge{
		Name:          requestBody.Name,
		Description:   sql.NullString{String: requestBody.Description, Valid: requestBody.Description != ""},
		IconUrl:       sql.NullString{String: requestBody.IconUrl, Valid: requestBody.IconUrl != ""},
		CriteriaValue: requestBody.CriteriaValue,
	}

	newID, err := h.Repo.CreateBadge(badge)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	createdBadge, err := h.Repo.GetBadgeByID(newID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdBadge)
}

// PUT /api/v1/badges/{id}
func (h *BadgeHandler) UpdateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/badges/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Name          string `json:"name"`
		Description   string `json:"description"`
		IconUrl       string `json:"iconUrl"`
		CriteriaValue int    `json:"criteriaValue"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	badge := &models.Badge{
		ID:            id,
		Name:          requestBody.Name,
		Description:   sql.NullString{String: requestBody.Description, Valid: requestBody.Description != ""},
		IconUrl:       sql.NullString{String: requestBody.IconUrl, Valid: requestBody.IconUrl != ""}, //
		CriteriaValue: requestBody.CriteriaValue,
	}

	if err := h.Repo.UpdateBadge(badge); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DELETE /api/v1/badges/{id}
func (h *BadgeHandler) DeleteBadgeHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/badges/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.DeleteBadge(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetAllUserBadgesHandler hanterar förfrågningar till /api/v1/userbadges
func (h *UserBadgeHandler) GetAllUserBadgesHandler(w http.ResponseWriter, r *http.Request) {
	// Anropa funktionen i repository
	userBadges, err := h.Repo.GetAllUserBadges()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sätt header för JSON
	w.Header().Set("Content-Type", "application/json")

	// Skicka tillbaka resultatet som JSON
	json.NewEncoder(w).Encode(userBadges)
}

// CreatUserBadgeHandler
func (h *UserBadgeHandler) CreateUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		UserID    int64      `json:"userId"`
		BadgeID   int64      `json:"badgeId"`
		AwardedAt *time.Time `json:"awardedAt,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	awardedAt := time.Now().UTC()
	if requestBody.AwardedAt != nil {
		awardedAt = *requestBody.AwardedAt
	}

	userBadge := &models.UserBadge{
		UserID:    requestBody.UserID,
		BadgeID:   requestBody.BadgeID,
		AwardedAt: awardedAt,
	}

	if err := h.Repo.AwardBadge(userBadge); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(userBadge)
}

// GET /api/v1/userBadges/{userId}/{badgeId}
func (h *UserBadgeHandler) GetUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/userBadges/"), "/")
	if len(parts) != 2 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	userID, err1 := strconv.ParseInt(parts[0], 10, 64)
	badgeID, err2 := strconv.ParseInt(parts[1], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid IDs", http.StatusBadRequest)
		return
	}

	ub, err := h.Repo.GetUserBadge(userID, badgeID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if ub == nil {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ub)
}

// PUT /api/v1/userBadges/{userId}/{badgeId}
func (h *UserBadgeHandler) UpdateUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/userBadges/"), "/")
	if len(parts) != 2 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	userID, err1 := strconv.ParseInt(parts[0], 10, 64)
	badgeID, err2 := strconv.ParseInt(parts[1], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid IDs", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		AwardedAt *time.Time `json:"awardedAt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	newTime := time.Now().UTC()
	if requestBody.AwardedAt != nil {
		newTime = *requestBody.AwardedAt
	}

	if err := h.Repo.UpdateAwardedAt(userID, badgeID, newTime); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// DELETE /api/v1/userBadges/{userId}/{badgeId}
func (h *UserBadgeHandler) DeleteUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/v1/userBadges/"), "/")
	if len(parts) != 2 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	userID, err1 := strconv.ParseInt(parts[0], 10, 64)
	badgeID, err2 := strconv.ParseInt(parts[1], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid IDs", http.StatusBadRequest)
		return
	}

	if err := h.Repo.RemoveBadge(userID, badgeID); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
