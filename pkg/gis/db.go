package gis

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func UpsertStops(ctx context.Context, db *pgxpool.Pool, d *StopMarkers) error {
	all := make([]StopMarker, 0, len(d.Stops))
	all = append(all, d.Stops...)

	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	const q = `
INSERT INTO gis.metro
    (stop_id, name, typ, wheelchair, routes, tract_geoid, geom)
VALUES
    ($1, $2, $3, $4, $5, $6::jsonb, ST_SetSRID(ST_MakePoint($7, $8), 4326))
ON CONFLICT (stop_id) DO UPDATE SET
    name = EXCLUDED.name,
    typ = EXCLUDED.typ,
    wheelchair = EXCLUDED.wheelchair,
    tract_geoid = EXCLUDED.tract_geoid,
    routes = EXCLUDED.routes,
    geom = EXCLUDED.geom
`
	b := &pgx.Batch{}

	for _, s := range all {
		if s.Coords.Lo == 0 && s.Coords.La == 0 {
			continue
		}

		routesJSON, mErr := json.Marshal(s.Routes)
		if mErr != nil {
			err = fmt.Errorf("marshal routes for stop_id=%s: %w", s.ID, mErr)
			return err
		}

		b.Queue(q, s.ID, s.Name, s.StopType, nullIfEmpty(s.WhlChr),
			routesJSON, nullIfEmpty(s.TractGEOID), s.Coords.Lo, s.Coords.La,
		)
	}

	br := tx.SendBatch(ctx, b)
	for i := 0; i < b.Len(); i++ {
		_, e := br.Exec()
		if e != nil {
			_ = br.Close()
			err = e
			return err
		}
	}
	if err = br.Close(); err != nil {
		return err
	}

	if err = tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func UpsertTracts(ctx context.Context, db *pgxpool.Pool, d *GeoTractFeatures) error {
	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	const q = `
INSERT INTO gis.tracts (
    geoid, county, tract, name,
    arealand, popl, poplsqmi, income, mgrent, age,
    stops_in_tract, bus_stops_in_tract, ml_stops_in_tract,
    pct_has_comp, pct_inc_below_pov,
    geom
) VALUES (
    $1, $2, $3, $4,
    $5, $6, $7, $8, $9, $10,
    $11, $12, $13,
    $14, $15,
    ST_GeomFromText($16, 4326)
)
ON CONFLICT (geoid) DO UPDATE SET
    county = EXCLUDED.county,
    tract = EXCLUDED.tract,
    name = EXCLUDED.name,
    arealand = EXCLUDED.arealand,
    popl = EXCLUDED.popl,
    poplsqmi = EXCLUDED.poplsqmi,
    income = EXCLUDED.income,
    mgrent = EXCLUDED.mgrent,
    age = EXCLUDED.age,
    stops_in_tract = EXCLUDED.stops_in_tract,
    bus_stops_in_tract = EXCLUDED.bus_stops_in_tract,
    ml_stops_in_tract = EXCLUDED.ml_stops_in_tract,
    pct_has_comp = EXCLUDED.pct_has_comp,
    pct_inc_below_pov = EXCLUDED.pct_inc_below_pov,
    geom = EXCLUDED.geom;
`

	b := &pgx.Batch{}

	for _, f := range d.Features {
		wkt, wErr := ringsToWKTPolygon(f.Geometry.Rings)
		if wErr != nil {
			err = wErr
			return err
		}

		a := f.Attributes

		geoid := toString(a["GEOID"])
		if geoid == "" {
			continue
		}

		b.Queue(
			q,
			geoid,
			toString(a["COUNTY"]),
			toString(a["TRACT"]),
			toString(a["NAME"]),
			toInt64(a["AREALAND"]),
			toInt(a["POPL"]),
			toFloat64(a["POPLSQMI"]),
			toInt(a["INCOME"]),
			toInt(a["MGRENT"]),
			toFloat64(a["AGE"]),
			toInt(a["STOPS_IN_TRACT"]),
			toInt(a["BUS_STOPS_IN_TRACT"]),
			toInt(a["ML_STOPS_IN_TRACT"]),
			toFloat64(a["PCT_HAS_COMP"]),
			toFloat64(a["PCT_INC_BELOW_POV"]),
			wkt,
		)
	}

	br := tx.SendBatch(ctx, b)
	for i := 0; i < b.Len(); i++ {
		_, e := br.Exec()
		if e != nil {
			_ = br.Close()
			err = e
			return err
		}
	}
	if err = br.Close(); err != nil {
		return err
	}

	if err = tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func UpsertCounties(ctx context.Context, db *pgxpool.Pool, feats *GeoTractFeatures) error {
	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
	}()

	const q = `
INSERT INTO gis.counties (
    geoid, state, county, name, arealand, geom
) VALUES (
    $1, $2, $3, $4, $5, ST_GeomFromText($6, 4326)
)
ON CONFLICT (geoid) DO UPDATE SET
    state = EXCLUDED.state,
    county = EXCLUDED.county,
    name = EXCLUDED.name,
    arealand = EXCLUDED.arealand,
    geom = EXCLUDED.geom;
`

	b := &pgx.Batch{}

	for _, f := range feats.Features {
		a := f.Attributes

		geoid := toString(a["GEOID"])
		if geoid == "" {
			continue
		}

		wkt, wErr := ringsToWKTPolygon(f.Geometry.Rings)
		if wErr != nil {
			err = fmt.Errorf("geoid=%s: %w", geoid, wErr)
			return err
		}

		b.Queue(
			q,
			geoid,
			toInt(a["STATE"]),
			nullIfEmpty(toString(a["COUNTY"])),
			nullIfEmpty(toString(a["NAME"])),
			toInt64(a["AREALAND"]),
			wkt,
		)
	}

	br := tx.SendBatch(ctx, b)
	for i := 0; i < b.Len(); i++ {
		_, e := br.Exec()
		if e != nil {
			_ = br.Close()
			err = e
			return err
		}
	}
	if err = br.Close(); err != nil {
		return err
	}

	if err = tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func nullIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func ringsToWKTPolygon(rings [][][]float64) (string, error) {
	if len(rings) == 0 || len(rings[0]) < 4 {
		return "", fmt.Errorf("invalid rings: need at least one ring with 4+ points")
	}

	// WKT: POLYGON((x y, x y, ...),(hole...))
	// Ensure each ring is closed.
	sb := strings.Builder{}
	sb.WriteString("POLYGON(")

	for r := 0; r < len(rings); r++ {
		ring := rings[r]
		if len(ring) < 4 {
			return "", fmt.Errorf("invalid ring %d: need 4+ points", r)
		}

		// Close ring if not closed
		first := ring[0]
		last := ring[len(ring)-1]
		if first[0] != last[0] || first[1] != last[1] {
			ring = append(ring, []float64{first[0], first[1]})
		}

		if r > 0 {
			sb.WriteString(",")
		}
		sb.WriteString("(")
		for i := 0; i < len(ring); i++ {
			pt := ring[i]
			if len(pt) < 2 {
				return "", fmt.Errorf("invalid point in ring %d index %d", r, i)
			}
			if i > 0 {
				sb.WriteString(",")
			}
			// x y => lon lat
			sb.WriteString(strconv.FormatFloat(pt[0], 'f', -1, 64))
			sb.WriteString(" ")
			sb.WriteString(strconv.FormatFloat(pt[1], 'f', -1, 64))
		}
		sb.WriteString(")")
	}

	sb.WriteString(")")
	return sb.String(), nil
}

func toString(v any) string {
	if v == nil {
		return ""
	}
	switch t := v.(type) {
	case string:
		return t
	case []byte:
		return string(t)
	default:
		return fmt.Sprint(t)
	}
}

func toInt(v any) int {
	if v == nil {
		return 0
	}
	switch t := v.(type) {
	case int:
		return t
	case int32:
		return int(t)
	case int64:
		return int(t)
	case float64:
		return int(t)
	case string:
		i, _ := strconv.Atoi(t)
		return i
	default:
		i, _ := strconv.Atoi(fmt.Sprint(t))
		return i
	}
}

func toInt64(v any) int64 {
	if v == nil {
		return 0
	}
	switch t := v.(type) {
	case int64:
		return t
	case int:
		return int64(t)
	case float64:
		return int64(t)
	case string:
		i, _ := strconv.ParseInt(t, 10, 64)
		return i
	default:
		i, _ := strconv.ParseInt(fmt.Sprint(t), 10, 64)
		return i
	}
}

func toFloat64(v any) float64 {
	if v == nil {
		return 0
	}
	switch t := v.(type) {
	case float64:
		return t
	case float32:
		return float64(t)
	case int:
		return float64(t)
	case int64:
		return float64(t)
	case string:
		f, _ := strconv.ParseFloat(t, 64)
		return f
	default:
		f, _ := strconv.ParseFloat(fmt.Sprint(t), 64)
		return f
	}
}
