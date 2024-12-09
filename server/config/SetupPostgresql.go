package config

import (
	"fmt"
	"log"
	"os"

	"smart-home-energy-management-server/internal/entity"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func SetupDatabase() (*gorm.DB, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	dsn := fmt.Sprintf("host=localhost user=%s password=%s dbname=commercium port=5432 sslmode=disable TimeZone=Asia/Jakarta", os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	db.AutoMigrate(&entity.Appliance{})

	return db, err
}
