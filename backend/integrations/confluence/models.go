package confluence

import "time"

// PageResponse representerar det övergripande svaret från /rest/api/content (Content-sökning)
type PageResponse struct {
	Results []Content `json:"results"`
	Start   int       `json:"start"`
	Limit   int       `json:"limit"`
	Size    int       `json:"size"`
	// Ofta finns det en _links struct för paginering, men vi utgår från Start/Limit/Size

}

// Content representerar både en sida (page/blogpost) och en kommentar.
type Content struct {
	ID      string  `json:"id"`
	Type    string  `json:"type"` // "page", "blogpost" eller "comment"
	Title   string  `json:"title"`
	Version Version `json:"version"`
	// Children fångar upp inbäddade element som kommentarer när vi expanderar (children.comment)
	Children *Children `json:"children,omitempty"`
	// Lägg till Space, Status, Body om du behöver dem
	// NYTT: Extensions för att fånga resolution status
	Extensions *Extensions `json:"extensions,omitempty"`
}

type Extensions struct {
	Resolution *Resolution `json:"resolution,omitempty"`
}

type Resolution struct {
	Status string `json:"status"` // Kommer att vara t.ex. "resolved" eller "open"
}

// Version innehåller information om den senaste versionen av en Content-entitet.
type Version struct {
	Number    int       `json:"number"`
	By        User      `json:"by"`   // VIKTIGT: Denna by-struktur innehåller användarinfo
	CreatedAt time.Time `json:"when"` // Används för Version.CreatedAt, matchar API-fältet 'when' i vissa versioner
}

// User representerar författaren/uppdateraren av en Content-version.
// Detta matchar den inbäddade 'by'-strukturen i API-svaret.
type User struct {
	Type        string `json:"type"`
	Username    string `json:"username"`
	UserKey     string `json:"userKey"`
	AccountID   string `json:"accountId"` // Den unika ID:t vi behöver för att hämta detaljer
	DisplayName string `json:"displayName"`
	// Lägg till andra fält om du behöver, t.ex. profilePicture
}

// Children representerar de underordnade elementen till en sida.
type Children struct {
	Comment *CommentContainer `json:"comment,omitempty"`
}

// CommentContainer innehåller listan med inbäddade kommentarer.
type CommentContainer struct {
	// Kommentarer är också av typen Content (Content-structen ovan kan återanvändas)
	Results []Content `json:"results"`
	Start   int       `json:"start"`
	Limit   int       `json:"limit"`
	Size    int       `json:"size"`
}

// UserResponse matchar API-svaret när vi hämtar detaljer om en användare separat.
type UserResponse struct {
	AccountID   string `json:"accountId"`
	DisplayName string `json:"displayName"`
	// Lägg till AvatarURL om den behövs för din gamification-logik
}

// Dessa är för att gå igenom historik på kommentarer för att hitta "resolvaren".
// HistoryResponse representerar svaret från /rest/api/content/{id}/history
type HistoryResponse struct {
	LastUpdated VersionHistoryItem `json:"lastUpdated"` // Den senaste uppdateringen
	// Andra fält som "createdDate", "latest", etc.
}

// VersionHistoryItem är ett objekt inuti historiken som inkluderar författare.
type VersionHistoryItem struct {
	By User `json:"by"` // Använder den befintliga User structen
	// Ofta finns det en "when" (tidstämpel) här också
}

// ResolutionResult är den struct vi returnerar
type ResolutionResult struct {
	AccountID string
	Found     bool
}

// PageVersionResponse är den struct som vi använder för att hämta 2 olika versioner av pages
type PageVersionResponse struct {
	ID      string `json:"id"`
	Version struct {
		Number int `json:"number"`
	} `json:"version"`
	Body struct {
		Storage struct {
			Value string `json:"value"`
		} `json:"storage"`
	} `json:"body"`
}
