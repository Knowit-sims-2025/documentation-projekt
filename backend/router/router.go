package router

import (
	"gamification-api/backend/handlers"
	"net/http"
)

// SetupRouter sätter upp HTTP-rutter och kopplar dem till handlers.
func NewRouter(userHandler handlers.UserHandler) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/users", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			userHandler.GetAllUsersHandler(w, r)
		}
	})

	return mux
}
