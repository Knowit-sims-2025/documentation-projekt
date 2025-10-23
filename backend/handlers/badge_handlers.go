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

type BadgeHandler struct {
	Repo *database.BadgeRepository
}

type UserBadgeHandler struct {
	Repo *database.UserBadgeRepository
}

// GetAllBadgesHandler
func (h *BadgeHandler) GetAllBadgesHandler(w http.ResponseWriter, r *http.Request) {
	badges, err := h.Repo.GetAllBadges()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badges)
}

// GetBadgeByIDHandler
func (h *BadgeHandler) GetBadgeByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	badge, err := h.Repo.GetBadgeByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Badge not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badge)
}

// CreateBadgeHandler
func (h *BadgeHandler) CreateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Name          string `json:"name"`
		Description   string `json:"description"`
		IconUrl       string `json:"iconUrl"`
		CriteriaValue int    `json:"criteriaValue"`
		CriteriaType  string `json:"criteriaType"`
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
		CriteriaType:  requestBody.CriteriaType,
	}

	newID, err := h.Repo.CreateBadge(badge)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	badge.ID = newID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(badge)
}

// UpdateBadgeHandler
func (h *BadgeHandler) UpdateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Name          string `json:"name"`
		Description   string `json:"description"`
		IconUrl       string `json:"iconUrl"`
		CriteriaValue int    `json:"criteriaValue"`
		CriteriaType  string `json:"criteriaType"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	badge := &models.Badge{
		ID:            id,
		Name:          requestBody.Name,
		Description:   sql.NullString{String: requestBody.Description, Valid: requestBody.Description != ""},
		IconUrl:       sql.NullString{String: requestBody.IconUrl, Valid: requestBody.IconUrl != ""},
		CriteriaValue: requestBody.CriteriaValue,
		CriteriaType:  requestBody.CriteriaType,
	}

	if err := h.Repo.UpdateBadge(badge); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteBadgeHandler
func (h *BadgeHandler) DeleteBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
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

// GetAllUserBadgesHandler
func (h *UserBadgeHandler) GetAllUserBadgesHandler(w http.ResponseWriter, r *http.Request) {
	userBadges, err := h.Repo.GetAllUserBadges()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	// Encode the slice directly, not inside a map.
	// The frontend expects an array: `[...]` not an object: `{"userBadges": [...]}`
	json.NewEncoder(w).Encode(userBadges)
}

// GetUserBadgesByUserIDHandler
func (h *UserBadgeHandler) GetUserBadgesByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	userBadges, err := h.Repo.GetUserBadgesByUserID(userID)
	if err != nil {
		// Om inga rader hittas är det inte nödvändigtvis ett serverfel,
		// det kan bara betyda att användaren inte har några badges än.
		// Returnera en tom lista i det fallet.
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.UserBadge{})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userBadges)
}

// CreateUserBadgeHandler
func (h *UserBadgeHandler) CreateUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		UserID    int64      `json:"userId"`
		BadgeID   int64      `json:"badgeId"`
		AwardedAt *time.Time `json:"awardedAt,omitempty"`
		Progress  int        `json:"progress"`
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
		Progress:  requestBody.Progress,
	}

	if err := h.Repo.AwardBadge(userBadge); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(userBadge)
}

// GetUserBadgeHandler
func (h *UserBadgeHandler) GetUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	badgeID, err2 := strconv.ParseInt(vars["badgeId"], 10, 64)

	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid user or badge ID", http.StatusBadRequest)
		return
	}

	ub, err := h.Repo.GetUserBadge(userID, badgeID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User badge not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ub)
}

// UpdateUserBadgeHandler
func (h *UserBadgeHandler) UpdateUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	badgeID, err2 := strconv.ParseInt(vars["badgeId"], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid user or badge ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		AwardedAt *time.Time `json:"awardedAt,omitempty"`
		Progress  *int       `json:"progress,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// Hämta befintlig user-badge för att ha default-värden
	existingUB, err := h.Repo.GetUserBadge(userID, badgeID)
	if err != nil || existingUB == nil {
		http.Error(w, "User badge not found", http.StatusNotFound)
		return
	}

	if requestBody.AwardedAt != nil {
		existingUB.AwardedAt = *requestBody.AwardedAt
	}
	if requestBody.Progress != nil {
		existingUB.Progress = *requestBody.Progress
	}

	if err := h.Repo.UpdateUserBadge(existingUB); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// DeleteUserBadgeHandler
func (h *UserBadgeHandler) DeleteUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	badgeID, err2 := strconv.ParseInt(vars["badgeId"], 10, 64)
	if err1 != nil || err2 != nil {
		http.Error(w, "Invalid user or badge ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.RemoveBadge(userID, badgeID); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
