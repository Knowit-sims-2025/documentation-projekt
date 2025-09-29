package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
)

// Hanterar befintlig db koppling
type BadgeRepository struct {
	DB *sql.DB
}

type UserBadgeRepository struct {
	DB *sql.DB
}

// Skapar en helt ny BadgeRepo
/*func NewBadgeRepository(db *sql.DB) *BadgeRepository {
	return &BadgeRepository{db}
}*/

// Hämtar alla badges från db
func (r *BadgeRepository) GetAllBadges() ([]models.Badge, error) {
	query := `SELECT id, name, description, icon_url, criteria_value FROM badges ORDER BY name DESC` //ordern är just nu by name
	rows, err := r.DB.Query(query)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var badges []models.Badge

	for rows.Next() {
		var badge models.Badge
		err := rows.Scan(
			&badge.ID,
			&badge.Name,
			&badge.Description,
			&badge.IconUrl,
			&badge.CriteriaValue,
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

// Hämta alla user_badges från db
func (r *UserBadgeRepository) GetAllUserBadges() ([]models.UserBadge, error) {
	query := `SELECT id, user_id, badge_id, awarded_at FROM user_badges ORDER BY awarded_at DESC`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userBadges []models.UserBadge

	for rows.Next() {
		var ub models.UserBadge
		err := rows.Scan(
			&ub.ID,
			&ub.UserID,
			&ub.BadgeID,
			&ub.AwardedAt,
		)
		if err != nil {
			log.Println("Error scanning user_badge:", err)
			continue
		}
		userBadges = append(userBadges, ub)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userBadges, nil
}
