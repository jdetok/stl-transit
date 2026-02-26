package gis

import (
	"math"
	"strconv"

	"github.com/jdetok/stlmetromap/pkg/util"
)

const CYCLE_FILE = "data/cycle_osm.geojson"

func init() {
	util.RegisterAppData("acs", func() util.AppData { return &ACSData{} })
	util.RegisterAppData("tgr", func() util.AppData { return &TGRData{} })
	util.RegisterAppData("stops", func() util.AppData { return &StopMarkers{} })
	util.RegisterAppData("bikes", func() util.AppData { return &GeoBikeData{} })
}

// Combine geographic data from TIGER with census data from ACS
func DemographicsForTracts(geo *TGRData, acs *ACSData) *GeoTractFeatures {
	feats := &GeoTractFeatures{}
	for i := range geo.Features {
		f := geo.Features[i]

		// ACS appends the US code= for the GEOID, TIGER does not
		acsObj := acs.Data["1400000US"+f.Attributes.GEOID]
		popl, _ := strconv.ParseFloat(acsObj["B01003_001E"], 64)
		area := f.Attributes.AREALAND
		feats.Features = append(feats.Features, GeoPoplFeature{
			Geometry: f.Geometry,
			Attributes: map[string]any{
				"GEOID":    f.Attributes.GEOID,
				"TRACT":    f.Attributes.TRACT,
				"AREALAND": area,
				"POPL":     popl,
				"POPLSQMI": getPoplDensity(area, popl),
				"INCOME":   acsObj["B06011_001E"],
				"AGE":      acsObj["B01002_001E"],
			},
		})
	}
	return feats
}

// Pass an area and population, get persons/square mile
func getPoplDensity(area string, popl float64) float64 {
	metersToMiles := 2589988
	sqMeters, _ := strconv.ParseFloat(area, 64)
	sqMi := sqMeters / float64(metersToMiles)
	return math.Round((popl/sqMi)*100) / 100
}

type GeoAttrs map[string]any

type GeoPoplFeature struct {
	Geometry   Geo      `json:"geometry"`
	Attributes GeoAttrs `json:"attributes"`
}

type GeoTractFeatures struct {
	Features []GeoPoplFeature `json:"features"`
}

type Geo struct {
	Rings [][][]float64 `json:"rings"`
	Paths [][][]float64 `json:"paths"`
}
