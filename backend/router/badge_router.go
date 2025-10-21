package router

import (
	"gamification-api/backend/handlers"

	"github.com/gorilla/mux"
)

func RegisterBadgeRoutes(r *mux.Router, h *handlers.BadgeHandler) {
	s := r.PathPrefix("/badges").Subrouter()
	s.HandleFunc("", h.GetAllBadgesHandler).Methods("GET")
	r.HandleFunc("/badgetypes", h.GetAllBadgeTypesHandler).Methods("GET") // Add this line for badge types
	s.HandleFunc("", h.CreateBadgeHandler).Methods("POST")

	s.HandleFunc("/{id:[0-9]+}", h.GetBadgeByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateBadgeHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteBadgeHandler).Methods("DELETE")
}

func RegisterUserBadgeRoutes(r *mux.Router, h *handlers.UserBadgeHandler) {
	s := r.PathPrefix("/userbadges").Subrouter()
	s.HandleFunc("", h.GetAllUserBadgesHandler).Methods("GET")
	s.HandleFunc("", h.CreateUserBadgeHandler).Methods("POST")

	// Notera den mer komplexa URL-strukturen här
	s.HandleFunc("/{userId:[0-9]+}/{badgeId:[0-9]+}", h.DeleteUserBadgeHandler).Methods("DELETE")

	// Routes for a specific user's badges
	r.HandleFunc("/users/{userId:[0-9]+}/badges", h.GetUserBadgesByUserIDHandler).Methods("GET")
	r.HandleFunc("/users/{userId:[0-9]+}/badges/{badgeId:[0-9]+}", h.UpdateUserBadgeHandler).Methods("PUT")
}
