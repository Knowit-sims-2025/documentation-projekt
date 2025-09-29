package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
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
