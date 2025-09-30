package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
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
