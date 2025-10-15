package confluence

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
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
	spaceKey := "teambfa0a452d69a428ba70ff3d22ef01502"

	url := fmt.Sprintf("%s/rest/api/content?spaceKey=%s&limit=50&start=0&expand=version.by,children.comment,children.comment.version.by,extensions.resolution", c.BaseURL, spaceKey) // c.SpaceKey måste definieras

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

func (c *Client) GetCommentResolutionHistory(commentID string) (*ResolutionResult, error) {
	// Endpoint för att hämta content-historik (fungerar för kommentarer då de är content)
	url := fmt.Sprintf("%s/rest/api/content/%s/history?expand=lastUpdated", c.BaseURL, commentID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa request för historik: %w", err)
	}

	req.SetBasicAuth(c.Email, c.APIToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("kunde inte utföra request för historik: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// Logga varningen, men returnera ingen resolvare (Found = false)
		// Detta kan hända om kommentaren precis har skapats och Confluence är långsamt.
		log.Printf("Varning: Oväntad statuskod från Confluence (CommentHistory) för ID %s: %s", commentID, resp.Status)
		return &ResolutionResult{Found: false}, nil
	}

	var historyResponse HistoryResponse
	if err := json.NewDecoder(resp.Body).Decode(&historyResponse); err != nil {
		return nil, fmt.Errorf("kunde inte avkoda JSON-svar (CommentHistory) för ID %s: %w", commentID, err)
	}

	// Kontrollera om den senaste uppdateringen har ett AccountID
	accountID := historyResponse.LastUpdated.By.AccountID
	if accountID == "" {
		return &ResolutionResult{Found: false}, nil
	}

	// Vi har hittat resolvaren (den som gjorde den sista versionen)
	return &ResolutionResult{
		AccountID: accountID,
		Found:     true,
	}, nil
}

// GetCommentDetails hämtar en kommentar separat för att få dess garanterade resolution status.
func (c *Client) GetCommentDetails(commentID string) (*Content, error) {
	url := fmt.Sprintf("%s/rest/api/content/%s?expand=extensions.resolution,version.by", c.BaseURL, commentID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("kunde inte skapa request för kommentar %s: %w", commentID, err)
	}

	req.SetBasicAuth(c.Email, c.APIToken)
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("kunde inte utföra request för kommentar %s: %w", commentID, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("oväntad statuskod från Confluence (GetCommentDetails) för ID %s: %s, body: %s",
			commentID, resp.Status, string(body))
	}

	var content Content
	if err := json.NewDecoder(resp.Body).Decode(&content); err != nil {
		return nil, fmt.Errorf("kunde inte avkoda JSON-svar (GetCommentDetails) för ID %s: %w", commentID, err)
	}

	return &content, nil
}

// GetPageVersionContent hämtar innehållet för en viss version av en sida.
func (c *Client) GetPageVersionContent(pageID string, versionNumber int) (string, error) {
	var url string
	if versionNumber > 0 {
		// historisk version
		url = fmt.Sprintf("%s/rest/api/content/%s?version=%d&expand=body.storage,version", c.BaseURL, pageID, versionNumber)
	} else {
		// senaste versionen
		url = fmt.Sprintf("%s/rest/api/content/%s?expand=body.storage,version", c.BaseURL, pageID)
	}
	// Skapa request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	// Använd Client-strukturen för Basic Auth
	req.SetBasicAuth(c.Email, c.APIToken)
	req.Header.Set("Accept", "application/json")

	// Skicka request
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return "", fmt.Errorf("Confluence API-fel: %s", string(body))
	}

	// Avkoda JSON
	var page struct {
		Body struct {
			Storage struct {
				Value string `json:"value"`
			} `json:"storage"`
		} `json:"body"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&page); err != nil {
		return "", err
	}
	return page.Body.Storage.Value, nil
}

// GetPageVersionContents hämtar både nuvarande och föregående versioners innehåll.
// Om sidan är version 1 returnerar den samma innehåll två gånger.
func (c *Client) GetPageVersionContents(pageID string, currentVersion int) (oldContent string, newContent string, err error) {
	newContent, err = c.GetPageVersionContent(pageID, currentVersion)
	if err != nil {
		return "", "", err
	}

	// Version 1 har ingen föregående version
	if currentVersion <= 1 {
		return newContent, newContent, nil
	}

	oldContent, err = c.GetPageVersionContent(pageID, currentVersion-1)
	if err != nil {
		return "", "", err
	}

	return oldContent, newContent, nil
}
