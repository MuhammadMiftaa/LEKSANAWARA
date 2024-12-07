package main

import (
	"log"
	"os"
	"smart-home-energy-management-server/config"
	"smart-home-energy-management-server/interface/http/router"

	"github.com/joho/godotenv"
)

func main() {
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			log.Println("Error loading .env file")
		}
	}

	redis := config.SetupRedisDatabase()

	port := os.Getenv("PORT")

	r := router.SetupRouter(redis)
	r.Run(":" + port)
}
