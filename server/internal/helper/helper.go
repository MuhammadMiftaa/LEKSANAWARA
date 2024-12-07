package helper

import (
	"encoding/csv"
	"os"
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
