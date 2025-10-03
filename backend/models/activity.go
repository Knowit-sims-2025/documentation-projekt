package models

import "time"

// Activity represents a single point-scoring event in the database.
type Activity struct {
	ID                      int64     `json:"id"`
	UserID                  int64     `json:"userId"`
	ConfluencePageID        string    `json:"-"` // Internal use, hide from JSON
	ConfluenceVersionNumber int       `json:"-"` // Internal use, hide from JSON
	ActivityType            string    `json:"activityType"`
	PointsAwarded           int       `json:"pointsAwarded"`
	CreatedAt               time.Time `json:"createdAt"`
}
