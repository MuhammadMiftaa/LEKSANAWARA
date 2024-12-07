package handler

import (
	"errors"
	"net/http"
	"path/filepath"
	"smart-home-energy-management-server/internal/helper"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadFileCSV(c *gin.Context) {
	path := "./data"
	absolutePath, _ := filepath.Abs(path)

	// Check if table is exist
	file, err := c.FormFile("table")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":     false,
			"statusCode": 400,
			"message":    err.Error(),
		})
		return
	}

	// Check if storage is exist
	if err = helper.StorageIsExist(absolutePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    errors.New("storage not found").Error(),
		})
		return
	}

	// Create file name with timestamp
	fileName := time.Now().Format("20060102150405") + filepath.Ext(file.Filename)
	filePath := filepath.Join(absolutePath, fileName)
	if err = c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     true,
		"statusCode": 200,
		"message":    "Upload table success",
		"data":       filePath,
	})
}
