package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

// RegisterUserRoutes tar emot en router och en userHandler,
// och registrerar alla vägar som har med användare att göra.
func RegisterUserRoutes(r *mux.Router, h *handlers.UserHandler) {
	s := r.PathPrefix("/users").Subrouter()
	s.HandleFunc("", h.GetAllUsersHandler).Methods("GET")
	s.HandleFunc("", h.CreateUserHandler).Methods("POST")
	s.HandleFunc("/{id:[0-9]+}", h.GetUserByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateUserHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteUserHandler).Methods("DELETE")
}
