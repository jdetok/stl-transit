package srv

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"text/template"
	"time"

	"github.com/jamespfennell/gtfs"
	"github.com/jdetok/stlmetromap/pkg/metro"
	"golang.org/x/sync/errgroup"
)

const (
    MOCountyFIPS = "099','071','183','189','219','510"
    ILCountyFIPS = "005','013','027','083','117','119','133','163"
    CensusCountiesWhere = "STATE = '29' AND COUNTY IN ('099','071','183','189','219','510') OR STATE = '17' AND COUNTY IN ('005','013','027','083','117','119','133','163')"
	CensusTractsWhere = "(STATE = '29' AND COUNTY IN ('099','071','183','189','219','510')) OR (STATE = '17' AND COUNTY IN ('005','013','027','083','117','119','133','163'))"

	countiesURL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/82"
    tractsURL   = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/0"
)

func SetupServer(ctx context.Context, static *gtfs.Static, stops *metro.StopMarkers) error {
	g, ctx := errgroup.WithContext(context.Background())
	var countiesData []json.RawMessage
	var tractsData []json.RawMessage

	g.Go(func() error {
		var err error
		countiesData, err = fetchAllFeatures(countiesURL, CensusCountiesWhere)
		if err != nil {
			return fmt.Errorf("failed to fetch counties: %w", err)
		}
		return nil
	})

	g.Go(func() error {
		var err error
		tractsData, err = fetchAllFeatures(tractsURL, CensusTractsWhere)
		if err != nil {
			return fmt.Errorf("failed to fetch tracts: %w", err)
		}
		return nil
	})

	tmpl := template.Must(template.ParseFiles("www/index.html"))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("www/js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("www/css"))))
	http.HandleFunc("/census/counties", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(countiesData)
	})
	http.HandleFunc("/census/tracts", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tractsData)
	})
	http.HandleFunc("/stops", func(w http.ResponseWriter, r *http.Request) {HandleMetroStops(w, r, stops)})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl.Execute(w, nil)
	})

	if ctx.Err() != nil {
		return ctx.Err()
	}

	if err := g.Wait(); err != nil {
		log.Fatal("error setting up server: ", err)
	}

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


func fetchAllFeatures(baseURL, where string) ([]json.RawMessage, error) {
	all := make([]json.RawMessage, 0) 
    offset := 0
    for {
        params := url.Values{}
		params.Set("resultRecordCount", "2000")
        params.Set("f", "json")
        params.Set("outFields", "*")
		params.Set("outSR", "4326")
		params.Set("maxAllowableOffset", "0.001")
        params.Set("where", where)
        params.Set("returnGeometry", "true")
        params.Set("resultOffset", fmt.Sprintf("%d", offset))

        u := fmt.Sprintf("%s/query?%s", baseURL, params.Encode())
        fmt.Println("querying:", u)
        resp, err := http.Get(u)
        if err != nil {
            return nil, err
        }
        defer resp.Body.Close()
		fmt.Println(resp.Status)
        var result struct {
            Features             []json.RawMessage `json:"features"`
            ExceededTransferLimit bool             `json:"exceededTransferLimit"`
			Error *struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
			} `json:"error"`
        }
        if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			fmt.Println("error decoding JSON:", err)
		}
        all = append(all, result.Features...)
		fmt.Println("fetched", len(result.Features), "features from", baseURL)
        if !result.ExceededTransferLimit {
            break
        }

		if result.Error != nil {
			return nil, fmt.Errorf("arcgis error %d: %s", result.Error.Code, result.Error.Message)
		}
        offset += len(result.Features)
		
    }
    return all, nil
}