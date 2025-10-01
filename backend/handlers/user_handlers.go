package handlers

import (
	"database/sql"
	"encoding/json"
	"gamification-api/backend/database" // Byt ut 'gamification-api' mot ert Go-modulnamn
	"gamification-api/backend/models"   // Byt ut 'gamification-api' mot ert Go-modulnamn
	"net/http"
	"strconv"
	"strings"
)

// UserHandler hanterar HTTP-förfrågningar relaterade till användare.
type UserHandler struct {
	Repo *database.UserRepository
}

// GetAllUsersHandler hanterar förfrågningar till GET /api/v1/users
func (h *UserHandler) GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := h.Repo.GetAllUsers()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// GetUserByIDHandler hanterar förfrågningar till GET /api/v1/users/{id}
func (h *UserHandler) GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := h.Repo.GetUserByID(id)
	if err != nil {
		// Om repositoryt returnerar ett tekniskt fel
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// FÖRBÄTTRING: Om repositoryt returnerar nil betyder det att användaren inte hittades.
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// CreateUserHandler hanterar förfrågningar till POST /api/v1/users
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	// FÖRBÄTTRING: Vi använder en temporär struct för att läsa in JSON.
	// Detta krävs eftersom er `models.User` har `json:"-"` på ConfluenceAuthorID.
	var requestBody struct {
		ConfluenceAuthorID string `json:"confluenceAuthorId"`
		DisplayName        string `json:"displayName"`
		AvatarURL          string `json:"avatarUrl"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	// Skapa den riktiga modellen och fyll i datan.
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

	// Hämta den fullständiga användaren för att returnera den.
	createdUser, err := h.Repo.GetUserByID(newID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUser)
}

// UpdateUserHandler hanterar förfrågningar till PUT /api/v1/users/{id}
func (h *UserHandler) UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}

	if err := h.Repo.UpdateUser(id, &user); err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	// FÖRBÄTTRING: Returnerar 200 OK istället för 204 No Content.
	// Ofta vill frontend veta att det gick bra.
	w.WriteHeader(http.StatusOK)
}

// DeleteUserHandler hanterar förfrågningar till DELETE /api/v1/users/{id}
func (h *UserHandler) DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	id, err := strconv.ParseInt(idStr, 10, 64)
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

