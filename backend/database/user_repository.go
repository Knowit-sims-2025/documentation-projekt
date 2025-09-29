package database

import (
	"database/sql"
	"gamification-api/backend/models"
)

// UserRepository hanterar all databaskommunikation för User-modellen.
type UserRepository struct {
	DB *sql.DB
}

// GetAllUsers hämtar alla användare från databasen.
func (repo *UserRepository) GetAllUsers() ([]models.User, error) {
	rows, err := repo.DB.Query("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at FROM users ORDER BY total_points DESC")
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
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
