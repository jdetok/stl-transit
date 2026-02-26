package main

import (
	"context"
	"fmt"
	"log"

	_ "github.com/jdetok/stlmetromap/pkg/gis"
	"github.com/jdetok/stlmetromap/pkg/srv"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("no .env file")
	}

	if err := srv.SetupServer(context.Background()); err != nil {
		log.Fatal(err)
	}
}
