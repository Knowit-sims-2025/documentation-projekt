package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// Globala variabler för att hålla vår JSON-data i minnet
var sharepointData []byte
var confluenceData []byte

// init-funktionen körs automatiskt när programmet startar
func init() {
	var err error

	// Sökvägen till filen
	sharepointFilePath := filepath.Join("tools", "sharepoint_mock_data.json")
	confluenceFilePath := filepath.Join("tools", "confluence_mock_data.json")

	// Läs in datan från SharePoints JSON-fil
	sharepointData, err = ioutil.ReadFile(sharepointFilePath)
	if err != nil {
		log.Fatalf("Kunde inte läsa filen %s: %v", sharepointFilePath, err)
	}

	// Läs in datan från Confluences JSON-fil
	confluenceData, err = ioutil.ReadFile(confluenceFilePath)
	if err != nil {
		log.Fatalf("Kunde inte läsa filen %s: %v", confluenceFilePath, err)
	}
}

func main() {
	router := gin.Default()

	// Simulerar SharePoints API genom att returnera innehållet i JSON-filen
	router.GET("/mock/sharepoint/documents", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/json", sharepointData)
	})

	// Simulerar Confluences API genom att returnera innehållet i JSON-filen
	router.GET("/mock/confluence/pages", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/json", confluenceData)
	})

	router.Run(":8081")
}
