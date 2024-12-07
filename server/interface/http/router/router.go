package router

import (
	"smart-home-energy-management-server/interface/http/middleware"
	"smart-home-energy-management-server/interface/http/routes"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func SetupRouter(redis *redis.Client) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	router.GET("test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World",
		})
	})

	v1 := router.Group("/v1")
	routes.FileRoutes(v1, redis)

	return router
}
