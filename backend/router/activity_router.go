package router

import (
	"gamification-api/backend/handlers"
	"github.com/gorilla/mux"
)

func RegisterActivityRoutes(r *mux.Router, h *handlers.ActivityHandler) {
	s := r.PathPrefix("/activities").Subrouter()

	s.HandleFunc("", h.GetAllActivitiesHandler).Methods("GET")
	s.HandleFunc("", h.CreateActivityHandler).Methods("POST")

	s.HandleFunc("/{id:[0-9]+}", h.GetActivityByIDHandler).Methods("GET")
	s.HandleFunc("/{id:[0-9]+}", h.UpdateActivityHandler).Methods("PUT")
	s.HandleFunc("/{id:[0-9]+}", h.DeleteActivityHandler).Methods("DELETE")
}