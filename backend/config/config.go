package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Samlad app-konfig
type Config struct {
	ConfluenceBaseURL  string
	ConfluenceEmail    string
	ConfluenceAPIToken string
	JWTSecret          string // <-- används av auth.InitJWT
}

func LoadConfig() *Config {
	// Läser .env i aktuell arbetskatalog (ingen panik om filen saknas)
	_ = godotenv.Load()

	return &Config{
		ConfluenceBaseURL:  mustGetEnv("CONFLUENCE_BASE_URL"),
		ConfluenceEmail:    mustGetEnv("CONFLUENCE_EMAIL"),
		ConfluenceAPIToken: mustGetEnv("CONFLUENCE_API_TOKEN"),
	}
}

func mustGetEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}
	return v
}
