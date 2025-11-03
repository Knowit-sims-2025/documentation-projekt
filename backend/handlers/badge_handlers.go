package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
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

// badgeRequest represents the payload for creating or updating a badge.
type badgeRequest struct {
	Name          string `json:"name"`
	Description   string `json:"description"`
	IconUrl       string `json:"iconUrl"`
	CriteriaValue int    `json:"criteriaValue"`
	CriteriaType  string `json:"criteriaType"`
}

// GetAllBadgesHandler
func (h *BadgeHandler) GetAllBadgesHandler(w http.ResponseWriter, r *http.Request) {
	badges, err := h.Repo.GetAllBadges()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	respondWithJSON(w, http.StatusOK, badges)
}

// GetBadgeByIDHandler
func (h *BadgeHandler) GetBadgeByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid badge ID")
		return
	}

	badge, err := h.Repo.GetBadgeByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondWithError(w, http.StatusNotFound, "Badge not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	respondWithJSON(w, http.StatusOK, badge)
}

// CreateBadgeHandler
func (h *BadgeHandler) CreateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody badgeRequest

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Request Body")
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
		respondWithError(w, http.StatusInternalServerError, "Failed to create badge")
		return
	}
	badge.ID = newID

	respondWithJSON(w, http.StatusCreated, badge)
}

// UpdateBadgeHandler
func (h *BadgeHandler) UpdateBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid badge ID")
		return
	}

	var requestBody badgeRequest

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Request Body")
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
		// Check if the error is because the badge was not found
		if errors.Is(err, sql.ErrNoRows) {
			respondWithError(w, http.StatusNotFound, "Badge not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to update badge")
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteBadgeHandler
func (h *BadgeHandler) DeleteBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid badge ID")
		return
	}

	if err := h.Repo.DeleteBadge(id); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete badge")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetAllUserBadgesHandler
func (h *UserBadgeHandler) GetAllUserBadgesHandler(w http.ResponseWriter, r *http.Request) {
	userBadges, err := h.Repo.GetAllUserBadges()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	respondWithJSON(w, http.StatusOK, userBadges)
}

// GetUserBadgesByUserIDHandler
func (h *UserBadgeHandler) GetUserBadgesByUserIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// First, run a check to award any newly earned badges.
	// This ensures the data is up-to-date before we fetch it.
	if err := h.Repo.CheckAndAwardBadges(userID); err != nil {
		// We can log this error but shouldn't block the request.
		// The user should still see their existing badges even if the check fails.
		// For a production system, you would add logging here.
		// log.Printf("WARNING: Could not check/award badges for user %d: %v", userID, err)
	}

	userBadges, err := h.Repo.GetUserBadgesByUserID(userID)
	if err != nil {
		// It's not an error if a user has no badges, just an empty result.
		// We should only return an error for actual database problems.
		// If the repository returns sql.ErrNoRows, we return an empty list.
		if errors.Is(err, sql.ErrNoRows) {
			respondWithJSON(w, http.StatusOK, []models.UserBadge{})
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	respondWithJSON(w, http.StatusOK, userBadges)
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
		respondWithError(w, http.StatusBadRequest, "Invalid Request Body")
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
		respondWithError(w, http.StatusInternalServerError, "Failed to award badge")
		return
	}

	respondWithJSON(w, http.StatusCreated, userBadge)
}

// GetUserBadgeHandler
func (h *UserBadgeHandler) GetUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	badgeID, err2 := strconv.ParseInt(vars["badgeId"], 10, 64)

	if err1 != nil || err2 != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user or badge ID")
		return
	}

	ub, err := h.Repo.GetUserBadge(userID, badgeID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondWithError(w, http.StatusNotFound, "User badge not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}

	respondWithJSON(w, http.StatusOK, ub)
}

// UpdateUserBadgeHandler
func (h *UserBadgeHandler) UpdateUserBadgeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err1 := strconv.ParseInt(vars["userId"], 10, 64)
	badgeID, err2 := strconv.ParseInt(vars["badgeId"], 10, 64)
	if err1 != nil || err2 != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user or badge ID")
		return
	}

	var requestBody struct {
		AwardedAt *time.Time `json:"awardedAt,omitempty"`
		Progress  *int       `json:"progress,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Request Body")
		return
	}

	// Get existing user-badge to have default values
	existingUB, err := h.Repo.GetUserBadge(userID, badgeID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			respondWithError(w, http.StatusNotFound, "User badge not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Internal Server Error")
		return

	}

	if requestBody.AwardedAt != nil {
		existingUB.AwardedAt = *requestBody.AwardedAt
	}
	if requestBody.Progress != nil {
		existingUB.Progress = *requestBody.Progress
	}

	if err := h.Repo.UpdateUserBadge(existingUB); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update user badge")
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
		respondWithError(w, http.StatusBadRequest, "Invalid user or badge ID")
		return
	}

	if err := h.Repo.RemoveBadge(userID, badgeID); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to remove user badge")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// CheckUserBadgesHandler triggers a manual check to award badges.
func (h *UserBadgeHandler) CheckUserBadgesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.Repo.CheckAndAwardBadges(userID); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check or award badges")
		return
	}

	message := "Badge check completed successfully for user " + strconv.FormatInt(userID, 10)
	respondWithJSON(w, http.StatusOK, map[string]string{"message": message})
}

// --- Helper Functions ---

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}
