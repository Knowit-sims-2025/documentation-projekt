package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
	"time"
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

// ActivityExists kollar om en specifik sidversion redan har registrerats som en aktivitet.
func (r *ActivityRepository) ActivityExists(pageID string, version int) (bool, error) {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM activities WHERE confluence_page_id = $1 AND confluence_version_number = $2)"
	err := r.DB.QueryRow(query, pageID, version).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}

// Hämta aktivitet efter ID
func (r *ActivityRepository) GetActivityByID(id int64) (*models.Activity, error) {
	row := r.DB.QueryRow(`
		SELECT id, user_id, confluence_page_id, confluence_version_number,
		       activity_type, points_awarded, created_at
		FROM activities
		WHERE id = $1`, id)

	var a models.Activity
	err := row.Scan(
		&a.ID,
		&a.UserID,
		&a.ConfluencePageID,
		&a.ConfluenceVersionNumber,
		&a.ActivityType,
		&a.PointsAwarded,
		&a.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// Skapa en ny aktivitet
func (r *ActivityRepository) CreateActivity(a *models.Activity) (int64, error) {
	var id int64
	err := r.DB.QueryRow(`
		INSERT INTO activities (user_id, confluence_page_id, confluence_version_number, activity_type, points_awarded, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`,
		a.UserID, a.ConfluencePageID, a.ConfluenceVersionNumber, a.ActivityType, a.PointsAwarded, time.Now().UTC(),
	).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// Uppdatera en aktivitet
func (r *ActivityRepository) UpdateActivity(a *models.Activity) error {
	_, err := r.DB.Exec(`
		UPDATE activities
		SET user_id = $1, confluence_page_id = $2, confluence_version_number = $3,
		    activity_type = $4, points_awarded = $5
		WHERE id = $6`,
		a.UserID, a.ConfluencePageID, a.ConfluenceVersionNumber, a.ActivityType, a.PointsAwarded, a.ID,
	)
	return err
}

// Radera en aktivitet
func (r *ActivityRepository) DeleteActivity(id int64) error {
	_, err := r.DB.Exec(`DELETE FROM activities WHERE id = $1`, id)
	return err
}
