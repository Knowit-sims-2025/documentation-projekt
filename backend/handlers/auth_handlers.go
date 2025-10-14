package handlers

import (
	"encoding/json"
	"gamification-api/backend/auth"
	"gamification-api/backend/database"
	"net/http"
)

type AuthHandler struct {
	UserRepo *database.UserRepository
}

type LoginRequest struct {
	ConfluenceAuthorID string `json:"confluenceAuthorId"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Ogiltig request body", http.StatusBadRequest)
		return
	}

	if req.ConfluenceAuthorID == "" {
		http.Error(w, "confluenceAuthorId saknas", http.StatusBadRequest)
		return
	}

	user, err := h.UserRepo.GetUserByConfluenceID(req.ConfluenceAuthorID)
	if err != nil {
		http.Error(w, "Internt serverfel vid sökning efter användare", http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "Användare hittades inte", http.StatusNotFound)
		return
	}

	tokenString, err := auth.GenerateToken(user)
	if err != nil {
		http.Error(w, "Kunde inte generera token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString})
}

