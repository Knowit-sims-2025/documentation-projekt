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

func (r *CompetitionRepository) CreateCompetition(c *models.Competition) (int64, error) {
	query :=  `INSERT INTO competitions (name, description, start_date, end_date, created_by_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	err := r.DB.QueryRow(query, c.Name, c.Description, c.StartDate, c.EndDate, c.CreatedByUserID).Scan(&c.ID)
	if err != nil {
		return 0, err
	}
	return c.ID, nil
}

func (r * CompetitionRepository) GetCompetitionByID(id int64) (*models.Competition, error) {
	row := r.DB.QueryRow(`SELECT id, name, description, start_date, end_date, created_by_user_id, created_at FROM competitions WHERE id = $1`, id)
	var comp models.Competition
	err := row.Scan(
		&comp.ID,
		&comp.Name,
		&comp.Description,
		&comp.StartDate,
		&comp.EndDate,
		&comp.CreatedAt,
		&comp.CreatedByUserID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Ingen tävling hittades med det ID:t
		}
		return nil, err

	}
	return &comp, nil
}

func (r *CompetitionRepository) UpdateCompetition(c *models.Competition) error {
	_, err := r.DB.Exec(`UPDATE competitions SET name = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5`,
		c.Name, c.Description, c.StartDate, c.EndDate, c.ID)
	return err
}
