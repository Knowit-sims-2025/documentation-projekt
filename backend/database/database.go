package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq" // Importerar drivrutinen
)

const (
	host     = "localhost" // Eller "db" om Go-appen körs i en annan Docker container
	port     = 5432
	user     = "user"
	password = "password"
	dbname   = "gamification_db"
)

// ConnectDB ansluter till databasen och returnerar en anslutning
func ConnectDB() (*sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}

	// Testa anslutningen
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	fmt.Println("Lyckades ansluta till databasen!")
	return db, nil
}
