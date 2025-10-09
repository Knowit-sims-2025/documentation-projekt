package config

import (
	"os"
)

type Config struct {
	ConfluenceBaseURL  string
	ConfluenceEmail    string
	ConfluenceAPIToken string
}

// LoadConfig läser in konfiguration från miljövariabler eller standardvärden.
func LoadConfig() *Config {
	// senare ska det läsas från miljövariabler (.env-fil).
	baseURL := getEnv("CONFLUENCE_BASE_URL", "https://christianstrid.atlassian.net/wiki")
	email := getEnv("CONFLUENCE_EMAIL", "skrivdin-email-här")
	apiToken := getEnv("CONFLUENCE_API_TOKEN", "skrivdin-api-token-här")


	return &Config{
		ConfluenceBaseURL:  baseURL,
		ConfluenceEmail:    email,
		ConfluenceAPIToken: apiToken,
	}
}

// Hjälpfunktion för att läsa en miljövariabel med ett fallback-värde.
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

