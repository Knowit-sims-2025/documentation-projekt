package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID                 int64          `json:"id"`
	ConfluenceAuthorID string         `json:"-"`
	DisplayName        string         `json:"displayName"`
	AvatarURL          sql.NullString `json:"avatarUrl"`
	TotalPoints        int            `json:"totalPoints"`
	IsAdmin            bool           `json:"isAdmin"`
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`

}
