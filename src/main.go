package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jdetok/stlmetromap/pkg/gis"
	"github.com/jdetok/stlmetromap/pkg/srv"
	"github.com/joho/godotenv"
	"golang.org/x/sync/errgroup"
)

func main() {
	g, ctx := errgroup.WithContext(context.Background())

	if err := godotenv.Load(); err != nil {
		fmt.Println("no .env file")
	}

	getCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	
	staticData, err := gis.GetMetroStaticGTFS(getCtx)
	if err != nil {
		fmt.Println("couldn't fetch static data:", err)
	}

	rts := gis.MapRoutesToStops(staticData)

	cleanStops := rts.BuildStops()

	g.Go(func() error {
		return srv.SetupServer(ctx, staticData, cleanStops)
	})

	if err := g.Wait(); err != nil {
		log.Fatal(err)
	}
}
