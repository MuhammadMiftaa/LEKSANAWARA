package repository

import (
	"context"

	"github.com/go-redis/redis/v8"
)

type FileRepository interface {
	SaveTable(table string) error
}

type fileRepository struct {
	redis *redis.Client
}

func NewFileRepository(redis *redis.Client) FileRepository {
	return &fileRepository{redis}
}

func (r *fileRepository) SaveTable(table string) error {
	return r.redis.Set(context.Background(), "table", table, 0).Err()
}
