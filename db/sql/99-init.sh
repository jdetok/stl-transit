#!/usr/bin/env bash
set -euo pipefail

PBF_FILES=(
    "missouri-260228.osm.pbf"
    "illinois-260228.osm.pbf"
)

psql -v ON_ERROR_STOP=1 \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;
SQL

FIRST=true

for FILE in "${PBF_FILES[@]}"; do
    FULL_PATH="/data/pbf/${FILE}"

    echo "Importing ${FULL_PATH}"

    if [ ! -f "${FULL_PATH}" ]; then
        echo "ERROR: File not found: ${FULL_PATH}"
        exit 1
    fi

    if [ "$FIRST" = true ]; then
        MODE="--create"
        FIRST=false
    else
        MODE="--append"
    fi

    PGHOST=/var/run/postgresql \
    PGPORT=5432 \
    PGDATABASE="$POSTGRES_DB" \
    PGUSER="$POSTGRES_USER" \
    PGPASSWORD="$POSTGRES_PASSWORD" \
    osm2pgsql -v \
        $MODE \
        --slim \
        --hstore \
        --multi-geometry \
        --cache 2000 \
        "$FULL_PATH"
done

echo "imports complete"