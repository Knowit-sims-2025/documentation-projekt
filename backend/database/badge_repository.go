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

// Hämtar alla badges från db
func (r *BadgeRepository) GetAllBadges() ([]models.Badge, error) {
	query := `SELECT id, name, description, icon_url, criteria_value, criteria_type FROM badges ORDER BY name DESC` //ordern är just nu by name

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
			&badge.CriteriaType,
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
		INSERT INTO badges (name, description, icon_url, criteria_value, criteria_type)
		VALUES ($1, $2, $3, $4, $5)
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
		SET name = $1, description = $2, icon_url = $3, criteria_value = $4, criteria_type = $5
		WHERE id = $6`,
		b.Name, b.Description, b.IconUrl, b.CriteriaValue, b.CriteriaType, b.ID,
	)
	return err
}

// UpdateIconURL uppdaterar endast icon_url för en specifik badge.
func (r *BadgeRepository) UpdateIconURL(id int64, iconURL string) error {
	query := `UPDATE badges SET icon_url = $1 WHERE id = $2`
	_, err := r.DB.Exec(query, iconURL, id)
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
		SELECT id, name, description, icon_url, criteria_value, criteria_type
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
	query := `SELECT * FROM user_badges ORDER BY awarded_at DESC`

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
			&ub.Progress,
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
		INSERT INTO user_badges (user_id, badge_id, awarded_at, progress)
		VALUES ($1, $2, $3, $4)`,
		ub.UserID, ub.BadgeID, ub.AwardedAt, ub.Progress,
	)
	return err
}

// UpdateUserBadge uppdaterar en befintlig user_badge post.
func (r *UserBadgeRepository) UpdateUserBadge(ub *models.UserBadge) error {
	_, err := r.DB.Exec(`
		UPDATE user_badges
		SET awarded_at = $1, progress = $2
		WHERE user_id = $3 AND badge_id = $4`,
		ub.AwardedAt, ub.Progress, ub.UserID, ub.BadgeID,
	)
	return err
}

// Hämta alla badges för en specifik användare
func (r *UserBadgeRepository) GetUserBadgesByUserID(userID int64) ([]models.UserBadge, error) {
	query := `SELECT user_id, badge_id, awarded_at, progress FROM user_badges WHERE user_id = $1 ORDER BY awarded_at DESC`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userBadges []models.UserBadge
	for rows.Next() {
		var ub models.UserBadge
		err := rows.Scan(&ub.UserID, &ub.BadgeID, &ub.AwardedAt, &ub.Progress)
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
		SELECT user_id, badge_id, awarded_at, progress
		FROM user_badges
		WHERE user_id = $1 AND badge_id = $2`,
		userID, badgeID,
	)

	var ub models.UserBadge
	err := row.Scan(&ub.UserID, &ub.BadgeID, &ub.AwardedAt, &ub.Progress)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Returnera nil om ingen badge hittades
		}
		return nil, err
	}
	return &ub, nil
}

// CheckAndAwardBadges kontrollerar om en användare uppfyller kraven för nya badges och tilldelar dem.
func (r *UserBadgeRepository) CheckAndAwardBadges(userID int64) error {
	log.Printf("Checking and awarding badges for user ID: %d", userID)

	// 1. Hämta user_stats
	var stats struct {
		TotalComments         int
		TotalCreatedPages     int
		TotalEditsMade        int
		TotalResolvedComments int
	}

	err := r.DB.QueryRow(`
		SELECT total_comments, total_created_pages, total_edits_made, total_resolved_comments
		FROM user_stats WHERE user_id = $1
	`, userID).Scan(&stats.TotalComments, &stats.TotalCreatedPages, &stats.TotalEditsMade, &stats.TotalResolvedComments)

	if err != nil {
		log.Printf("Error fetching user stats for user %d: %v", userID, err)
		return err
	}
	log.Printf("User %d stats: Comments=%d, Pages=%d, Edits=%d, ResolvedComments=%d",
		userID, stats.TotalComments, stats.TotalCreatedPages, stats.TotalEditsMade, stats.TotalResolvedComments)

	// 2. Hämta alla badges

	rows, err := r.DB.Query(`
		SELECT id, criteria_type, criteria_value
		FROM badges
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	type badgeCheck struct {
		ID            int64
		CriteriaType  string
		CriteriaValue int
	}
	var allBadges []badgeCheck

	for rows.Next() {
		var b badgeCheck
		if err := rows.Scan(&b.ID, &b.CriteriaType, &b.CriteriaValue); err == nil {
			allBadges = append(allBadges, b)
		}
	}

	// 3. Gå igenom varje badge och kolla om användaren kvalificerar sig
	for _, b := range allBadges {
		log.Printf("Evaluating badge ID %d (Type: %s, Criteria: %d) for user %d", b.ID, b.CriteriaType, b.CriteriaValue, userID)
		var userValue int
		switch b.CriteriaType {
		case "total_comments":
			userValue = stats.TotalComments
		case "total_created_pages":
			userValue = stats.TotalCreatedPages
		case "total_edits_made":
			userValue = stats.TotalEditsMade
		case "total_resolved_comments":
			userValue = stats.TotalResolvedComments
		default:
			log.Printf("Unknown criteria type '%s' for badge ID %d. Skipping.", b.CriteriaType, b.ID)
			continue
		}

		if userValue >= b.CriteriaValue {
			log.Printf("User %d qualifies for badge %d. User value: %d, Criteria value: %d", userID, b.ID, userValue, b.CriteriaValue)
			// Använda UPSERT (INSERT ... ON CONFLICT) för att antingen skapa eller uppdatera.
			// Detta hanterar fallet där en rad redan finns men behöver uppdateras (t.ex. sätta awarded_at).
			query := `
				INSERT INTO user_badges (user_id, badge_id, progress, awarded_at)
				VALUES ($1, $2, $3, NOW())
				ON CONFLICT (user_id, badge_id) DO UPDATE SET
				progress = GREATEST(user_badges.progress, $3),
				awarded_at = COALESCE(user_badges.awarded_at, NOW());
			`
			_, err := r.DB.Exec(query, userID, b.ID, userValue)
			if err != nil {
				log.Printf("Failed to upsert badge %d for user %d: %v", b.ID, userID, err)
				// Fortsätt till nästa badge istället för att avbryta hela loopen
				continue
			}
			log.Printf("User %d awarded or updated badge %d with progress %d\n", userID, b.ID, userValue)
		} else {
			log.Printf("User %d does not yet qualify for badge %d. User value: %d, Criteria value: %d", userID, b.ID, userValue, b.CriteriaValue)
		}
	}
	return nil
}
