package seeder

import (
	"database/sql"
	"fmt"
)

// SeedBadges säkerställer att alla badges från koden finns i databasen.
func SeedBadges(db *sql.DB) error {
	fmt.Println("Kontrollerar och synkroniserar badges för produktion...")

	badgeData := []struct {
		Name, Description, IconURL, CriteriaType string
		CriteriaValue                            int
	}{
		{"Beginner documenter", "Awarded for creating your very first document.", "documents0", "total_created_pages", 1},
		{"Novice documenter", "Awarded for creating your 10th document.", "documents1", "total_created_pages", 10},
		{"Intermidiate documenter", "Awarded for creating your 50th document.", "documents2", "total_created_pages", 50},
		{"Proffesional documenter", "Awarded for creating your 100th document.", "documents3", "total_created_pages", 100},
		{"Beginner commenter", "Awarded for making your very first comment.", "comments0", "total_comments", 1},
		{"Novice commenter", "Awarded for making your 10th comment.", "comments1", "total_comments", 10},
		{"Intermidiate commenter", "Awarded for mmaking your 50th comment.", "comments2", "total_comments", 50},
		{"Proffesional commenter", "Awarded for making your 100th comment.", "comments3", "total_comments", 100},
		{"Beginner editor", "Awarded for making your very first edit.", "edits0", "total_edits_made", 1},
		{"Novice editor", "Awarded for making your 10th edit.", "edits1", "total_edits_made", 10},
		{"Intermidiate editor", "Awarded for making your 50th edit.", "edits2", "total_edits_made", 50},
		{"Proffesional editor", "Awarded for making your 100th edit.", "edits3", "total_edits_made", 100},
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("kunde inte starta badge-transaktion: %w", err)
	}
	defer tx.Rollback() // Rulla tillbaka om något går fel

	stmt, err := tx.Prepare(`
		INSERT INTO badges (name, description, icon_url, criteria_value, criteria_type)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (name) DO UPDATE SET
			description = EXCLUDED.description,
			icon_url = EXCLUDED.icon_url,
			criteria_value = EXCLUDED.criteria_value,
			criteria_type = EXCLUDED.criteria_type
	`)
	if err != nil {
		return fmt.Errorf("kunde inte förbereda badge-upsert: %w", err)
	}
	defer stmt.Close()

	fmt.Println("🏅 Synkroniserar badges...")
	for _, b := range badgeData {
		if _, err := stmt.Exec(b.Name, b.Description, b.IconURL, b.CriteriaValue, b.CriteriaType); err != nil {
			// Om ett fel inträffar här, rullas transaktionen tillbaka
			return fmt.Errorf("kunde inte infoga/uppdatera badge %s: %w", b.Name, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("kunde inte committa badge-transaktion: %w", err)
	}

	fmt.Println("✅ Synkronisering av badges komplett!")
	return nil
}