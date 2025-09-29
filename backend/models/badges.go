package models

import (
	"database/sql"
	"time"
)

type Badge struct {
	ID            int64          `json:"id"`
	Name          string         `json:"name"`
	Description   sql.NullString `json:"description"`
	IconUrl       sql.NullString `json:"icon_url"`
	CriteriaValue int            `json:"criteria_value"`
}

type UserBadge struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	BadgeID   int64     `json:"badge_id"`
	AwardedAt time.Time `json:"awarded_at"`
}
