package helper

import (
	"encoding/csv"
	"fmt"
	"os"
	"sort"
	"strconv"
	"time"

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
		cost, err := strconv.ParseFloat(record[9], 64)
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
			Name:         deviceName,
			Type:         record[2],
			Location:     record[3],
			Power:        power,
			Energy:       energy,
			Cost:         cost,
			Status:       record[10],
			Connectivity: record[11],
			Priority:     priority,
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
			appliances[i].UsageToday = totalDuration
			appliances[i].AverageUsage = averageUsage
		}
	}

	return appliances, nil
}

func GetTarif(golongan string) float64 {
	switch golongan {
	case "Subsidi daya 450 VA":
		return 415.00
	case "Subsidi daya 900 VA":
		return 605.00
	case "R-1/TR daya 900 VA":
		return 1352.00
	case "R-1/TR daya 1300 VA":
		return 1444.70
	case "R-1/TR daya 2200 VA":
		return 1444.70
	case "R-2/TR daya 3500 VA - 5500 VA":
		return 1699.53
	case "R-3/TR daya 6600 VA ke atas":
		return 1699.53
	case "B-2/TR daya 6600 VA - 200 kVA":
		return 1444.70
	case "B-3/TM daya di atas 200 kVA":
		return 1114.74
	case "I-3/TM daya di atas 200 kVA":
		return 1114.74
	case "I-4/TT daya 30.000 kVA ke atas":
		return 996.74
	case "P-1/TR daya 6600 VA - 200 kVA":
		return 1699.53
	case "P-2/TM daya di atas 200 kVA":
		return 1522.88
	case "P-3/TR penerangan jalan umum":
		return 1699.53
	case "L/TR", "L/TM", "L/TT":
		return 1644.00
	default:
		return -1
	}
}

func JumlahHariDalamBulan(tanggal string) (int, error) {
	// Parsing string tanggal ke tipe time.Time
	t, err := time.Parse("2006-01-02", tanggal)
	if err != nil {
		return 0, err
	}

	// Mendapatkan tahun dan bulan dari tanggal
	tahun := t.Year()
	bulan := t.Month()

	// Menghitung jumlah hari di bulan tersebut
	// time.Date(tahun, bulan+1, 0, 0, 0, 0, 0, time.UTC) akan menghasilkan tanggal terakhir bulan tersebut
	hariTerakhir := time.Date(tahun, bulan+1, 0, 0, 0, 0, 0, time.UTC)

	// Mengembalikan jumlah hari di bulan tersebut
	return hariTerakhir.Day(), nil
}

func PrintRecommendationsMonthlyUsage(appliances []entity.ApplianceResponse, tarif float64, daysInMonth int, maxEnergy float64) []string {
	timeSlots := []string{"00:00–06:00", "06:00–12:00", "12:00–18:00", "18:00–24:00"}

	// Hitung total energi bulanan dan biaya untuk setiap appliance
	for i := range appliances {
		appliances[i].MonthlyUse = appliances[i].Energy * appliances[i].AverageUsage * float64(daysInMonth)
		appliances[i].Cost = appliances[i].MonthlyUse * tarif
	}

	// Urutkan appliances berdasarkan Priority (true dulu), lalu energi rendah
	sort.Slice(appliances, func(i, j int) bool {
		if appliances[i].Priority == appliances[j].Priority {
			return appliances[i].MonthlyUse < appliances[j].MonthlyUse
		}
		return appliances[i].Priority
	})

	// Penjadwalan appliances dengan batas energi
	allocatedEnergy := 0.0
	selectedAppliances := []entity.ApplianceResponse{}

	for _, appliance := range appliances {
		if allocatedEnergy+appliance.MonthlyUse <= maxEnergy {
			allocatedEnergy += appliance.MonthlyUse
			appliance.RecommendedSchedule = RecommendationsMonthlyUsage(appliance.AverageUsage, timeSlots)
			selectedAppliances = append(selectedAppliances, appliance)
		}
	}

	// Cetak jadwal appliances
	result := []string{}
	result = append(result, fmt.Sprintf("Jadwal Penggunaan Appliances (Total Energi = %.2f kWh, Biaya = Rp%.2f):", allocatedEnergy, allocatedEnergy*tarif))
	for _, appliance := range selectedAppliances {
		result = append(result, fmt.Sprintf("Name: %s, Priority: %t, Monthly Use: %.2f kWh, Cost: Rp%.2f, Schedule: %v",
			appliance.Name, appliance.Priority, appliance.MonthlyUse, appliance.Cost, appliance.RecommendedSchedule))
	}

	return result
}

func RecommendationsMonthlyUsage(dailyUse float64, timeSlots []string) []string {
	recommended := []string{}
	slotCount := int(dailyUse / 2.0) // Setiap slot = 2 jam
	for i := 0; i < slotCount && i < len(timeSlots); i++ {
		recommended = append(recommended, timeSlots[i])
	}
	return recommended
}

func PrintRecommendationsDailyUsage(appliances []entity.ApplianceResponse, tariff float64) []DailySummary {
	var summary []DailySummary
	for _, appliance := range appliances {
		// Hitung energi yang dikonsumsi saat ini
		currentEnergy := float64(appliance.Power) * appliance.UsageToday / 1000.0 // kWh
		// Biaya penggunaan saat ini
		currentCost := currentEnergy * tariff

		// Periksa apakah penggunaan melebihi target harian
		var applianceSummary DailySummary
		if appliance.UsageToday > appliance.DailyUseTarget {
			applianceSummary.ApplianceName = appliance.Name
			applianceSummary.Message = fmt.Sprintf("WARNING: %s telah melebihi target harian!", appliance.Name)
			applianceSummary.IsOveruse = true
		} else {
			applianceSummary.ApplianceName = appliance.Name
			applianceSummary.Message = fmt.Sprintf("%s dalam batas target harian. (Penggunaan: %.2f jam, Target: %.2f jam)", appliance.Name, appliance.UsageToday, appliance.DailyUseTarget)
			applianceSummary.IsOveruse = false
		}

		// Cetak informasi biaya
		applianceSummary.Usage = appliance.UsageToday
		applianceSummary.Target = appliance.DailyUseTarget
		applianceSummary.Info = fmt.Sprintf("Biaya saat ini untuk %s: IDR %.2f", appliance.Name, currentCost)
		summary = append(summary, applianceSummary)
	}

	return summary
}

func RecommendationsDailyUsage(appliance entity.ApplianceResponse, hoursRemaining, tariff float64) (string, []string) {
	if appliance.Priority {
		var result []string
		result = append(result, fmt.Sprintf("Rekomendasi untuk %s", appliance.Name))
		result = append(result, "PRIORITAS TINGGI: Perangkat ini penting untuk aktivitas sehari-hari.")
		result = append(result, fmt.Sprintf("Gunakan selama %.2f jam lagi hari ini untuk memenuhi kebutuhan harian tanpa melebihi batas target harian sebesar %.2f jam.", hoursRemaining, appliance.DailyUseTarget))
		result = append(result, fmt.Sprintf("Estimasi biaya tambahan jika digunakan selama %.2f jam: IDR %.2f", hoursRemaining, float64(appliance.Power)*hoursRemaining/1000*tariff))
		return appliance.Name, result
	} else {
		var result []string
		result = append(result, fmt.Sprintf("Rekomendasi untuk %s", appliance.Name))
		result = append(result, "PRIORITAS RENDAH: Perangkat ini tidak mendesak. Pertimbangkan untuk membatasi penggunaannya.")
		result = append(result, fmt.Sprintf("Kurangi penggunaannya agar tidak melebihi target harian %.2f jam.", appliance.DailyUseTarget))
		result = append(result, fmt.Sprintf("Potensi penghematan jika perangkat ini tidak digunakan lagi hari ini: IDR %.2f", float64(appliance.Power)*hoursRemaining/1000*tariff))
		return appliance.Name, result
	}
}
