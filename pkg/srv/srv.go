package srv

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"text/template"
	"time"

	"github.com/jamespfennell/gtfs"
	"github.com/jdetok/stlmetromap/pkg/gis"
	"github.com/jdetok/stlmetromap/pkg/metro"
	"golang.org/x/sync/errgroup"
)

const (
	CensusCountiesWhere = "STATE = '29' AND COUNTY IN ('099','071','183','189','219','510') OR STATE = '17' AND COUNTY IN ('005','013','027','083','117','119','133','163')"
	CensusTractsWhere   = "(STATE = '29' AND COUNTY IN ('099','071','183','189','219','510')) OR (STATE = '17' AND COUNTY IN ('005','013','027','083','117','119','133','163'))"
	countiesURL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/82"
	tractsURL   = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/8"
)

func SetupServer(ctx context.Context, static *gtfs.Static, stops *metro.StopMarkers) error {
	g, ctx := errgroup.WithContext(context.Background())
	var countiesData *gis.GeoData
	var tractsData *gis.GeoData
	var poplMap gis.GeoIDPopl

	g.Go(func() error {
		moPop, err := gis.FetchACSPopulation(ctx, "29", []string{"099", "071", "183", "189", "219", "510"})
		if err != nil {
			return fmt.Errorf("failed to fetch MO population: %w", err)
		}
		ilPop, err := gis.FetchACSPopulation(ctx, "17", []string{"005", "013", "027", "083", "117", "119", "133", "163"})
		if err != nil {
			return fmt.Errorf("failed to fetch IL population: %w", err)
		}
		for k, v := range ilPop {
			moPop[k] = v
		}
		poplMap = moPop
		fmt.Println(len(poplMap), "features in pop map")
		return nil
	})

	g.Go(func() error {
		var err error
		countiesData, err = gis.FetchTigerData(ctx, countiesURL, CensusCountiesWhere)
		if err != nil {
			return fmt.Errorf("failed to fetch counties: %w", err)
		}
		return nil
	})

	g.Go(func() error {
		var err error
		tractsData, err = gis.FetchTigerData(ctx, tractsURL, CensusTractsWhere)
		if err != nil {
			return fmt.Errorf("failed to fetch tracts: %w", err)
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		log.Fatal("error setting up server: ", err)
	}

	tracts := gis.JoinPopulation(tractsData, poplMap)

	tmpl := template.Must(template.ParseFiles("www/index.html"))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("www/js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("www/css"))))
	http.HandleFunc("/census/counties", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(countiesData)
	})
	http.HandleFunc("/census/tracts", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tracts)
	})
	http.HandleFunc("/stops", func(w http.ResponseWriter, r *http.Request) { HandleMetroStops(w, r, stops) })
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl.Execute(w, nil)
	})

	fmt.Printf("listening at %v...\n", time.Now())
	return http.ListenAndServe(":3333", nil)
}

func HandleMetroStops(w http.ResponseWriter, r *http.Request, stops *metro.StopMarkers) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	if err := json.NewEncoder(w).Encode(stops); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}