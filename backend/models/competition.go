package models

import (
	"database/sql"
	"time"
)

// Competition represents a contest or event within a specific timeframe.
type Competition struct {
	ID              int64          `json:"id"`
	Name            string         `json:"name"`
	Description     sql.NullString `json:"description"`
	StartDate       time.Time      `json:"startDate"`
	EndDate         time.Time      `json:"endDate"`
	CreatedByUserID sql.NullInt64  `json:"-"` // Internal use, hide from JSON
	CreatedAt       time.Time      `json:"createdAt"`

	// This field does not exist in the database.
	// It will be calculated in Go before sending the JSON response.
	Status string `json:"status,omitempty"`
}
