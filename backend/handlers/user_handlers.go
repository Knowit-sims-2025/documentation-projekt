package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
	"strings"
)

// UserHandler hanterar HTTP-förfrågningar relaterade till användare.

type UserHandler struct {
	Repo *database.UserRepository
}

// GetAllUsersHandler hanterar förfrågningar till /api/v1/users
func (h *UserHandler) GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	// Anropa funktionen ni precis skapade i er repository.
	users, err := h.Repo.GetAllUsers()
	if err != nil {
		// Om något går fel med databasen, skicka ett serverfel.
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sätt en header för att tala om för webbläsaren att vi skickar JSON.
	w.Header().Set("Content-Type", "application/json")

	// Omvandla er lista av användare till JSON och skicka den.
	json.NewEncoder(w).Encode(users)
}

func (h *UserHandler) GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Hämta ID från URL:en, t.ex. /api/v1/users/id
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	user, err := h.Repo.GetUserByID(int(id))
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}
	newID, err := h.Repo.CreateUser(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	user.ID = newID
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)

}

func (h *UserHandler) UpdateUserHandler(w http.ResponseWriter, r *http.Request){
	idStr := strings.TrimPrefix(r.URL.Path, "/api/v1/users/"){
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

	user.ID = id
	err = h.Repo.UpdateUser(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}
	}
}
