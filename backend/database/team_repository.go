package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
	"time"
)

type TeamRepository struct {
	DB *sql.DB
}

type UserTeamRepository struct {
	DB *sql.DB
}

// Hämta alla teams
func (r *TeamRepository) GetAllTeams() ([]models.Team, error) {
	query := `SELECT id, name, created_at FROM teams ORDER BY ID ASC`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teams []models.Team

	for rows.Next() {
		var t models.Team
		err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt)
		if err != nil {
			log.Println("Error scanning team:", err)
			continue
		}
		teams = append(teams, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return teams, nil
}

// Hämta ett specifikt team efter ID
func (r *TeamRepository) GetTeamByID(id int64) (*models.Team, error) {
	row := r.DB.QueryRow(`SELECT id, name, created_at FROM teams WHERE id = $1`, id)

	var t models.Team
	err := row.Scan(&t.ID, &t.Name, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

// Skapa ett nytt team
func (r *TeamRepository) CreateTeam(t *models.Team) (int64, error) {
	var id int64
	err := r.DB.QueryRow(`
		INSERT INTO teams (name, created_at)
		VALUES ($1, $2)
		RETURNING id`,
		t.Name, time.Now().UTC(),
	).Scan(&id)

	if err != nil {
		return 0, err
	}
	return id, nil
}

// Uppdatera ett team
func (r *TeamRepository) UpdateTeam(t *models.Team) error {
	_, err := r.DB.Exec(`
		UPDATE teams
		SET name = $1
		WHERE id = $2`,
		t.Name, t.ID,
	)
	return err
}

// Ta bort ett team
func (r *TeamRepository) DeleteTeam(id int64) error {
	_, err := r.DB.Exec(`DELETE FROM teams WHERE id = $1`, id)
	return err
}

// Hämta alla user_teams
func (r *UserTeamRepository) GetAllUserTeams() ([]models.UserTeam, error) {
	query := `SELECT user_id, team_id, joined_at FROM user_teams ORDER BY joined_at DESC`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userTeams []models.UserTeam

	for rows.Next() {
		var ut models.UserTeam
		err := rows.Scan(&ut.UserID, &ut.TeamID, &ut.JoinedAt)
		if err != nil {
			log.Println("Error scanning user_team:", err)
			continue
		}
		userTeams = append(userTeams, ut)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userTeams, nil
}

// Lägg till en user i ett team
func (r *UserTeamRepository) AddUserToTeam(userID, teamID int64) error {
	query := `INSERT INTO user_teams (user_id, team_id) VALUES ($1, $2)
	          ON CONFLICT (user_id, team_id) DO NOTHING`
	_, err := r.DB.Exec(query, userID, teamID)
	return err
}

// Ta bort en user från ett team
func (r *UserTeamRepository) RemoveUserFromTeam(userID, teamID int64) error {
	query := `DELETE FROM user_teams WHERE user_id = $1 AND team_id = $2`
	_, err := r.DB.Exec(query, userID, teamID)
	return err
}
