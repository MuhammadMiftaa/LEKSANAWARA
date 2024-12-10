package helper

type DailySummary struct {
	ApplianceName string
	Message       string
	Info          string
	IsOveruse     bool
	Usage         float64
	Target        float64
}

type Recommendations struct {
	Name    string
	Message []string
}
