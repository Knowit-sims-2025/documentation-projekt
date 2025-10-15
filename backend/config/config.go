package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config innehåller inställningar för Confluence-API-integration.
type Config struct {
	ConfluenceBaseURL  string
	ConfluenceEmail    string
	ConfluenceAPIToken string
}

// LoadConfig läser in värden från .env eller systemets miljö.
func LoadConfig() *Config {
	// Läs in .env-filen om den finns
	_ = godotenv.Load()

	return &Config{
		ConfluenceBaseURL:  mustGetEnv("CONFLUENCE_BASE_URL"),
		ConfluenceEmail:    mustGetEnv("CONFLUENCE_EMAIL"),
		ConfluenceAPIToken: mustGetEnv("CONFLUENCE_API_TOKEN"),
	}
}

// mustGetEnv avbryter programmet om en obligatorisk variabel saknas.
func mustGetEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}
	return v
}
