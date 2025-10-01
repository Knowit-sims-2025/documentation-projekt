package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"time"
)

type CompetitionRepository struct {
	DB *sql.DB
}

// Hämtar alla tävlingar
func (r *CompetitionRepository) GetAllCompetitions() ([]models.Competition, error) {
	rows, err := r.DB.Query(`
		SELECT id, name, description, start_date, end_date, created_by_user_id, created_at
		FROM competitions
		ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var competitions []models.Competition
	for rows.Next() {
		var c models.Competition
		err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Description,
			&c.StartDate,
			&c.EndDate,
			&c.CreatedByUserID,
			&c.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Räkna ut status (Active/Upcoming/Ended)
		now := time.Now().UTC()
		if now.Before(c.StartDate) {
			c.Status = "upcoming"
		} else if now.After(c.EndDate) {
			c.Status = "ended"
		} else {
			c.Status = "active"
		}

		competitions = append(competitions, c)
	}

	return competitions, nil
}
