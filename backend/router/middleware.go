package router

import (
	"context"
	"gamification-api/backend/auth"
	"gamification-api/backend/contextkeys" 
	"net/http"
	"strings"
)

func JwtMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization-header saknas", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			http.Error(w, "Ogiltigt token-format", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(tokenStr)
		if err != nil {
			http.Error(w, "Ogiltig token", http.StatusUnauthorized)
			return
		}

		// Använd nyckeln från det nya paketet
		ctx := context.WithValue(r.Context(), contextkeys.UserContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

