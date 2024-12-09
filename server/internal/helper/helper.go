package helper

import (
	"encoding/csv"
	"os"
	"strconv"

	"smart-home-energy-management-server/internal/entity"
)

func StorageIsExist(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return os.MkdirAll(path, os.ModePerm)
	}
	return nil
}

func ReadCSV(filePath string) (map[string][]string, error) {
	// Buka file CSV
	fileExist, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer fileExist.Close()

	// Membaca CSV
	reader := csv.NewReader(fileExist)

	// Membaca semua baris dari CSV
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	// Membuat map untuk menyimpan data CSV
	result := make(map[string][]string)

	// Ambil header dari baris pertama
	header := records[0]

	// Inisialisasi map berdasarkan header
	for _, column := range header {
		result[column] = []string{}
	}

	// Memproses setiap baris data
	for _, record := range records[1:] { // Lewati header
		for i, value := range record {
			key := header[i]
			result[key] = append(result[key], value)
		}
	}

	return result, nil
}

func ParseCSVtoSliceOfStruct(filePath string) ([]entity.ApplianceRequest, error) {
	// Buka file CSV
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Membaca file CSV
	reader := csv.NewReader(file)
	// Membaca header
	_, err = reader.Read()
	if err != nil {
		return nil, err
	}

	// Menyimpan daftar appliance dan durasi untuk setiap device
	var appliances []entity.ApplianceRequest
	deviceDurations := make(map[string][]float64) // Menyimpan list durasi untuk setiap device name
	seenNames := make(map[string]bool)

	// Membaca setiap baris dalam file CSV
	for {
		record, err := reader.Read()
		if err != nil {
			break
		}
		// Ambil data dari baris CSV
		deviceName := record[1]
		location := record[3]

		power, err := strconv.Atoi(record[4])
		if err != nil {
			continue
		}
		energy, err := strconv.ParseFloat(record[8], 64)
		if err != nil {
			continue
		}
		duration, err := strconv.ParseFloat(record[7], 64) // Duration (Hours)
		if err != nil {
			continue
		}

		// Jika nama appliance sudah ada, lewati
		if seenNames[deviceName] {
			// Update list durasi untuk appliance yang sama
			deviceDurations[deviceName] = append(deviceDurations[deviceName], duration)
			continue
		}

		// Tandai nama appliance sudah ada
		seenNames[deviceName] = true

		// Tentukan apakah appliance memiliki prioritas (misalnya berdasarkan power > 500W)
		priority := power > 500

		// Tambahkan appliance baru ke slice
		appliance := entity.ApplianceRequest{
			Name:     deviceName,
			Priority: priority,
			Location: location,
			Power:    power,
			Energy:   energy,
		}

		// Hitung rata-rata durasi untuk device yang pertama kali ditemukan
		deviceDurations[deviceName] = append(deviceDurations[deviceName], duration)

		// Tambahkan appliance ke slice
		appliances = append(appliances, appliance)
	}

	// Tambahkan AverageUsage untuk setiap appliance
	for i := range appliances {
		deviceName := appliances[i].Name
		durations := deviceDurations[deviceName]
		if len(durations) > 0 {
			// Hitung rata-rata durasi untuk appliance yang sesuai
			var totalDuration float64
			for _, d := range durations {
				totalDuration += d
			}
			averageUsage := totalDuration / float64(len(durations))
			appliances[i].AverageUsage = averageUsage
		}
	}

	return appliances, nil
}
