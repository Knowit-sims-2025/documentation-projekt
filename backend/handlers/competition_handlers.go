package handlers

import (
	"encoding/json"
	"gamification-api/backend/database"
	"gamification-api/backend/models"
	"net/http"
	"strconv"
    "github.com/gorilla/mux"
)

type CompetitionHandler struct {
	Repo *database.CompetitionRepository
}

// GetAllActivitiesHandlers hanterar förfrågningar till /api/v1/competitions
func (h *CompetitionHandler) GetAllCompetitionsHandler(w http.ResponseWriter, r *http.Request) {
	// Anropa funktionen ni precis skapade i er repository.
	competitions, err := h.Repo.GetAllCompetitions()
	if err != nil {
		// Om något går fel med databasen, skicka ett serverfel.
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Sätt en header för att tala om för webbläsaren att vi skickar JSON.
	w.Header().Set("Content-Type", "application/json")

	// Omvandla er lista av användare till JSON och skicka den.
	json.NewEncoder(w).Encode(competitions)
}
// CreateCompetitionHandler hanterar POST /competitions
func (h *CompetitionHandler) CreateCompetitionHandler(w http.ResponseWriter, r *http.Request) {
    var newComp models.Competition
    
    // Läs och avkoda JSON-datan från anropets body
    err := json.NewDecoder(r.Body).Decode(&newComp)
    if err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Skicka den nya tävlingen till repositoryt för att spara den
    createdID, err := h.Repo.CreateCompetition(&newComp)
    if err != nil {
        http.Error(w, "Could not create competition", http.StatusInternalServerError)
        return
    }
    
    newComp.ID = createdID // Sätt det ID som databasen returnerade

    // Skicka tillbaka den nyskapade tävlingen som bekräftelse
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated) // Status 201 Created
    json.NewEncoder(w).Encode(newComp)
}

// GetCompetitionByIDHandler hanterar GET /competitions/{id}
func (h *CompetitionHandler) GetCompetitionByIDHandler(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r) // Kräver att ni använder gorilla/mux
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid competition ID", http.StatusBadRequest)
        return
    }

    // Anropa repositoryt för att hämta tävlingen
    competition, err := h.Repo.GetCompetitionByID(id)
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    if competition == nil {
        http.Error(w, "Competition not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(competition)
}

func (h * CompetitionHandler) DeleteCompetitionHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r) // Kräver att ni använder gorilla/mux
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid competition ID", http.StatusBadRequest)
        return
    }
    err = h.Repo.DeleteCompetition(id)
    if err != nil {
        http.Error(w, "Could not delete competition", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent) // 204 No Content
}

