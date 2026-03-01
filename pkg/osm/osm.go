package osm

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
)

type FeatureColl struct {
	Type     string    `json:"type"`
	Features []Feature `json:"features"`
}

type Feature struct {
	Type       string          `json:"type"`
	Geometry   json.RawMessage `json:"geometry"`
	Properties map[string]any  `json:"properties"`
}

func QueryOSMGrocery(ctx context.Context, db *pgxpool.Pool, query string) (*FeatureColl, error) {
	rows, err := db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	fc := &FeatureColl{
		Type:     "FeatureCollection",
		Features: []Feature{},
	}

	for rows.Next() {
		var osmID, name, shop string
		var geom json.RawMessage
		if err := rows.Scan(&osmID, &name, &shop, &geom); err != nil {
			return nil, err
		}
		fc.Features = append(fc.Features, Feature{
			Type:     "Feature",
			Geometry: geom,
			Properties: map[string]any{
				"osm_id": osmID,
				"name":   name,
				"shop":   shop,
			},
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return fc, nil
}

func (fc *FeatureColl) QueryOSMCycling(ctx context.Context, db *pgxpool.Pool, query string) error {
	fc.Type = "FeatureCollection"
	fc.Features = []Feature{}

	rows, err := db.Query(ctx, query)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var osmID, name, surface, bicycle, foot, lit string
		var geom json.RawMessage
		if err := rows.Scan(&osmID, &name, &surface, &bicycle, &foot, &lit, &geom); err != nil {
			return err
		}
		fc.Features = append(fc.Features, Feature{
			Type:     "Feature",
			Geometry: geom,
			Properties: map[string]any{
				"osm_id":  osmID,
				"name":    name,
				"surface": surface,
				"bicycle": bicycle,
				"foot":    foot,
				"lit":     lit,
			},
		})
	}
	if err := rows.Err(); err != nil {
		return err
	}
	return nil
}
