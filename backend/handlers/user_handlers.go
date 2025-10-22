package handlers

import (
	"database/sql"
	"encoding/json"
	"gamification-api/backend/contextkeys"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type UserHandler struct {
	Repo *database.UserRepository
	UserStatsRepo *database.UserStatsRepository
}

func (h *UserHandler) MeHandler(w http.ResponseWriter, r *http.Request) {
	// Använd den nya, säkra nyckeln från router-paketet för att hämta värdet.
	userID, ok := r.Context().Value(contextkeys.UserContextKey).(int64)
	if !ok {
		http.Error(w, "Kunde inte hämta användar-ID från token", http.StatusInternalServerError)
		return
	}

	// Använd det befintliga repositoryt för att hämta användaren.
	user, err := h.Repo.GetUserByID(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Användare hittades inte", http.StatusNotFound)
			return
		}
		http.Error(w, "Internt serverfel", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// GetAllUsersHandler
func (h *UserHandler) GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := h.Repo.GetAllUsers()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// GetUserByIDHandler
func (h *UserHandler) GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	// ANVÄND MUX.VARS FÖR ATT HÄMTA 'id' FRÅN URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.Repo.GetUserByID(id)
	if err != nil {
		// Om repositoryt returnerar sql.ErrNoRows, skicka 404
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// CreateUserHandler
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		ConfluenceAuthorID string `json:"confluenceAuthorId"`
		DisplayName        string `json:"displayName"`
		AvatarURL          string `json:"avatarUrl"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	user := &models.User{
		ConfluenceAuthorID: requestBody.ConfluenceAuthorID,
		DisplayName:        requestBody.DisplayName,
		AvatarURL:          sql.NullString{String: requestBody.AvatarURL, Valid: requestBody.AvatarURL != ""},
	}

	newID, err := h.Repo.CreateUser(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	createdUser, err := h.Repo.GetUserByID(newID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUser)
}

// UpdateUserHandler
func (h *UserHandler) UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	// ANVÄND MUX.VARS FÖR ATT HÄMTA 'id' FRÅN URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// Sätt ID:t från URL:en på det inlästa objektet
	user.ID = id
	if err := h.Repo.UpdateUser(user.ID, &user); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Skicka tillbaka den uppdaterade användaren
	updatedUser, _ := h.Repo.GetUserByID(id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedUser)
}

// DeleteUserHandler
func (h *UserHandler) DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	// ANVÄND MUX.VARS FÖR ATT HÄMTA 'id' FRÅN URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if err := h.Repo.DeleteUser(id); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}


func (h *UserHandler) GetUserStatsHandler(w http.ResponseWriter, r *http.Request) {
	// ANVÄND MUX.VARS FÖR ATT HÄMTA 'id' FRÅN URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	stats, err := h.UserStatsRepo.GetUserStatsByUserID(id)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}