create extension if not exists postgis;

create schema if not exists test;
create table if not exists test.point (
    id serial primary key,
    geom geometry
);

-- generate test points
with x as (
    select generate_series(1,10000),
    st_setSRID(st_makepoint(
        (-91 + random() * (-89.5- (-91)))::float,
        (38.4 + random() * (39.2 - 38.4))::float
    ), 4326) geom
) insert into test.point (geom) select geom from x;

-- handle raw json imports
create schema if not exists raw;
create table raw.gjson (raw jsonb);

create schema if not exists gis;
create table if not exists gis.stops (
    id bigserial primary key,
    name varchar(255),
    geo geography(point, 4326)
);

create table if not exists gis.parks (
    id bigserial primary key,
    osm_id text,
    name text,
    leisure text,
    description text,
    city text,
    state text,
    postcode text,
    housenumber text,
    street text,
    phone text,
    website text,
    opening_hours text,
    geom geometry(Geometry, 4326)
);

-- read the geojson file, insert into tmp tale as raw jsonb, parse into gis.parks 
create or replace procedure gis.load_parks_from_gjson()
language plpgsql
as $$
begin
    truncate table raw.gjson;
    insert into raw.gjson(raw) select pg_read_file('/data/parks.geojson')::jsonb;

    insert into gis.parks (
        osm_id, name, leisure, description,
        city, state, postcode, housenumber, street,
        phone, website, opening_hours,
        geom
    )
    select
        p->>'@id',
        p->>'name',
        p->>'leisure',
        p->>'description',
        p->>'addr:city',
        p->>'addr:state',
        p->>'addr:postcode',
        p->>'addr:housenumber',
        p->>'addr:street',
        p->>'phone',
        p->>'website',
        p->>'opening_hours',
        case
            when f->'geometry' is null or f->'geometry' = 'null'::jsonb then null
            else st_setsrid(
                st_makevalid(st_geomfromgeojson(f->>'geometry')),
                4326
            )
        end as geom
    from raw.gjson t
    cross join lateral jsonb_array_elements(t.raw->'features') as f
    cross join lateral (select f->'properties' as p) pr;
    
    truncate table raw.gjson;
end;
$$;

call gis.load_parks_from_gjson();