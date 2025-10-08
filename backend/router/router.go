package router

import (
	"encoding/json"
	"gamification-api/backend/handlers" // Byt ut mot ert modulnamn
	"net/http"

	"github.com/gorilla/mux"
)

// Dependencies innehåller alla handlers som vår router behöver.
type Dependencies struct {
	UserHandler        *handlers.UserHandler
	CompetitionHandler *handlers.CompetitionHandler
	ActivityHandler    *handlers.ActivityHandler
	TeamHandler        *handlers.TeamHandler
	UserTeamHandler    *handlers.UserTeamHandler
	BadgeHandler       *handlers.BadgeHandler
	UserBadgeHandler   *handlers.UserBadgeHandler
	
}

// NewRouter skapar och konfigurerar hela er API-router med gorilla/mux.
func NewRouter(deps Dependencies) *mux.Router {
	r := mux.NewRouter()

	// NYTT: Skapa en subrouter för hela v1-API:et
	api := r.PathPrefix("/api/v1").Subrouter()

	// NYTT: Registrera en root handler för /api/v1
	api.HandleFunc("", rootHandler).Methods("GET")

	// Registrera alla modulära vägar
	if deps.UserHandler != nil {
		RegisterUserRoutes(api, deps.UserHandler) // Använder nu subroutern 'api'
	}
	if deps.CompetitionHandler != nil {
		RegisterCompetitionRoutes(api, deps.CompetitionHandler) // Använder nu subroutern 'api'
	}
	if deps.ActivityHandler != nil {
		RegisterActivityRoutes(api, deps.ActivityHandler) // Använder nu subroutern 'api'
	}

	// Hantera statiska filer (bilder etc.)
	fs := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	return r
}

// NY FUNKTION: rootHandler svarar på anrop till API-roten.
func rootHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Welcome to the Gamification API v1",
		"status":  "ok",
	})
}

