import esriConfig from "@arcgis/core/config"
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import "@arcgis/core/assets/esri/themes/light/main.css";

const BUS_STOP_SIZE = 3;
const ML_STOP_SIZE = 8;
const BUS_STOP_COLOR = 'mediumseagreen';
const MLB_STOP_COLOR = 'blue';
const MLR_STOP_COLOR = 'red';
const MLC_STOP_COLOR = 'purple';

const BASEMAP = 'dark-gray';
const MAP_CONTAINER = 'map';
const STLWKID = 4326;
const STLCOORDS = {
    xmin: -90.32,
    ymin: 38.53,
    xmax: -90.15,
    ymax: 38.75,
};

type StopMarkers = {stops: StopMarker[]}

type StopMarker = {
    id: string | number,
    name: string,
    typ: RouteType,
    routes: Route[],
    coords: Coordinates,
}

type Route = {
    id: string | number,
    name: string,
}

type Coordinates = { latitude: number, longitude: number, name: string, typ: RouteType };

type RouteType = 'bus' | 'mlr' | 'mlb' | 'mlc';

const RouteTypes: Record<RouteType, string> = {
    bus: 'MetroBus',
    mlr: 'MetroLink Red Line',
    mlb: 'MetroLink Blue Line',
    mlc: 'MetroLink Red/Blue Line'
}

window.addEventListener("DOMContentLoaded", () => {
    esriConfig.apiKey = (window as any).ARCGIS_API_KEY;
    const map = new Map({
        basemap: BASEMAP
    });

    const view = new MapView({
        container: MAP_CONTAINER,
        map: map,
        extent: {
            xmin: STLCOORDS.xmin,
            ymin: STLCOORDS.ymin,
            xmax: STLCOORDS.xmax,
            ymax: STLCOORDS.ymax,
            spatialReference: { wkid: STLWKID }
        },
        popupEnabled: true,
        popup: {
            dockEnabled: false,
            dockOptions: {buttonEnabled: false}
        }
    });
    view.when(
        async () => {
            // TODO ASAP: CONVERT LAYER TO USE NEW METRO STOPS ENDPOINT
            console.log(await getMetroStops());
            await buildStopLayers(map);
         },
        (e: Error) => console.error("failed to build or display map:", e)
    );
});

// get metro bus and train stops from go server & create graphics for each on layers
async function buildStopLayers(map: Map) {
    let busStops: Coordinates[] = [];
    let mlStops: Coordinates[] = [];
    let stopLayersToAdd: Coordinates[][] = [busStops, mlStops];

    const allStops = await getStops();

    allStops.forEach((c) => {
        c.typ === 'bus' ? busStops.push(c) : mlStops.push(c);
    });

    for (const sl of stopLayersToAdd) {
        map.add(makeStopLayer(sl));
    }
}

function makeStopLayer(coords: Coordinates[]): GraphicsLayer {
    let layer = new GraphicsLayer();
    let graphics: Graphic[] = [];
    coords.forEach((c) => {
        graphics.push(makeStopGraphic(c));
    });
    layer.addMany(graphics);
    return layer;
}

function makeStopGraphic(c: Coordinates): Graphic {
    const color = (
        (c.typ == 'bus') ? BUS_STOP_COLOR :
        (c.typ == 'mlc') ? MLC_STOP_COLOR :
        (c.typ == 'mlb') ? MLB_STOP_COLOR : MLR_STOP_COLOR
    );
    return new Graphic({
        geometry: new Point({ latitude: c.latitude, longitude: c.longitude }),
        symbol: createMarkerSymbol(color, (c.typ == 'bus') ? BUS_STOP_SIZE : ML_STOP_SIZE),
        attributes: {
            "name": c.name,
            "type": RouteTypes[c.typ],
        },
        popupTemplate: {
            title: "{name}",
            content: [
                { type: "fields", fieldInfos: [{ fieldName: "type", label: "Route Type" }] }
            ]
        },
    });
}

async function getStops(): Promise<Coordinates[]> {
    const res = await fetch("/stops");
    if (!res.ok) {
        throw new Error(`failed to fetch`)
    }
    const data = await res.json();
    console.trace(`response: ${data.length}`);
    return data;
}

async function getMetroStops(): Promise<StopMarkers> {
    const res = await fetch("/metrostops");
    if (!res.ok) {
        throw new Error(`failed to fetch`)
    }
    const data = await res.json();
    console.trace(`response: ${data.length}`);
    return data;
}


function createMarkerSymbol(color: string, size: number) {
    return new SimpleMarkerSymbol({
        style: 'circle',
        color: color,
        size: size
    }); 
}