package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
	"time"
)

// Hanterar befintlig db koppling
type BadgeRepository struct {
	DB *sql.DB
}

type UserBadgeRepository struct {
	DB *sql.DB
}

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

// Skapa en ny badge
func (r *BadgeRepository) CreateBadge(b *models.Badge) (int64, error) {
	var id int64
	err := r.DB.QueryRow(`
		INSERT INTO badges (name, description, icon_url, criteria_value)
		VALUES ($1, $2, $3, $4)
		RETURNING id`,
		b.Name, b.Description, b.IconUrl, b.CriteriaValue,
	).Scan(&id)

	if err != nil {
		return 0, err
	}
	return id, nil
}

// Uppdatera en badge
func (r *BadgeRepository) UpdateBadge(b *models.Badge) error {
	_, err := r.DB.Exec(`
		UPDATE badges
		SET name = $1, description = $2, icon_url = $3, criteria_value = $4
		WHERE id = $5`,
		b.Name, b.Description, b.IconUrl, b.CriteriaValue, b.ID,
	)
	return err
}

// Radera en badge
func (r *BadgeRepository) DeleteBadge(id int64) error {
	_, err := r.DB.Exec(`DELETE FROM badges WHERE id = $1`, id)
	return err
}

// Hämta badge efter ID
func (r *BadgeRepository) GetBadgeByID(id int64) (*models.Badge, error) {
	row := r.DB.QueryRow(`
		SELECT id, name, description, icon_url, criteria_value
		FROM badges
		WHERE id = $1`, id,
	)

	var b models.Badge
	err := row.Scan(&b.ID, &b.Name, &b.Description, &b.IconUrl, &b.CriteriaValue)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

/* Alla UserBadge funktioner */

// Ta bort en badge från en användare
func (r *UserBadgeRepository) RemoveBadge(userID, badgeID int64) error {
	_, err := r.DB.Exec(`
		DELETE FROM user_badges
		WHERE user_id = $1 AND badge_id = $2`,
		userID, badgeID,
	)
	return err
}

// Hämta alla user_badges från db
func (r *UserBadgeRepository) GetAllUserBadges() ([]models.UserBadge, error) {
	query := `SELECT user_id, badge_id, awarded_at FROM user_badges ORDER BY awarded_at DESC`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userBadges []models.UserBadge

	for rows.Next() {
		var ub models.UserBadge
		err := rows.Scan(
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

// Tilldela en badge till en användare
func (r *UserBadgeRepository) AwardBadge(ub *models.UserBadge) error {
	_, err := r.DB.Exec(`
		INSERT INTO user_badges (user_id, badge_id, awarded_at)
		VALUES ($1, $2, $3)`,
		ub.UserID, ub.BadgeID, ub.AwardedAt,
	)
	return err
}

// Uppdatera awarded_at för en badge (t.ex. flytta datum)
func (r *UserBadgeRepository) UpdateAwardedAt(userID, badgeID int64, newTime time.Time) error {
	_, err := r.DB.Exec(`
		UPDATE user_badges
		SET awarded_at = $1
		WHERE user_id = $2 AND badge_id = $3`,
		newTime, userID, badgeID,
	)
	return err
}

// Hämta alla badges för en specifik användare
func (r *UserBadgeRepository) GetUserBadgesByUserID(userID int64) ([]models.UserBadge, error) {
	query := `SELECT user_id, badge_id, awarded_at FROM user_badges WHERE user_id = $1 ORDER BY awarded_at DESC`
	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userBadges []models.UserBadge
	for rows.Next() {
		var ub models.UserBadge
		err := rows.Scan(&ub.UserID, &ub.BadgeID, &ub.AwardedAt)
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

// Hämta en specifik user_badge (t.ex. via kombon user_id + badge_id)
func (r *UserBadgeRepository) GetUserBadge(userID, badgeID int64) (*models.UserBadge, error) {
	row := r.DB.QueryRow(`
		SELECT user_id, badge_id, awarded_at
		FROM user_badges
		WHERE user_id = $1 AND badge_id = $2`,
		userID, badgeID,
	)

	var ub models.UserBadge
	err := row.Scan(&ub.UserID, &ub.BadgeID, &ub.AwardedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Returnera nil om ingen badge hittades
		}
		return nil, err
	}
	return &ub, nil
}
