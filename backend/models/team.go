package models

import (
	"time"
)

type Team struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserTeam struct {
	UserID   int64     `json:"userId"`
	TeamID   int64     `json:"teamId"`
	JoinedAt time.Time `json:"joinedAt"`
}
