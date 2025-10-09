package database

import (
	"database/sql"
	"gamification-api/backend/models"
)

const defaultAvatarURL = "/static/avatars/default_avatar.jpg"


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
// GetUserByConfluenceID hämtar en användare baserat på deras unika Confluence ID.
func (repo *UserRepository) GetUserByConfluenceID(confluenceID string) (*models.User, error) {
	row := repo.DB.QueryRow("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at FROM users WHERE confluence_author_id = $1", confluenceID)
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
	row := repo.DB.QueryRow("SELECT id, confluence_author_id, display_name, avatar_url, total_points, is_admin, created_at, updated_at FROM users WHERE id = $1", id)
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

	query := `INSERT INTO users (confluence_author_id, display_name, avatar_url)VALUES ($1, $2, $3) RETURNING id`
	var newID int64
	err := repo.DB.QueryRow(query, user.ConfluenceAuthorID, user.DisplayName, user.AvatarURL).Scan(&newID)
	if err != nil {
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
