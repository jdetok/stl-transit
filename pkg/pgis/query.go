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
select osm_id, coalesce(name, '') as name, operator, public_transport, 
	coalesce(tags->'network', '') as network,
	coalesce(tags->'wheelchair') as wheelchair,
	coalesce(tags->'bench') as bench,
	coalesce(tags->'kerb') as kerb,
	coalesce(tags->'shelter') as shelter,
	ST_AsGeoJSON(ST_Transform(way, 4326)) as geom
from public.planet_osm_point
where public_transport is not null
and railway is null
and (
	operator in ('Metro Transit', 'Madison County Transit', 'St. Charles Area Transit')
	or tags->'network' like '%Greyhound%')
and tags->'bus' = 'yes'
and way && ST_Transform(ST_MakeEnvelope(-99, 31, -75.5, 46.2, 4326),3857);
	`
	RAIL_STOPS = `
select osm_id, name, operator, public_transport, railway, 
coalesce(tags->'network', '') as network,
case
	when tags->'light_rail' is not null then 'light_rail'
	when tags->'train' is not null then 'train'
end as type,
coalesce(tags->'wheelchair') as wheelchair,
ST_AsGeoJSON(ST_Transform(way, 4326)) as geom
from public.planet_osm_point
where public_transport is not null
and railway is not null
and operator in ('Amtrak', 'Bi-State Development Agency')
and way && ST_Transform(ST_MakeEnvelope(-99, 31, -75.5, 46.2, 4326),3857)
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
