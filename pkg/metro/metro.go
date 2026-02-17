package metro

import (
	"fmt"
	"io"
	"net/http"

	"github.com/jamespfennell/gtfs"
)

const (
	METRO_STATIC_URL = "https://www.metrostlouis.org/Transit/google_transit.zip"
	METRO_REALTIME_URL = "https://www.metrostlouis.org/RealTimeData/StlRealcTimeVehicles.pb"
)

type StopMarkers struct {
	Stops []StopMarker `json:"stops"`
}

type StopMarker struct {
	ID string `json:"id"`
	Name string `json:"name"`
	StopType string `json:"typ"`
	Routes []Route `json:"routes"`
	Coords Coordiantes `json:"coords"`
}

type Route struct {
	ID string 	`json:"routeId"`
	Name string `json:"routeName"`
	NameLong string `json:"routeNameLong"`
}

type Coordiantes struct {
	La float64 `json:"latitude"`
	Lo float64 `json:"longitude"`
}

func GetStatic() (*gtfs.Static, error) {
	resp, err := http.Get(METRO_STATIC_URL)
	if err != nil { 
		return nil, fmt.Errorf("get request failed: %w", err) 
	}
	b, err := io.ReadAll(resp.Body) 
	if err != nil { 
		return nil, fmt.Errorf("failed to read response body: %w", err) 
	}
	return gtfs.ParseStatic(b, gtfs.ParseStaticOptions{})
}

func GetRealtime() gtfs.Realtime {
	resp, _ := http.Get(METRO_REALTIME_URL)
	b, _ := io.ReadAll(resp.Body)
	realtimeData, _ := gtfs.ParseRealtime(b, &gtfs.ParseRealtimeOptions{})
	return *realtimeData
}

type Routes map[*gtfs.Stop]map[*gtfs.Route]struct{}

func MapRoutesToStops(s *gtfs.Static) Routes {
	rts := Routes{}
	for _, t := range s.Trips {
		for _, st := range t.StopTimes {
			if rts[st.Stop] == nil {
				rts[st.Stop] = map[*gtfs.Route]struct{}{}
			}
			rts[st.Stop][t.Route] = struct{}{}
		}
	}
	return rts
}

func (r Routes) BuildStops() *StopMarkers {
	stops := []StopMarker{}
	for k, v := range r {
		sm := StopMarker{
			ID: k.Id,
			Name: k.Name,
			Coords: Coordiantes{
				La: *k.Latitude,
				Lo: *k.Longitude,
			},
		}

		isMLB := false
		isMLR := false
		for rt := range v {
			if rt.ShortName == "MLB" {
				isMLB = true
			}
			if rt.ShortName == "MLR" {
				isMLR = true
			}
			sm.Routes = append(sm.Routes, Route{
				ID: rt.Id,
				Name: rt.ShortName,
				NameLong: rt.LongName,
			})
		}
		switch {
		case (isMLB && isMLR):
			sm.StopType = "mlc"
		case (isMLB):
			sm.StopType = "mlb"
		case (isMLR):
			sm.StopType = "mlr"
		default: sm.StopType = "bus"
		}
		stops = append(stops, sm)
	}
	return &StopMarkers{Stops: stops}
}