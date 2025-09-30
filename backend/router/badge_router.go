package router

import (
	"gamification-api/backend/handlers"
	"net/http"
)

func RegisterBadgeRoutes(mux *http.ServeMux, h *handlers.BadgeHandler) {
	// /api/v1/badges hanterar GET (alla) och POST (skapa ny)
	mux.HandleFunc("/api/v1/badges", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetAllBadgesHandler(w, r)
		case http.MethodPost:
			h.CreateBadgeHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// /api/v1/badges/{id} hanterar GET (specifik), PUT (uppdatera) och DELETE (ta bort)
	mux.HandleFunc("/api/v1/badges/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetBadgeByIDHandler(w, r)
		case http.MethodPut:
			h.UpdateBadgeHandler(w, r)
		case http.MethodDelete:
			h.DeleteBadgeHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
