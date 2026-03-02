create extension if not exists postgis;

create schema if not exists test;
create table if not exists test.point (
    id serial primary key,
    geom geometry
);
-- generate test points
with x as (
    select generate_series(1,10000),
    st_setsrid(st_makepoint(
        (-91 + random() * (-89.5- (-91)))::float,
        (38.4 + random() * (39.2 - 38.4))::float
    ), 4326) geom
) insert into test.point (geom) select geom from x;

create table if not exists gis.metro (
    id bigserial primary key,
    stop_id text unique not null,
    name text not null,
    typ text not null,
    wheelchair text not null,
    tract_geoid text,
    routes jsonb not null default '[]'::jsonb,
    geom geometry(Point, 4326) not null
);

create index if not exists gix_metro_stops on gis.metro using gist (geom);

create table if not exists gis.tracts (
    id bigserial primary key,
    geoid text unique not null,
    county text,
    tract text,
    name text,
    arealand bigint,
    popl int,
    poplsqmi double precision,
    income double precision,
    mgrent double precision,
    age double precision,
    stops_in_tract int,
    bus_stops_in_tract int,
    ml_stops_in_tract int,
    pct_has_comp double precision,
    pct_inc_below_pov double precision,
    geom geometry(Polygon, 4326) not null
);

create index if not exists gix_tracts on gis.tracts using gist (geom);

create table if not exists gis.counties (
    id bigserial primary key,
    geoid text unique not null,
    state int,
    county text,
    name text,
    arealand bigint,
    geom geometry(Polygon, 4326) not null
);

create index if not exists gix_counties on gis.counties using gist (geom);

-- handle raw json imports
create schema if not exists raw;
create table raw.gjson (raw jsonb);

create schema if not exists gis;
create table if not exists gis.stops (
    id bigserial primary key,
    name varchar(255),
    geo geography(point, 4326)
);

create table if not exists gis.transit (
	id bigserial primary key,
	name text not null,
	county text,
	network text,
	wheelchair text,
	geom geometry(Point, 4326)
);

create index if not exists gix_transit on gis.transit using gist (geom);
create index if not exists gix_transit_name on gis.transit (name);
create index if not exists gix_transit_county on gis.transit (county);

-- QUERY TO INSERT INTO TRANSIT TABLE:
with metro as (
	select a.name as county, b.name, 'Metro Transit' as network, b.wheelchair, b.geom
	from gis.counties a
	join gis.metro b on ST_Contains(a.geom, b.geom)
), osm as (
	select coalesce(name, '') as name,  
		case
			when tags->'network' like '%Greyhound%' then 'Greyhound'
			when tags->'network' like '%SCAT%' then operator
			when tags->'network' is null and operator is not null then operator
			else coalesce(tags->'network', '')
		end as network,
		case 
			when tags->'wheelchair' = 'yes' then 'POSSIBLE'
			when tags->'wheelchair' = 'no' then 'NOT_POSSIBLE'
			else 'NA'
		end as wheelchair,
		ST_Transform(way, 4326) as geom
	from public.planet_osm_point
	where public_transport is not null
	and (railway is null or operator = 'Amtrak')
	and (
		operator in ('Amtrak', 'Madison County Transit', 'St. Charles Area Transit')
		or tags->'network' like '%Greyhound%')
	and (tags->'bus' = 'yes' or operator = 'Amtrak')
	and way && ST_Transform(ST_MakeEnvelope(-99, 31, -75.5, 46.2, 4326),3857)
)
insert into gis.transit (name, county, network, wheelchair, geom)
select * from (
	select m.name, m.county, m.network, m.wheelchair, m.geom
	from metro m
	union all
	select o.name, null, o.network, o.wheelchair, o.geom
	from osm o
)
;