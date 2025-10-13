package models

// För daily och weekly leaderboards
type LeaderboardEntry struct {
	UserID      int64  `json:"user_id"`
	DisplayName string `json:"display_name"`
	TotalPoints int    `json:"total_points"`
	AvatarURL   string `json:"avatar_url"`
}
