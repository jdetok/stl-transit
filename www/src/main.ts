import esriConfig from "@arcgis/core/config"
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import "@arcgis/core/assets/esri/themes/light/main.css";

const BUS_STOP_SIZE = 3;
const ML_STOP_SIZE = 8;
const BUS_STOP_COLOR = 'mediumseagreen';
const MLB_STOP_COLOR = 'blue';
const MLR_STOP_COLOR = 'red';
const MLC_STOP_COLOR = 'purple';

const STOP_SCALE_STEP = 0.25;
const STOP_SCALE_MIN = 0.25;
const STOP_SCALE_MAX = 10;

const busStopGraphics: Graphic[] = [];
const mlGraphics: Graphic[] = [];

const BASEMAP = 'dark-gray';
const MAP_CONTAINER = 'map';
const STLWKID = 4326;
const STLCOORDS = {
    xmin: -90.32,
    ymin: 38.53,
    xmax: -90.15,
    ymax: 38.75,
};

type Coordinates = { latitude: number, longitude: number, name: string, typ: RouteType };
type RouteType = 'bus' | 'mlr' | 'mlb' | 'mlc';

window.addEventListener("DOMContentLoaded", () => {
    esriConfig.apiKey = (window as any).ARCGIS_API_KEY;

    let busStopScale = 1;
    busStopSizeButtons(busStopScale);

    let metroStopScale = 1;
    metroStopSizeButtons(metroStopScale);

    const map = new Map({
        basemap: BASEMAP
    });

    const view = new MapView({
        container: MAP_CONTAINER,
        map,
        extent: {
            xmin: STLCOORDS.xmin,
            ymin: STLCOORDS.ymin,
            xmax: STLCOORDS.xmax,
            ymax: STLCOORDS.ymax,
            spatialReference: { wkid: STLWKID }
        }
    });
    view.when(
        async () => { await placeStopsOnMap(view); },
        (e: Error) => console.error("failed to build or display map:", e)
    );
});

async function placeStopsOnMap(view: MapView) {
    const stops = await getStops();
    stops.forEach((c) => placeMarkerAtCoords(view, c, busStopGraphics, mlGraphics));
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

function createMarkerSymbol(color: string, size: number) {
    return new SimpleMarkerSymbol({
        style: 'circle',
        color: color,
        size: size
    });
}

function placeMarkerAtCoords(view: MapView, coords: Coordinates, busGraphics: Graphic[], mlGraphics: Graphic[]) {
    const color = (
        (coords.typ == 'bus') ? BUS_STOP_COLOR :
        (coords.typ == 'mlc') ? MLC_STOP_COLOR :
        (coords.typ == 'mlb') ? MLB_STOP_COLOR : MLR_STOP_COLOR
    );

    const pointGraphic = new Graphic({
        geometry: new Point({ latitude: coords.latitude, longitude: coords.longitude }),
        symbol: createMarkerSymbol(color, (coords.typ == 'bus') ? BUS_STOP_SIZE : ML_STOP_SIZE)
    });

    coords.typ == 'bus' ? busGraphics.push(pointGraphic) : mlGraphics.push(pointGraphic);
    view.graphics.add(pointGraphic);
}

function updateBusStopSymbols(scale: number) {
    for (const g of busStopGraphics) {
        g.symbol = createMarkerSymbol(BUS_STOP_COLOR, currentBusStopSize(scale));
    }
}

function busStopSizeButtons(scale: number) {
    document.getElementById("buspls")?.addEventListener("click", () => {
        scale = Math.min(STOP_SCALE_MAX, scale + STOP_SCALE_STEP);
        updateBusStopSymbols(scale);
    });
    document.getElementById("busmin")?.addEventListener("click", () => {
        scale = Math.max(STOP_SCALE_MIN, scale - STOP_SCALE_STEP);
        updateBusStopSymbols(scale);
    });
}

function currentBusStopSize(scale: number): number {
    return BUS_STOP_SIZE * scale;
}

function currentMetroStopSize(scale: number): number {
    return ML_STOP_SIZE * scale;
}

function updateMetroStopSymbols(scale: number) {
    for (const g of mlGraphics) {
        g.symbol = createMarkerSymbol(MLC_STOP_COLOR, currentMetroStopSize(scale));
    }
}

function metroStopSizeButtons(scale: number) {
    document.getElementById("mlpls")?.addEventListener("click", () => {
        scale = Math.min(STOP_SCALE_MAX, scale + STOP_SCALE_STEP);
        updateMetroStopSymbols(scale);
    });
    document.getElementById("mlmin")?.addEventListener("click", () => {
        scale = Math.max(STOP_SCALE_MIN, scale - STOP_SCALE_STEP);
        updateMetroStopSymbols(scale);
    });
}
