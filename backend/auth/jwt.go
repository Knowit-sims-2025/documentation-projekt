package auth

import (
	"fmt"
	"gamification-api/backend/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey []byte

// InitJWT initierar JWT med den hemliga nyckeln från konfigurationen.
func InitJWT(secret string) {
	jwtKey = []byte(secret)
}

// Claims är den data vi lagrar i vår token.
type Claims struct {
	UserID int64 `json:"userId"`
	jwt.RegisteredClaims
}

// GenerateToken genererar en JWT för en given användare.
func GenerateToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	// Skapa token med HS256-algoritmen och våra claims.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Signera token med vår hemliga nyckel.
	tokenString, err := token.SignedString(jwtKey)

	return tokenString, err
}

// ValidateToken validerar en JWT och returnerar claims om token är giltig.
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Säkerställ att token använder rätt signeringsalgoritm.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("oväntad signeringsmetod: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("ogiltig token")
	}

	return claims, nil
}

