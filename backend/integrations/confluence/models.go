package confluence

import "time"

// PageResponse matchar toppnivån i API-svaret från /rest/api/content
type PageResponse struct {
	Results []Page `json:"results"`
}

// Page representerar en enskild sida (content) från Confluence.
type Page struct {
	ID      string  `json:"id"`
	Title   string  `json:"title"`
	Version Version `json:"version"`
}

// Version innehåller information om den senaste versionen av en sida.
type Version struct {
	Number    int       `json:"number"`
	By        Author    `json:"by"`
	CreatedAt time.Time `json:"createdAt"`
}

// Author representerar författaren till en sidversion.
type Author struct {
	AccountID string `json:"accountId"`
}

// UserResponse matchar API-svaret när vi hämtar detaljer om en användare.
type UserResponse struct {
	AccountID   string `json:"accountId"`
	DisplayName string `json:"displayName"`
}

