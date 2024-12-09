package routes

import (
	"smart-home-energy-management-server/interface/http/handler"
	"smart-home-energy-management-server/internal/repository"
	"smart-home-energy-management-server/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

func FileRoutes(version *gin.RouterGroup, psql *gorm.DB, redis *redis.Client) {

	fileRepository := repository.NewFileRepository(redis)
	fileService := service.NewFileService(fileRepository)

	appliaceRepository := repository.NewApplianceRepository(psql)
	applianceService := service.NewApplianceService(appliaceRepository)

	fileHandler := handler.NewFileHandler(applianceService, fileService)

	version.POST("/upload", fileHandler.UploadFileCSV)
	version.POST("/chat", fileHandler.Chat)
	version.POST("/generate-recommendations", fileHandler.GenerateRecommendations)
}
