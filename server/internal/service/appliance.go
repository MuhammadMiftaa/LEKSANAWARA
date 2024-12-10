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
		Priority:     applianceReq.Priority,
		Location:     applianceReq.Location,
		Power:        applianceReq.Power,
		Energy:       applianceReq.Energy,
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
			ID:                  appliance.ID,
			Name:                appliance.Name,
			Priority:            appliance.Priority,
			Location:            appliance.Location,
			Power:               appliance.Power,
			Energy:              appliance.Energy,
			AverageUsage:        appliance.AverageUsage,
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
