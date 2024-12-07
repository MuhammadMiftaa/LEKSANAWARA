package service

import (
	"errors"
	"smart-home-energy-management-server/internal/repository"
)

type FileService interface {
	SaveTable(table string) error
}

type fileService struct {
	FileRepository repository.FileRepository
}

func NewFileService(fileRepository repository.FileRepository) FileService {
	return &fileService{fileRepository}
}

func (s *fileService) SaveTable(table string) error {
	if table == "" {
		return errors.New("table is empty")
	}

	return s.FileRepository.SaveTable(table)
}
