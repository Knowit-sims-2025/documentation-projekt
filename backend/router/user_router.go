package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterUserRoutes(r *mux.Router, h *handlers.UserHandler) {
	s := r.PathPrefix("/users").Subrouter()

	// GET /api/v1/users - Hämtar alla användare
	// POST /api/v1/users - Skapar en ny användare
	s.HandleFunc("", h.GetAllUsersHandler).Methods("GET")
	s.HandleFunc("", h.CreateUserHandler).Methods("POST")

	// GET /api/v1/users/{id} - Hämtar en specifik användare
	// PUT /api/v1/users/{id} - Uppdaterar en användare
	// DELETE /api/v1/users/{id} - Tar bort en användare
	s.HandleFunc("/{id:[0-9]+}", h.GetUserByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateUserHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteUserHandler).Methods("DELETE")
}
