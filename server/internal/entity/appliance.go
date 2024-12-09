package entity

import "gorm.io/gorm"

type Appliance struct {
	gorm.Model
	Name                string
	Priority            bool
	Location            string
	Power               int
	Energy              float64
	AverageUsage        float64
	MonthlyUse          float64
	Cost                float64
	RecommendedSchedule []string
}

type ApplianceRequest struct {
	Name                string   `json:"name"`
	Priority            bool     `json:"priority"`
	Location            string   `json:"location"`
	Power               int      `json:"power"`
	Energy              float64  `json:"energy"`
	AverageUsage        float64  `json:"average_usage"`
	MonthlyUse          float64  `json:"monthly_use"`
	Cost                float64  `json:"cost"`
	RecommendedSchedule []string `json:"recommended_schedule"`
}

type ApplianceResponse struct {
	ID                  uint     `json:"id"`
	Name                string   `json:"name"`
	Priority            bool     `json:"priority"`
	Location            string   `json:"location"`
	Power               int      `json:"power"`
	Energy              float64  `json:"energy"`
	AverageUsage        float64  `json:"average_usage"`
	MonthlyUse          float64  `json:"monthly_use"`
	Cost                float64  `json:"cost"`
	RecommendedSchedule []string `json:"recommended_schedule"`
}
