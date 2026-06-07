FROM postgres:18

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgis postgresql-18-postgis-3 osmium-tool osm2pgsql ca-certificates curl unzip gdal-bin \
    && rm -rf /var/lib/apt/lists/*