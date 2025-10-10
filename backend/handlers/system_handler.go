package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"net/http"
	"strings"
)

type SystemHandler struct {
	Repo *database.SystemRepository
}

// RootHandler visar en välkomst-respons med länkar och användarguider.
func (h *SystemHandler) RootHandler(w http.ResponseWriter, r *http.Request) {
	tables, err := h.Repo.GetAllPublicTables()
	if err != nil {
		http.Error(w, "Could not query database schema", http.StatusInternalServerError)
		return
	}

	resourceMap := make(map[string]string)
	for _, table := range tables {
		if !strings.Contains(table, "_") {
			resourceName := table
			resourceUrl := "/api/v1/" + resourceName
			resourceMap[resourceName] = resourceUrl
		}
	}

	// NYTT: Skapa en map med exempel-anrop
	examplesMap := map[string]string{
		"Get a specific user by ID":        "/api/v1/users/{id}",
		"Get a specific team by ID":        "/api/v1/teams/{id}",
		"Get a specific competition by ID": "/api/v1/competitions/{id}",
		"Get all users in a specific team": "/api/v1/userteams/team/{teamId}",
		"Get a specific badge from a user": "/api/v1/userbadges/{userId}/{badgeId}",
	}

	// Uppdatera respons-structen för att inkludera exemplen
	response := struct {
		Message   string            `json:"message"`
		Status    string            `json:"status"`
		Resources map[string]string `json:"resources"`
		Examples  map[string]string `json:"examples"` // NYTT FÄLT
	}{
		Message:   "Welcome to the Gamification API v1",
		Status:    "ok",
		Resources: resourceMap,
		Examples:  examplesMap, // LÄGG TILL DATAN HÄR
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
