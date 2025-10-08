package database

import (
	"database/sql"
)

type SystemRepository struct {
	DB *sql.DB
}

// GetAllPublicTables hämtar namnen på alla tabeller i det publika schemat.
func (r *SystemRepository) GetAllPublicTables() ([]string, error) {
	
	query := `
		SELECT tablename
		FROM pg_catalog.pg_tables
		WHERE schemaname = 'public'
		ORDER BY tablename;
	`
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}

	return tables, nil
}