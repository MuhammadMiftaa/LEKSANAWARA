package service

import (
	"smart-home-energy-management-server/internal/entity"
	"smart-home-energy-management-server/internal/repository"
)

type ApplianceService interface {
	CreateAppliance(appliance *entity.Appliance) (*entity.Appliance, error)
	GetAllAppliances() ([]entity.Appliance, error)
	GetApplianceByID(id uint) (*entity.Appliance, error)
	UpdateApplianceByID(id uint, appliance *entity.Appliance) (*entity.Appliance, error)
	DeleteApplianceByID(id uint) error
}

type applianceService struct {
	applianceRepo repository.ApplianceRepository
}

func NewApplianceService(applianceRepo repository.ApplianceRepository) ApplianceService {
	return &applianceService{applianceRepo: applianceRepo}
}

func (s *applianceService) CreateAppliance(appliance *entity.Appliance) (*entity.Appliance, error) {
	return s.applianceRepo.Create(appliance)
}

func (s *applianceService) GetAllAppliances() ([]entity.Appliance, error) {
	return s.applianceRepo.FindAll()
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

