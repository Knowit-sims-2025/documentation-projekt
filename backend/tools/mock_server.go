package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Ett exempel på data som simulerar ett svar från SharePoints API (Microsoft Graph)
func getSharePointMockData() gin.H {
	return gin.H{
		"value": []gin.H{
			{
				"id":                   "doc_a1b2c3d4",
				"name":                 "Projektplan v1.0.docx",
				"lastModifiedDateTime": "2025-09-17T14:30:00Z",
				"lastModifiedBy": gin.H{
					"user": gin.H{
						"id":          "sharepoint-user1",
						"displayName": "Anna Andersson",
					},
				},
			},
			{
				"id":                   "doc_e5f6g7h8",
				"name":                 "Mötesanteckningar Q3.docx",
				"lastModifiedDateTime": "2025-09-16T10:00:00Z",
				"lastModifiedBy": gin.H{
					"user": gin.H{
						"id":          "sharepoint-user2",
						"displayName": "Erik Johansson",
					},
				},
			},
		},
	}
}

// Ett exempel på data som simulerar ett svar från Confluences API
func getConfluenceMockData() gin.H {
	return gin.H{
		"results": []gin.H{
			{
				"id":    "page-1234",
				"title": "Kundmöte med ABC AB",
				"version": gin.H{
					"when": "2025-09-17T15:00:00Z",
					"by": gin.H{
						"displayName": "Anna Andersson",
						"accountId":   "confluence-user1",
					},
				},
			},
			{
				"id":    "page-5678",
				"title": "Onboarding för nyanställda",
				"version": gin.H{
					"when": "2025-09-16T11:00:00Z",
					"by": gin.H{
						"displayName": "Erik Johansson",
						"accountId":   "confluence-user2",
					},
				},
			},
		},
	}
}

func main() {
	router := gin.Default()

	// Simulerar SharePoint "delta query"-endpoint
	router.GET("/mock/sharepoint/documents", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, getSharePointMockData())
	})
	// Simulerar Confluences API-endpoint för senaste sidor
	router.GET("/mock/confluence/pages", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, getConfluenceMockData())
	})

	router.Run(":8081")
}
