create extension if not exists postgis;
create extension if not exists hstore;

-- osm tables exist in public schema
create schema if not exists acs;
create schema if not exists tgr;
create schema if not exists metro;