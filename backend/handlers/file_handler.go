package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"gamification-api/backend/database"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type FileHandler struct {
	UserRepo  *database.UserRepository
	BadgeRepo *database.BadgeRepository
}

// UploadAvatarHandler hanterar uppladdning av en ny avatar för en specifik användare.
func (h *FileHandler) UploadAvatarHandler(w http.ResponseWriter, r *http.Request) {
	userIdStr := r.FormValue("userId")
	userId, err := strconv.ParseInt(userIdStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid userId provided.", http.StatusBadRequest)
		return
	}

	// Hämta den gamla bild-URL:en INNAN vi laddar upp den nya.
	user, err := h.UserRepo.GetUserByID(userId)
	if err != nil {
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}
	oldImagePath := user.AvatarURL.String

	// Anropa den generella uppladdningsfunktionen.
	uploadedURL, err := h.handleFileUpload(r, "userId", "./static/avatars", "avatar")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Uppdatera databasen med den nya sökvägen.
	if err := h.UserRepo.UpdateAvatarURL(userId, uploadedURL); err != nil {
		http.Error(w, "Could not update user profile in database.", http.StatusInternalServerError)
		return
	}

	// Radera den gamla bilden om den fanns.
	if oldImagePath != "" {
		go h.deleteOldFile(oldImagePath) // Körs i en goroutine för att inte blockera svaret.
	}

	// Skicka tillbaka ett lyckat svar.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"avatarUrl": uploadedURL})
}

// UploadBadgeIconHandler hanterar uppladdning av en ny ikon för en specifik badge.
func (h *FileHandler) UploadBadgeIconHandler(w http.ResponseWriter, r *http.Request) {
	badgeIdStr := r.FormValue("badgeId")
	badgeId, err := strconv.ParseInt(badgeIdStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid badgeId provided.", http.StatusBadRequest)
		return
	}

	// Hämta den gamla bild-URL:en INNAN vi laddar upp den nya.
	badge, err := h.BadgeRepo.GetBadgeByID(badgeId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Badge not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Could not retrieve badge", http.StatusInternalServerError)
		return
	}
	oldImagePath := badge.IconUrl.String

	// Anropa den generella uppladdningsfunktionen.
	uploadedURL, err := h.handleFileUpload(r, "badgeId", "./static/badges", "badge")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Uppdatera databasen med den nya sökvägen.
	if err := h.BadgeRepo.UpdateIconURL(badgeId, uploadedURL); err != nil {
		http.Error(w, "Could not update badge icon in database.", http.StatusInternalServerError)
		return
	}

	// Radera den gamla bilden om den fanns.
	if oldImagePath != "" {
		go h.deleteOldFile(oldImagePath)
	}

	// Skicka tillbaka ett lyckat svar.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"iconUrl": uploadedURL})
}


// handleFileUpload är en generell hjälpfunktion för att hantera filuppladdning.
func (h *FileHandler) handleFileUpload(r *http.Request, idField, targetDir, filePrefix string) (string, error) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		return "", fmt.Errorf("file is too large (max 10MB)")
	}
	idStr := r.FormValue(idField)
	if _, err := strconv.ParseInt(idStr, 10, 64); err != nil {
		return "", fmt.Errorf("invalid %s provided", idField)
	}
	file, handler, err := r.FormFile("uploadFile")
	if err != nil {
		return "", fmt.Errorf("invalid file upload")
	}
	defer file.Close()

	dateStr := time.Now().Format("2006-01-02_15-04-05")
	ext := filepath.Ext(handler.Filename)
	// Bygg ihop det nya filnamnet med datumet.
	uniqueFileName := fmt.Sprintf("%s_%s_%s%s", filePrefix, idStr, dateStr, ext)
	// ------------------------------------

	filePath := filepath.Join(targetDir, uniqueFileName)
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("could not save the file")
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("could not copy file content")
	}
	return "/" + filepath.ToSlash(filePath), nil
}

// deleteOldFile tar bort en fil från filsystemet.
func (h *FileHandler) deleteOldFile(path string) {
	// Konvertera URL-sökvägen (t.ex. /static/avatars/bild.png) till en lokal sökväg (t.ex. ./static/avatars/bild.png)
	if path == "" {
		return
	}
	localPath := "." + strings.Replace(path, "/", string(filepath.Separator), -1)

	// Försök ta bort filen. Om det misslyckas, logga felet.
	if err := os.Remove(localPath); err != nil {
		log.Printf("Failed to delete old file at %s: %v", localPath, err)
	} else {
		log.Printf("Successfully deleted old file: %s", localPath)
	}
}