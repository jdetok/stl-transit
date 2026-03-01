package pgis

const (
	GROCERY_STORES = `
select
	osm_id,
	COALESCE(name, '') AS name,
	shop,
	ST_AsGeoJSON(ST_Transform(way, 4326)) AS geom
from planet_osm_polygon
where shop = 'supermarket'
and way && ST_Transform(ST_MakeEnvelope(-99.11,31.77,-75.54,45.87, 4326), 3857)
	`
	BUS_STOPS = `
	
	`
	CYCLING_PATHS = `
select osm_id,
	coalesce(name, '') as name,
	coalesce(surface, '') as surface,
	coalesce(bicycle, '') as bicycle,
	coalesce(foot, '') as foot,
	coalesce(tags->'lit', '') as lit,
	ST_AsGeoJSON(ST_Transform(way, 4326)) AS geom
from public.planet_osm_line
where highway='cycleway'
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
)
`
)
