package env

import "os"

func GetEnv(name string) string {
	return os.Getenv(name)
}