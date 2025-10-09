package router

import (
	"gamification-api/backend/database"
	"gamification-api/backend/handlers"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// Dependencies innehåller alla handlers som vår router behöver.
type dependencies struct {
	UserHandler        *handlers.UserHandler
	CompetitionHandler *handlers.CompetitionHandler
	ActivityHandler    *handlers.ActivityHandler
	TeamHandler        *handlers.TeamHandler
	UserTeamHandler    *handlers.UserTeamHandler
	BadgeHandler       *handlers.BadgeHandler
	UserBadgeHandler   *handlers.UserBadgeHandler
	SystemHandler      *handlers.SystemHandler
	FileHandler        *handlers.FileHandler
}

// InitializeAndGetRouter sköter hela setup-processen och returnerar en färdig router.
func InitializeAndGetRouter() *mux.Router {
	// Steg 1: Anslut till databasen
	db, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("FATAL: Kunde inte ansluta till databasen: %v", err)
	}

	// Steg 2: Skapa alla repositories
	userRepo := &database.UserRepository{DB: db}
	badgeRepo := &database.BadgeRepository{DB: db}
	userBadgeRepo := &database.UserBadgeRepository{DB: db}
	activityRepo := &database.ActivityRepository{DB: db}
	teamRepo := &database.TeamRepository{DB: db}
	userTeamRepo := &database.UserTeamRepository{DB: db}
	competitionRepo := &database.CompetitionRepository{DB: db}
	systemRepo := &database.SystemRepository{DB: db}


	// Steg 3: Skapa alla handlers
	deps := dependencies{
		UserHandler:        &handlers.UserHandler{Repo: userRepo},
		BadgeHandler:       &handlers.BadgeHandler{Repo: badgeRepo},
		UserBadgeHandler:   &handlers.UserBadgeHandler{Repo: userBadgeRepo},
		ActivityHandler:    &handlers.ActivityHandler{Repo: activityRepo},
		TeamHandler:        &handlers.TeamHandler{Repo: teamRepo},
		UserTeamHandler:    &handlers.UserTeamHandler{Repo: userTeamRepo},
		CompetitionHandler: &handlers.CompetitionHandler{Repo: competitionRepo},
		SystemHandler:      &handlers.SystemHandler{Repo: systemRepo},
		FileHandler:        &handlers.FileHandler{UserRepo: userRepo, BadgeRepo: badgeRepo},
	}

	// Steg 4: Konfigurera och returnera routern
	return newRouter(deps)
}

func newRouter(deps dependencies) *mux.Router {
	r := mux.NewRouter()
	api := r.PathPrefix("/api/v1").Subrouter()

	api.HandleFunc("", deps.SystemHandler.RootHandler).Methods("GET")



	// Registrera alla modulära vägar
	if deps.UserHandler != nil {
		RegisterUserRoutes(api, deps.UserHandler)
	}
	if deps.CompetitionHandler != nil {
		RegisterCompetitionRoutes(api, deps.CompetitionHandler)
	}
	if deps.ActivityHandler != nil {
		RegisterActivityRoutes(api, deps.ActivityHandler)
	}
	if deps.BadgeHandler != nil {
		RegisterBadgeRoutes(api, deps.BadgeHandler)
	}
	if deps.UserBadgeHandler != nil {
		RegisterUserBadgeRoutes(api, deps.UserBadgeHandler)
	}
	if deps.TeamHandler != nil {
		RegisterTeamRoutes(api, deps.TeamHandler)
	}
	if deps.UserTeamHandler != nil {
		RegisterUserTeamRoutes(api, deps.UserTeamHandler)
	}
	if deps.FileHandler != nil {
		uploadRouter := api.PathPrefix("/upload").Subrouter()
		uploadRouter.HandleFunc("/avatar", deps.FileHandler.UploadAvatarHandler).Methods("POST")
		uploadRouter.HandleFunc("/badge", deps.FileHandler.UploadBadgeIconHandler).Methods("POST")
	}

	fs := http.FileServer(http.Dir("./static/"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	return r
}

