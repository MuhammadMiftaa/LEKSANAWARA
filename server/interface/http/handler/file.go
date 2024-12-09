package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"smart-home-energy-management-server/internal/entity"
	"smart-home-energy-management-server/internal/helper"
	"smart-home-energy-management-server/internal/service"

	"github.com/gin-gonic/gin"
)

type fileHandler struct {
	applianceService service.ApplianceService
	fileService      service.FileService
}

func NewFileHandler(applianceService service.ApplianceService, fileService service.FileService) fileHandler {
	return fileHandler{applianceService: applianceService, fileService: fileService}
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
	result, err := helper.ReadCSV(filepath.Join(absolutePath, "INPUT-TABLE.csv"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	appliances, err := helper.ParseCSVtoSliceOfStruct(filepath.Join(absolutePath, "INPUT-TABLE.csv"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	var wg sync.WaitGroup
	var errors []string
	var mu sync.Mutex

	h.applianceService.TruncateAppliances()
	for i := 0; i < len(appliances); i++ {
		wg.Add(1)
		go func(appliance entity.ApplianceRequest) {
			defer wg.Done()
			_, err := h.applianceService.CreateAppliance(&appliance)
			if err != nil {
				mu.Lock()
				errors = append(errors, err.Error())
				mu.Unlock()
			}
		}(appliances[i])
	}

	wg.Wait()

	if len(errors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    errors,
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
	tapasURL := os.Getenv("HUGGINGFACE_API_TAPAS_URL")
	marianmtURL := os.Getenv("HUGGINGFACE_API_MARIANMT_URL")
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

	// Membuat request ke Hugging Face API MarianMT untuk menerjemahkan query
	question := inputs.Query
	marianmtBody, err := json.Marshal(map[string]string{"inputs": inputs.Query})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error marshal MarianMT body",
		})
		return
	}

	// Membuat request untuk MarianMT API
	marianmtReq, err := http.NewRequest("POST", marianmtURL, bytes.NewBuffer(marianmtBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error create MarianMT request",
		})
		return
	}

	marianmtReq.Header.Set("Authorization", "Bearer "+token)
	marianmtReq.Header.Set("Content-Type", "application/json")

	// Mengirim request ke MarianMT API untuk menerjemahkan query
	client := &http.Client{}
	marianmtResp, err := client.Do(marianmtReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error do MarianMT request",
		})
		return
	}
	defer marianmtResp.Body.Close()

	// Decode response dari MarianMT (harus array of string)
	var marianmtResult []map[string]interface{}
	if err := json.NewDecoder(marianmtResp.Body).Decode(&marianmtResult); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"data":       marianmtResult,
			"message":    err.Error() + " Error decode MarianMT response",
		})
		return
	}

	// Ambil terjemahan query dari MarianMT response
	translatedQuery := marianmtResult[0]["translation_text"].(string)

	// Update inputs.Query dengan hasil terjemahan
	inputs.Query = translatedQuery

	// Membuat request ke Hugging Face API TAPAS
	tapasBody, err := json.Marshal(inputs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error marshal TAPAS body",
		})
		return
	}

	// Membuat request ke TAPAS API
	tapasReq, err := http.NewRequest("POST", tapasURL, bytes.NewBuffer(tapasBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error create TAPAS request",
		})
		return
	}

	tapasReq.Header.Set("Authorization", "Bearer "+token)
	tapasReq.Header.Set("Content-Type", "application/json")

	// Mengirim request ke TAPAS API
	tapasResp, err := client.Do(tapasReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error do TAPAS request",
		})
		return
	}
	defer tapasResp.Body.Close()

	// Decode response dari TAPAS
	var tapasResult map[string]interface{}
	if err := json.NewDecoder(tapasResp.Body).Decode(&tapasResult); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error() + " Error decode TAPAS response",
		})
		return
	}

	// Return hasil dari TAPAS API
	c.JSON(http.StatusOK, gin.H{
		"status":     true,
		"statusCode": 200,
		"message":    "Request to Hugging Face API successful",
		"data": map[string]interface{}{
			"question": question,
			"answer":   tapasResult["answer"],
		},
	})
}

func (h *fileHandler) GenerateRecommendations(c *gin.Context) {
	var userInputs struct {
		Golongan   string  `json:"golongan"` // INPUT
		Tarif      float64 `json:"tarif"`
		MaksBiaya  float64 `json:"maks_biaya"` // INPUT
		MaksEnergi float64 `json:"maks_energi"`
		Tanggal    string  `json:"tanggal"` // INPUT
		Hari       int     `json:"hari"`
	}

	err := c.ShouldBindJSON(&userInputs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":     false,
			"statusCode": 400,
			"message":    err.Error(),
		})
		return
	}

	userInputs.Tarif = helper.GetTarif(userInputs.Golongan)
	userInputs.MaksEnergi = userInputs.MaksBiaya / userInputs.Tarif
	userInputs.Hari, _ = helper.JumlahHariDalamBulan(userInputs.Tanggal)
	appliances, err := h.applianceService.GetAllAppliances()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":     false,
			"statusCode": 500,
			"message":    err.Error(),
		})
		return
	}

	helper.PrintRecommendations(appliances, userInputs.Tarif, userInputs.Hari, userInputs.MaksEnergi)
}
