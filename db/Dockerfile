FROM --platform=linux/amd64 postgis/postgis:18-3.6

RUN mkdir /data
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    osm2pgsql ca-certificates \
    && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=5 \
  CMD ["pg_isready", "-h", "localhost", "-U", "gis"]