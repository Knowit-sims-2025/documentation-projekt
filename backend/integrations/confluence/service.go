package confluence

import (
	"gamification-api/backend/database"
	"log"
	"time"
)

// Service hanterar den periodiska synkroniseringen av Confluence-data.
type Service struct {
	Client       *Client
	Repositories Repositories
	ticker       *time.Ticker
	stop         chan bool
}

// NewService skapar och konfigurerar en ny synkroniseringstjänst.
func NewService(client *Client, userRepo *database.UserRepository, activityRepo *database.ActivityRepository, userStatsRepo *database.UserStatsRepository) *Service {
	return &Service{
		Client: client,
		Repositories: Repositories{
			UserRepo:      userRepo,
			ActivityRepo:  activityRepo,
			UserStatsRepo: userStatsRepo,
		},
		stop: make(chan bool),
	}
}

// Start initierar den periodiska synkroniseringen.
// Den kör en synkronisering direkt och sedan en gång per intervall.
func (s *Service) Start(interval time.Duration) {
	log.Printf("Confluence-tjänsten startad. Synkroniserar var %v.", interval)
	s.ticker = time.NewTicker(interval)

	// Kör en go-rutin (en lättviktstråd) för att inte blockera resten av programmet.
	go func() {
		// Kör en synkronisering direkt vid start.
		SyncActivities(s.Client, s.Repositories)

		for {
			select {
			case <-s.ticker.C:
				// Detta block körs varje gång "väckarklockan" ringer.
				SyncActivities(s.Client, s.Repositories)
			case <-s.stop:
				// Om vi får en signal på stop-kanalen, avsluta loopen.
				s.ticker.Stop()
				return
			}
		}
	}()
}

// Stop avslutar den periodiska synkroniseringen.
func (s *Service) Stop() {
	log.Println("Stoppar Confluence-tjänsten...")
	s.stop <- true
}
