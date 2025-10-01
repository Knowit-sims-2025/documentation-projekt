package database

import (
	"database/sql"
	"gamification-api/backend/models"
	"log"
)

type TeamRepository struct {
	DB *sql.DB
}

type UserTeamRepository struct {
	DB *sql.DB
}

// Hämta alla teams
func (r *TeamRepository) GetAllTeams() ([]models.Team, error) {
	query := `SELECT id, name, created_at FROM teams ORDER BY name ASC`
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
