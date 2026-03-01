FROM --platform=linux/amd64 postgis/postgis:18-3.6

RUN mkdir /data
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    osm2pgsql ca-certificates \
    && rm -rf /var/lib/apt/lists/*
