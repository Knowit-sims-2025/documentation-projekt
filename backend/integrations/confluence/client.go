package confluence

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client hanterar kommunikationen med Confluence API.
type Client struct {
	BaseURL  string
	Email    string
	APIToken string
	HTTP     *http.Client
}

// NewClient skapar en ny Confluence API-klient.
func NewClient(baseURL, email, apiToken string) *Client {
	return &Client{
		BaseURL:  baseURL,
		Email:    email,
		APIToken: apiToken,
		HTTP:     &http.Client{Timeout: 15 * time.Second},
	}
}

// GetPages hämtar de senaste sidorna från Confluence.
func (c *Client) GetPages() (*PageResponse, error) {

	url := fmt.Sprintf("%s/rest/api/content?orderBy=-history.lastUpdated.when&expand=version.by", c.BaseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa request: %w", err)
	}

	req.SetBasicAuth(c.Email, c.APIToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("kunde inte utföra request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("oväntad statuskod från Confluence (GetPages): %s", resp.Status)
	}

	var pageResponse PageResponse
	if err := json.NewDecoder(resp.Body).Decode(&pageResponse); err != nil {
		return nil, fmt.Errorf("kunde inte avkoda JSON-svar (GetPages): %w", err)
	}

	return &pageResponse, nil
}

// GetUserDetails hämtar detaljer för en specifik användare via deras Atlassian-ID.
func (c *Client) GetUserDetails(authorId string) (*UserResponse, error) {
	url := fmt.Sprintf("%s/rest/api/user?accountId=%s", c.BaseURL, authorId)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa user details request: %w", err)
	}

	req.SetBasicAuth(c.Email, c.APIToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("kunde inte utföra user details request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("oväntad statuskod från Confluence (GetUserDetails): %s", resp.Status)
	}

	var userResponse UserResponse
	if err := json.NewDecoder(resp.Body).Decode(&userResponse); err != nil {
		return nil, fmt.Errorf("kunde inte avkoda JSON-svar (GetUserDetails): %w", err)
	}

	return &userResponse, nil
}

