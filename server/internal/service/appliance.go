package service

import (
	"smart-home-energy-management-server/internal/entity"
	"smart-home-energy-management-server/internal/repository"
)

type ApplianceService interface {
	CreateAppliance(appliance *entity.ApplianceRequest) (*entity.Appliance, error)
	GetAllAppliances() ([]entity.ApplianceResponse, error)
	GetApplianceByID(id uint) (*entity.Appliance, error)
	UpdateApplianceByID(id uint, appliance *entity.Appliance) (*entity.Appliance, error)
	DeleteApplianceByID(id uint) error
	TruncateAppliances() error
}

type applianceService struct {
	applianceRepo repository.ApplianceRepository
}

func NewApplianceService(applianceRepo repository.ApplianceRepository) ApplianceService {
	return &applianceService{applianceRepo: applianceRepo}
}

func (s *applianceService) CreateAppliance(applianceReq *entity.ApplianceRequest) (*entity.Appliance, error) {
	appliance := &entity.Appliance{
		Name:         applianceReq.Name,
		Type:         applianceReq.Type,
		Location:     applianceReq.Location,
		Power:        applianceReq.Power,
		Energy:       applianceReq.Energy,
		Cost:         applianceReq.Cost,
		Status:       applianceReq.Status,
		Connectivity: applianceReq.Connectivity,
		Priority:     applianceReq.Priority,
		UsageToday:   applianceReq.UsageToday,
		AverageUsage: applianceReq.AverageUsage,
	}
	return s.applianceRepo.Create(appliance)
}

func (s *applianceService) GetAllAppliances() ([]entity.ApplianceResponse, error) {
	appliances, err := s.applianceRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var result []entity.ApplianceResponse
	for _, appliance := range appliances {
		result = append(result, entity.ApplianceResponse{
			ID:           appliance.ID,
			Name:         appliance.Name,
			Type:         appliance.Type,
			Location:     appliance.Location,
			Power:        appliance.Power,
			Energy:       appliance.Energy,
			Cost:         appliance.Cost,
			Status:       appliance.Status,
			Connectivity: appliance.Connectivity,
			Priority:     appliance.Priority,
			UsageToday:   appliance.UsageToday,
			AverageUsage: appliance.AverageUsage,
		})
	}

	return result, nil
}

func (s *applianceService) GetApplianceByID(id uint) (*entity.Appliance, error) {
	return s.applianceRepo.FindByID(id)
}

func (s *applianceService) UpdateApplianceByID(id uint, appliance *entity.Appliance) (*entity.Appliance, error) {
	return s.applianceRepo.UpdateByID(id, appliance)
}

func (s *applianceService) DeleteApplianceByID(id uint) error {
	return s.applianceRepo.DeleteByID(id)
}

func (s *applianceService) TruncateAppliances() error {
	return s.applianceRepo.Truncate()
}
