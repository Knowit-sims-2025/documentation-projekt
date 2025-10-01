package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
)

type ActivityRepository struct {
	DB *sql.DB
}

// Hämtar alla aktiviteter från databasen
func (r *ActivityRepository) GetAllActivities() ([]models.Activity, error) {
	query := `SELECT id, user_id, confluence_page_id, confluence_version_number,
	                 activity_type, points_awarded, created_at
	          FROM activities
	          ORDER BY created_at DESC`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []models.Activity

	for rows.Next() {
		var a models.Activity
		err := rows.Scan(
			&a.ID,
			&a.UserID,
			&a.ConfluencePageID,
			&a.ConfluenceVersionNumber,
			&a.ActivityType,
			&a.PointsAwarded,
			&a.CreatedAt,
		)
		if err != nil {
			log.Println("Error scanning activity:", err)
			continue
		}
		activities = append(activities, a)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return activities, nil
}
