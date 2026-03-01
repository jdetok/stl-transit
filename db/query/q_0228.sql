-- QUERIES TO OSM DATABASE

-- all grocery stores
select * from public.planet_osm_polygon
where shop in ('greengrocer', 'grocery', 'supermarket', 'deli', 'farm', 'butcher', 'seafood', 'bakery', 'convenience')
AND way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);

-- schools
select * from public.planet_osm_polygon
where amenity in ('school', 'college', 'university', 'kindergarten')
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);
-- social facilities
select * from public.planet_osm_polygon
where amenity in ('social_facility', 'social_facility', 'social_center', 'social_centre')
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);
 
 -- entertainment etc
select * from public.planet_osm_polygon
where amenity in ('theatre', 'stadium', 'stage', 
 	'ampitheatre', 'stripclub', 'banquet_hall', 'batting_cage',
 	'bicycle_rental', 'biergarten', 'casino', 'cinema', 'clubhouse',
 	'driving_range', 'dojo', 'events_venue', 'hookah_lounge', 'nightclub',
 	'planetarium', 'pub', 'bar', 'arts_centre')
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);

-- bus stops
select * from public.planet_osm_point
where public_transport is not null
and railway is null
and operator is not null
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);
 
-- rail stops
select * from public.planet_osm_point
where public_transport is not null
and railway is not null
and operator is not null
and way && ST_Transform(
    ST_MakeEnvelope(-91, 38, -89.5, 39.2, 4326),
    3857
);

-- include chicago
select osm_id, name, operator, public_transport, covered, highway, way  
from public.planet_osm_point
where public_transport is not null
and railway is null
and operator is not null
and way && ST_Transform(
    ST_MakeEnvelope(-99.11,31.77,-75.54,45.87, 4326),
    3857
);
 

select osm_id, name, operator, public_transport, covered, highway, way   
from public.planet_osm_point
where public_transport is not null
and railway is not null
and operator is not null
and way && ST_Transform(
    ST_MakeEnvelope(-99.11,31.77,-75.54,45.87, 4326),
    3857
);
 