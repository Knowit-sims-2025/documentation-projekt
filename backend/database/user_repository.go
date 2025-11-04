package database

import (
	"database/sql"
	"fmt"
	"gamification-api/backend/models"
	"time"
)

const defaultAvatarURL = "/static/avatars/default_avatar.jpg"

// UserRepository hanterar all databaskommunikation för User-modellen.
type UserRepository struct {
	DB *sql.DB
}

type UserStatsRepository struct {
	DB *sql.DB
}

// GetAllUsers hämtar alla användare från databasen.
func (repo *UserRepository) GetAllUsers() ([]models.User, error) {
	rows, err := repo.DB.Query("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at, lifetime_points FROM users ORDER BY total_points DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID,
			&user.ConfluenceAuthorID,
			&user.DisplayName,
			&user.AvatarURL,
			&user.TotalPoints,
			&user.IsAdmin,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.LifeTimePoints,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

// GetUserByConfluenceID hämtar en användare baserat på deras unika Confluence ID.
func (repo *UserRepository) GetUserByConfluenceID(confluenceID string) (*models.User, error) {
	row := repo.DB.QueryRow("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at, lifetime_points FROM users WHERE confluence_author_id = $1", confluenceID)
	var user models.User
	err := row.Scan(
		&user.ID,
		&user.ConfluenceAuthorID,
		&user.DisplayName,
		&user.AvatarURL,
		&user.TotalPoints,
		&user.IsAdmin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LifeTimePoints,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Ingen användare hittades
		}
		return nil, err
	}
	return &user, nil
}

func (repo *UserRepository) GetUserByID(id int64) (*models.User, error) {
	row := repo.DB.QueryRow("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at, lifetime_points FROM users WHERE id = $1", id)
	var user models.User
	err := row.Scan(
		&user.ID,
		&user.ConfluenceAuthorID,
		&user.DisplayName,
		&user.AvatarURL,
		&user.TotalPoints,
		&user.IsAdmin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LifeTimePoints,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Ingen användare hittades med det ID:t
		}
		return nil, err
	}
	return &user, nil
}

func (repo *UserRepository) CreateUser(user *models.User) (int64, error) {

	if !user.AvatarURL.Valid || user.AvatarURL.String == "" {
		user.AvatarURL = sql.NullString{String: defaultAvatarURL, Valid: true}
	}

	// Starta en transaktion
	tx, err := repo.DB.Begin()
	if err != nil {
		return 0, err
	}
	// Säkerställ rollback om något går fel
	defer tx.Rollback()

	query := `INSERT INTO users (confluence_author_id, display_name, avatar_url)VALUES ($1, $2, $3) RETURNING id`
	var newID int64
	err = tx.QueryRow(query, user.ConfluenceAuthorID, user.DisplayName, user.AvatarURL).Scan(&newID)
	if err != nil {
		return 0, err // Rollback anropas av defer
	}

	// --- Hämta alla badge-ID:n ---
	rows, err := tx.Query(`SELECT id FROM badges`)
	if err != nil {
		return 0, err // Rollback
	}
	defer rows.Close()

	now := time.Now().UTC()
	var badgeIDs []int64

	for rows.Next() {
		var badgeID int64
		if err := rows.Scan(&badgeID); err != nil {
			return 0, err // Rollback
		}
		badgeIDs = append(badgeIDs, badgeID)
	}
	if err := rows.Err(); err != nil {
		return 0, err // Rollback
	}

	// Definiera SQL-frågan för insert
	userBadgeSQL := `
		INSERT INTO user_badges (user_id, badge_id, awarded_at, progress)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, badge_id) DO NOTHING
	`

	// Loopa igenom alla badges och kör Exec direkt på transaktionen
	for _, badgeID := range badgeIDs {
		if _, err := tx.Exec(userBadgeSQL, newID, badgeID, now, 0); err != nil {
			return 0, err // Rollback
		}
	}

	// Allt gick bra, committa transaktionen
	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return newID, nil
}

// UpdateUser uppdaterar en befintlig användares information.
func (repo *UserRepository) UpdateUser(id int64, user *models.User) error {
	query := `UPDATE users SET display_name = $1, avatar_url = $2, is_admin = $3, updated_at = NOW() WHERE id = $4`

	_, err := repo.DB.Exec(query, user.DisplayName, user.AvatarURL, user.IsAdmin, id)
	return err
}

// UpdateAvatarURL uppdaterar endast avatar_url för en specifik användare.
func (repo *UserRepository) UpdateAvatarURL(id int64, avatarURL string) error {
	query := `UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`
	_, err := repo.DB.Exec(query, avatarURL, id)
	return err
}

func (repo *UserRepository) DeleteUser(id int64) error {
	_, err := repo.DB.Exec("DELETE FROM users WHERE id = $1", id)
	return err
}

func (repo *UserRepository) UpdateUserPoints(id int64, points int) error {
	_, err := repo.DB.Exec("UPDATE users SET total_points = total_points + $1, lifetime_points = lifetime_points + $1 WHERE id = $2", points, id)
	return err
}

func (repo *UserRepository) EmptyUsersPoints(id int64) error {
	query := `UPDATE users SET total_points = 0 WHERE id = $1`
	_, err := repo.DB.Exec(query, id)
	return err
}


// updateStatsAndBadges är en generell hjälpfunktion som hanterar all logik i en transaktion.
func (repo *UserStatsRepository) updateStatsAndBadges(id int64, statColumn, criteriaType string) error {
	// 1. Starta transaktion
	tx, err := repo.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // Rulla tillbaka om något går fel

	var newCount int

	// 2. Uppdatera user_stats OCH hämta det nya värdet
	statQuery := fmt.Sprintf(`UPDATE user_stats SET %s = %s + 1 WHERE user_id = $1 RETURNING %s`, statColumn, statColumn, statColumn)
	err = tx.QueryRow(statQuery, id).Scan(&newCount)
	if err != nil {
		return err
	}

	// 3. Uppdatera progress i user_badges baserat på det nya värdet
	progressQuery := `
		UPDATE user_badges
		SET progress = $1
		WHERE user_id = $2 AND badge_id IN (
			SELECT id FROM badges WHERE criteria_type = $3
		)
	`
	if _, err := tx.Exec(progressQuery, newCount, id, criteriaType); err != nil {
		return err
	}

	// 4. Kolla om detta nya värde låste upp en badge (sätt awarded_at)
	awardQuery := `
		UPDATE user_badges
		SET awarded_at = NOW()
		WHERE user_id = $1
		  AND awarded_at IS NULL 
		  AND badge_id IN (
			  SELECT id FROM badges WHERE criteria_type = $2
		  )
		  AND progress >= (
			  SELECT criteria_value FROM badges WHERE badges.id = user_badges.badge_id
		  )
	`
	if _, err := tx.Exec(awardQuery, id, criteriaType); err != nil {
		return err
	}

	// 5. Allt klart, committa
	return tx.Commit()
}

func (repo *UserStatsRepository) UpdateUserStatsComments(id int64) error {
	return repo.updateStatsAndBadges(id, "total_comments", "total_comments")
}

func (repo *UserStatsRepository) UpdateUserStatsEditedPages(id int64) error {
	return repo.updateStatsAndBadges(id, "total_edits_made", "total_edits_made")
}

func (repo *UserStatsRepository) UpdateUserStatsCreatedPages(id int64) error {
	return repo.updateStatsAndBadges(id, "total_created_pages", "total_created_pages")
}

func (repo *UserStatsRepository) UpdateUserStatsResolvedComments(id int64) error {
	return repo.updateStatsAndBadges(id, "total_resolved_comments", "total_resolved_comments")
}

func (repo *UserStatsRepository) CreateStatsForUser(userID int64) error {
	query := `
        INSERT INTO user_stats (user_id, total_comments, total_edits_made, total_created_pages, total_resolved_comments)
        VALUES ($1, 0, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
    `
	_, err := repo.DB.Exec(query, userID)
	return err
}

func (repo *UserStatsRepository) GetUserStatsByUserID(userID int64) (*models.UserStats, error) {
	row := repo.DB.QueryRow("SELECT user_id, total_comments, total_edits_made, total_created_pages, total_resolved_comments FROM user_stats WHERE user_id = $1", userID)
	var stats models.UserStats
	err := row.Scan(
		&stats.UserID,
		&stats.TotalComments,
		&stats.TotalEdits,
		&stats.TotalCreatedPages,
		&stats.TotalResolvedComments,
	)
	if err != nil {
		return nil, err
	}
	return &stats, nil
}

// GetTopCommenter returnerar användaren med flest kommentarer.
func (repo *UserStatsRepository) GetTopCommenter() (*models.UserTopStat, error) {
	query := `
		SELECT u.display_name, u.avatar_url, s.total_comments AS count
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		ORDER BY s.total_comments DESC
		LIMIT 1;
	`
	var top models.UserTopStat
	err := repo.DB.QueryRow(query).Scan(&top.DisplayName, &top.AvatarURL, &top.Count)
	if err != nil {
		return nil, err
	}
	return &top, nil
}

// GetTopEditor returnerar användaren med flest redigeringar.
func (repo *UserStatsRepository) GetTopEditor() (*models.UserTopStat, error) {
	query := `
		SELECT u.display_name, u.avatar_url, s.total_edits_made AS count
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		ORDER BY s.total_edits_made DESC
		LIMIT 1;
	`
	var top models.UserTopStat
	err := repo.DB.QueryRow(query).Scan(&top.DisplayName, &top.AvatarURL, &top.Count)
	if err != nil {
		return nil, err
	}
	return &top, nil
}

// GetTopCreator returnerar användaren med flest skapade sidor.
func (repo *UserStatsRepository) GetTopCreator() (*models.UserTopStat, error) {
	query := `
		SELECT u.display_name, u.avatar_url, s.total_created_pages AS count
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		ORDER BY s.total_created_pages DESC
		LIMIT 1;
	`
	var top models.UserTopStat
	err := repo.DB.QueryRow(query).Scan(&top.DisplayName, &top.AvatarURL, &top.Count)
	if err != nil {
		return nil, err
	}
	return &top, nil
}

// GetTopResolvedCommenter returnerar användaren med flest lösta kommentarer.
func (repo *UserStatsRepository) GetTopResolvedCommenter() (*models.UserTopStat, error) {
	query := `
		SELECT u.display_name, u.avatar_url, s.total_resolved_comments AS count
		FROM user_stats s
		JOIN users u ON u.id = s.user_id
		ORDER BY s.total_resolved_comments DESC
		LIMIT 1;
	`
	var top models.UserTopStat
	err := repo.DB.QueryRow(query).Scan(&top.DisplayName, &top.AvatarURL, &top.Count)
	if err != nil {
		return nil, err
	}
	return &top, nil
}