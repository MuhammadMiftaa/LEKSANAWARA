package routes

import (
	"smart-home-energy-management-server/interface/http/handler"
	"smart-home-energy-management-server/internal/repository"
	"smart-home-energy-management-server/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func FileRoutes(version *gin.RouterGroup, redis *redis.Client) {

	fileRepository := repository.NewFileRepository(redis)
	fileService := service.NewFileService(fileRepository)
	fileHandler := handler.NewFileHandler(fileService)

	version.POST("/upload", fileHandler.UploadFileCSV)
	version.POST("/chat", fileHandler.Chat)
}
