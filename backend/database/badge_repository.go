package database



import (
	"database/sql"
	""
	"log"
)

// Hanterar befintlig db koppling
type BadgeRepository struct {
	DB *sql.DB
}

// Skapar en helt ny BadgeRepo
func NewBadgeRepository(db *sql.DB) *BadgeRepository {
	return &BadgeRepository{db}
}

// Hämtar alla badges från db
func (r *BadgeRepository) getAllBadges() ([]Badge, error) {
	query := `SELECT id, name, description, icon_url, criteria_value FROM badges`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var badges []Badge

	for rows.Next() {
		var badge Badge
		err := rows.Scan(
			&badge.ID,
			&badge.Name,
			&badge.Description,
			&badge.IconUrl,
			&badge.CriteriaValue
			)
		if err != nil {
			log.Println("Error scanning badge:", err)
			continue
		}
		badges = append(badges, badge)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return badges, nil
}
