package main

import (
	"fmt"
	"io"
	"net/http"

	"github.com/jamespfennell/gtfs"
)

func getStatic() gtfs.Static {
	staticSTL := "https://www.metrostlouis.org/Transit/google_transit.zip"
	resp, _ := http.Get(staticSTL)
	b, _ := io.ReadAll(resp.Body)
	staticData, _ := gtfs.ParseStatic(b, gtfs.ParseStaticOptions{})
	return *staticData
}

func getRealtime() gtfs.Realtime {
	rtSTL := "https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb"
	resp, _ := http.Get(rtSTL)
	b, _ := io.ReadAll(resp.Body)
	realtimeData, _ := gtfs.ParseRealtime(b, &gtfs.ParseRealtimeOptions{})
	return *realtimeData
}

func main() {
	staticData := getStatic()
	fmt.Printf("STL Metro has %d routes and %d stations\n", len(staticData.Routes), len(staticData.Stops))
	// fmt.Println(staticData)

	realtimeData := getRealtime()
	fmt.Printf("STL Metro currently has %d vehicles running or scheduled\n", len(realtimeData.Trips))

	for i, t := range realtimeData.Trips {
		v := t.Vehicle
		fmt.Println(i)
		fmt.Printf("%v, %v\n", *v.Position.Latitude, *v.Position.Longitude)
		// if v.Trip.ID.RouteID == "19587R" {
		// 	fmt.Println("Red line")
		// }
	}
	
}