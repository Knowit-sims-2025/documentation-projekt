package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterUserRoutes(r *mux.Router, userHandler *handlers.UserHandler, userBadgeHandler *handlers.UserBadgeHandler) {
	s := r.PathPrefix("/users").Subrouter()

	// GET /api/v1/users - Hämtar alla användare
	// POST /api/v1/users - Skapar en ny användare
	s.HandleFunc("", userHandler.GetAllUsersHandler).Methods("GET")
	s.HandleFunc("", userHandler.CreateUserHandler).Methods("POST")

	// GET /api/v1/users/{id} - Hämtar en specifik användare
	// PUT /api/v1/users/{id} - Uppdaterar en användare
	// DELETE /api/v1/users/{id} - Tar bort en användare
	s.HandleFunc("/{id:[0-9]+}", userHandler.GetUserByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", userHandler.UpdateUserHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", userHandler.DeleteUserHandler).Methods("DELETE")

	s.HandleFunc("/{userId:[0-9]+}/badges", userBadgeHandler.GetUserBadgesByUserIDHandler).Methods("GET")
}
