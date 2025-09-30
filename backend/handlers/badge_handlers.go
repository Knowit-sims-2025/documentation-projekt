package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
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
