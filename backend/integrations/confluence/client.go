package confluence

// Kontakt med confleunce api
type Client struct {
	BaseURL  string
	Email    string
	APIToken string
}

func NewClient(baseURL, email, apiToken string) *Client {
	return &Client{
		BaseURL:  baseURL,
		Email:    email,
		APIToken: apiToken,
	}
}
