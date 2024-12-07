package routes

import (
	"smart-home-energy-management-server/interface/http/handler"

	"github.com/gin-gonic/gin"
)

func FileRoutes(version *gin.RouterGroup) {
	version.POST("/upload", handler.UploadFileCSV)
}
