package database

import (
	"database/sql"
	"gamification-api/backend/models"
)

type LeaderBoardRepository struct {
	DB *sql.DB
}

func (repo *LeaderBoardRepository) GetLeaderboardByDate(date string) ([]models.LeaderboardEntry, error) {
	// SQL: använd explicit typkastrering till date (Postgres)
	const q = `
		SELECT 
			u.id AS user_id,
			u.display_name,u.avatar_url,
			COALESCE(SUM(a.points_awarded), 0) AS total_points
		FROM users u
		LEFT JOIN activities a ON a.user_id = u.id AND DATE(a.created_at) = $1::date
		GROUP BY u.id, u.display_name, u.avatar_url
		ORDER BY total_points DESC;
	`

	rows, err := repo.DB.Query(q, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []models.LeaderboardEntry
	for rows.Next() {
		var entry models.LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.DisplayName, &entry.AvatarURL, &entry.TotalPoints); err != nil {
			return nil, err
		}
		leaderboard = append(leaderboard, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return leaderboard, nil
}
