package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path/filepath"

	"smart-home-energy-management-server/internal/helper"
	"smart-home-energy-management-server/internal/service"

	"github.com/gin-gonic/gin"
)

type fileHandler struct {
	fileService service.FileService
}

func NewFileHandler(fileService service.FileService) fileHandler {
	return fileHandler{fileService}
}

func (h *fileHandler) UploadFileCSV(c *gin.Context) {
	// Menentukan path
	path := "./data"
	absolutePath, _ := filepath.Abs(path)

	// Menerima file dari form-data
	file, err := c.FormFile("table")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":     false,
			"statusCode": 400,
			"message":    err.Error(),
		})
		return
	}

	// Mengecek apakah storage sudah ada
	if err = helper.StorageIsExist(absolutePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    errors.New("storage not found").Error(),
		})
		return
	}

	// Simpan file
	fileName := "INPUT-TABLE" + filepath.Ext(file.Filename)
	filePath := filepath.Join(absolutePath, fileName)
	if err = c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	// Membaca file CSV
	result, err := helper.ReadCSV(absolutePath + "\\INPUT-TABLE.csv")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	// Simpan table ke redis
	jsonResult, err := json.Marshal(result)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	if err = h.fileService.SaveTable(string(jsonResult)); err != nil {
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
		"data":       fileName,
	})
}

func (h *fileHandler) Chat(c *gin.Context) {
	// Mendapatkan URL dan Token dari environment variable
	url := os.Getenv("HUGGINGFACE_API_URL")
	token := os.Getenv("HUGGINGFACE_API_TOKEN")

	var inputs struct {
		Query string              `json:"query"`
		Table map[string][]string `json:"table"`
	}

	// Bind request body ke struct inputs
	err := c.ShouldBindJSON(&inputs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":     false,
			"statusCode": 400,
			"message":    err.Error(),
		})
		return
	}

	// Mendapatkan table dari redis cache
	inputs.Table, err = h.fileService.GetTable()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error get table",
		})
		return
	}

	// Membuat request ke Hugging Face API
	headers := map[string]string{
		"Authorization": "Bearer " + token,
		"Content-Type":  "application/json",
	}

	body, err := json.Marshal(inputs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error marshal body",
		})
		return
	}

	// Melakukan request ke Hugging Face API
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error create request",
		})
		return
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// Mengirim request ke Hugging Face API
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error do request",
		})
		return
	}
	defer resp.Body.Close()

	// Decode response dari Hugging Face API
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error decode response",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     true,
		"statusCode": 200,
		"message":    "Request to Hugging Face API successful",
		"data": map[string]string{
			"question": inputs.Query,
			"response": result["answer"].(string),
		},
	})
}
