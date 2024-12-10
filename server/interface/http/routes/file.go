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

	redisRepository := repository.NewRedisRepository(redis)
	fileService := service.NewFileService(redisRepository)
	recommendationService := service.NewRecommendationService(redisRepository)

	applianceRepository := repository.NewApplianceRepository(psql)
	applianceService := service.NewApplianceService(applianceRepository)

	fileHandler := handler.NewFileHandler(applianceService, fileService, recommendationService)

	version.POST("/upload", fileHandler.UploadFileCSV)
	version.POST("/chat", fileHandler.Chat)
	version.POST("/generate-recommendations", fileHandler.GenerateRecommendations)
}
