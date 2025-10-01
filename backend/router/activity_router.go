package router

import (
	"gamification-api/backend/handlers"
	"net/http"
)

func RegisterActivityRoutes(mux *http.ServeMux, h *handlers.ActivityHandler) {
	mux.HandleFunc("/api/v1/activities", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetAllActivitiesHandler(w, r)
		case http.MethodPost:
			h.CreateActivityHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/activities/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetActivityByIDHandler(w, r)
		case http.MethodPut:
			h.UpdateActivityHandler(w, r)
		case http.MethodDelete:
			h.DeleteActivityHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
