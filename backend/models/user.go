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
	LifeTimePoints     int            `json:"lifeTimePoints"`
}

type UserStats struct {
	UserID                int64 `json:"id"`
	TotalComments         int   `json:"totalComments"`
	TotalEdits            int   `json:"totalEdits"`
	TotalCreatedPages     int   `json:"totalCreatedPages"`
	TotalResolvedComments int   `json:"totalResolvedComments"`
}

// UserTopStat Den här används för top-användarna (Top Commenter, Top Editor osv)
type UserTopStat struct {
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	Count       int    `json:"count"`
}
