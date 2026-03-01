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

-- handle raw json imports
create schema if not exists raw;
create table raw.gjson (raw jsonb);

create schema if not exists gis;
create table if not exists gis.stops (
    id bigserial primary key,
    name varchar(255),
    geo geography(point, 4326)
);

CREATE OR REPLACE PROCEDURE gis.load_geojson_create_table(
    p_file_path text,
    p_schema text,
    p_table text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_raw jsonb;
    v_sql text;
    v_cols text;
    v_vals text;

    v_key text;
    v_base text;
    v_col text;
    v_i int;
BEGIN
    v_raw := pg_read_file(p_file_path)::jsonb;

    CREATE TEMP TABLE tmp_key_map (
        orig_key text PRIMARY KEY,
        col_name text UNIQUE
    ) ON COMMIT DROP;

    FOR v_key IN
        SELECT DISTINCT k
        FROM jsonb_array_elements(v_raw->'features') AS f
        CROSS JOIN LATERAL jsonb_object_keys(COALESCE(f->'properties', '{}'::jsonb)) AS k
        ORDER BY 1
    LOOP
        IF v_key = '@id' THEN
            v_base := 'osm_id';
        ELSE
            v_base := lower(v_key);
            v_base := regexp_replace(v_base, '[^a-z0-9]+', '_', 'g');
            v_base := regexp_replace(v_base, '^_+|_+$', '', 'g');

            IF v_base = '' THEN
                v_base := 'prop';
            END IF;

            IF v_base = 'id' THEN
                v_base := 'prop_id';
            ELSIF v_base = 'geom' THEN
                v_base := 'prop_geom';
            END IF;
        END IF;

        v_col := v_base;
        v_i := 2;

        WHILE EXISTS (SELECT 1 FROM tmp_key_map WHERE col_name = v_col) LOOP
            v_col := v_base || '_' || v_i::text;
            v_i := v_i + 1;
        END LOOP;

        INSERT INTO tmp_key_map (orig_key, col_name)
        VALUES (v_key, v_col);
    END LOOP;

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', p_schema);
    EXECUTE format('DROP TABLE IF EXISTS %I.%I', p_schema, p_table);

    v_sql := format(
        'CREATE TABLE %I.%I (
            id bigserial PRIMARY KEY,
            %s,
            geom geometry(Geometry, 4326)
        )',
        p_schema,
        p_table,
        (
            SELECT string_agg(format('%I text', col_name), E',\n            ' ORDER BY col_name)
            FROM tmp_key_map
            WHERE col_name NOT IN ('id', 'geom')
        )
    );

    EXECUTE v_sql;

    SELECT string_agg(format('%I', col_name), ', ' ORDER BY col_name)
    INTO v_cols
    FROM tmp_key_map
    WHERE col_name NOT IN ('id', 'geom');

    SELECT string_agg(format('p->>%L', orig_key), ', ' ORDER BY col_name)
    INTO v_vals
    FROM tmp_key_map
    WHERE col_name NOT IN ('id', 'geom');

    v_sql := format($fmt$
        INSERT INTO %I.%I (%s, geom)
        SELECT
            %s,
            CASE
                WHEN f->'geometry' IS NULL OR f->'geometry' = 'null'::jsonb THEN NULL
                ELSE ST_SetSRID(
                    ST_MakeValid(ST_GeomFromGeoJSON(f->>'geometry')),
                    4326
                )
            END AS geom
        FROM jsonb_array_elements($1->'features') AS f
        CROSS JOIN LATERAL (SELECT COALESCE(f->'properties', '{}'::jsonb) AS p) pr
    $fmt$,
        p_schema,
        p_table,
        v_cols,
        v_vals
    );

    EXECUTE v_sql USING v_raw;
END;
$$;

CALL gis.load_geojson_create_table('/data/gjson/osm_parks.geojson', 'gis', 'parks');
CALL gis.load_geojson_create_table('/data/gjson/osm_cycle.geojson', 'gis', 'cycling');