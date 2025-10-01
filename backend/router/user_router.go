package router

import (
	"gamification-api/backend/handlers"
	"net/http"
)

// RegisterUserRoutes tar emot en router och en userHandler,
// och registrerar alla vägar som har med användare att göra.
func RegisterUserRoutes(mux *http.ServeMux, h *handlers.UserHandler) {
	// Denna väg hanterar både GET (alla) och POST (skapa ny)
	mux.HandleFunc("/api/v1/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetAllUsersHandler(w, r)
		case http.MethodPost:
			h.CreateUserHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Denna väg hanterar GET (specifik), PUT (uppdatera) och DELETE (ta bort)
	mux.HandleFunc("/api/v1/users/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetUserByIDHandler(w, r)
		case http.MethodPut:
			h.UpdateUserHandler(w, r)
		case http.MethodDelete:
			h.DeleteUserHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
