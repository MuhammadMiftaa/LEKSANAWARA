package service

import (
	"encoding/json"
	"errors"

	"smart-home-energy-management-server/internal/repository"
)

type FileService interface {
	SaveTable(table string) error
	GetTable() (map[string][]string, error)
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

func (s *fileService) GetTable() (map[string][]string, error) {
	table, err := s.FileRepository.GetTable()
	if err != nil {
		return nil, err
	}

	var result map[string][]string
	err = json.Unmarshal([]byte(table), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
