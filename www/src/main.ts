// import esriConfig from "@arcgis/core/config"
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Field from "@arcgis/core/layers/support/Field";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import type Renderer from "@arcgis/core/renderers/Renderer";
import "@arcgis/core/assets/esri/themes/light/main.css";

// local imports
import * as gbl from "./global.js"
import { declareCustomElements } from "./cmp/cmp.js"

const POPLMAP_ALPHA = 0.15;
const BUS_STOP_SIZE = 3.5;
const ML_STOP_SIZE = 8;
const BUS_STOP_COLOR = 'mediumseagreen';
const MLB_STOP_COLOR = 'blue';
const MLR_STOP_COLOR = 'red';
const MLC_STOP_COLOR = 'purple';
const BUS = 'Bus';
const ML = 'Light Rail';
const RouteTypes: Record<RouteType, string> = {
    bus: BUS,
    mlr: ML,
    mlb: ML,
    mlc: ML
};

type StopMarkers = {stops: StopMarker[]}
type StopMarker = {
    id: string | number,
    name: string,
    typ: RouteType,
    routes: Route[],
    yx: Coordinates,
}
type Route = {
    id: string | number,
    name: string,
    nameLong: string,
}
type Coordinates = { latitude: number, longitude: number, name: string, typ: RouteType };
type RouteType = 'bus' | 'mlr' | 'mlb' | 'mlc';

type FeatureLayerMeta = {
    title: string,
    dataUrl?: string,
    renderer: Renderer,
    popupTemplate?: __esri.PopupTemplateProperties,
    fields?: __esri.FieldProperties[],
    source?: any,
    geometryType?: any
}

const LAYER_CENSUS_COUNTIES: FeatureLayerMeta = {
    title: "St. Louis MSA Counties",
    dataUrl: "/counties",
    geometryType: "polygon",
    fields: [
        { name: "NAME", alias: "Name", type: "string" },
    ],
    renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
            color: [255, 255, 255, 0.05],
            outline: new SimpleLineSymbol({
                // color: [250, 250, 250, 0.5],
                width: 1.5,
                style: "solid"
            })
        })
    }),
    popupTemplate: {
        title: "{NAME}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "STATE", label: "State: " },
                { fieldName: "NAME", label: "County: " },
            ]
        }],
    },
};

const LAYER_CENSUS_TRACTS: FeatureLayerMeta = {
    title: "Census Tract Population Density",
    dataUrl: "/tracts",
    geometryType: "polygon",
    fields: [
        { name: "GEOID", alias: "GEOID", type: "string" },
        { name: "TRACT", alias: "Tract", type: "string" },
        { name: "POPL", alias: "Population", type: "double" },
        { name: "POPLSQMI", alias: "Population/Mi^2", type: "double" },
    ],
    renderer: new ClassBreaksRenderer({
        field: "POPLSQMI",
        classBreakInfos: [
            { minValue: 0, maxValue: 2500, symbol: new SimpleFillSymbol({ color: [94, 150, 98, POPLMAP_ALPHA] }) },
            { minValue: 2500, maxValue: 5000, symbol: new SimpleFillSymbol({ color: [17, 200, 152, POPLMAP_ALPHA] }) },
            { minValue: 5000, maxValue: 7500, symbol: new SimpleFillSymbol({ color: [0, 210, 255, POPLMAP_ALPHA] }) },
            { minValue: 7500, maxValue: 10000, symbol: new SimpleFillSymbol({ color: [44, 60, 255, POPLMAP_ALPHA] }) },
            { minValue: 10000, maxValue: 99999, symbol: new SimpleFillSymbol({ color: [50, 1, 63, POPLMAP_ALPHA] }) },
        ],
    }),
    popupTemplate: {
        title: "Census Tract {TRACT}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "POPL", label: "Population: " },
                { fieldName: "POPLSQMI", label: "Population/Mi^2: " },
            ]
        }]
    },
};

// ENTRY POINT
window.addEventListener("DOMContentLoaded", () => {
    declareCustomElements();
    const map = new Map({
        basemap: gbl.BASEMAP
    });
    const view = new MapView({
        container: gbl.MAP_CONTAINER,
        map: map,
        extent: {
            xmin: gbl.STLCOORDS.xmin,
            ymin: gbl.STLCOORDS.ymin,
            xmax: gbl.STLCOORDS.xmax,
            ymax: gbl.STLCOORDS.ymax,
            spatialReference: { wkid: gbl.STLWKID }
        },
        popupEnabled: true,
        popup: {
            dockEnabled: false,
            dockOptions: {buttonEnabled: false}
        }
    });
    view.when(async () => { // ADD LAYERS TO MAP VIEW
        await Promise.all([
            buildStopLayers(map),
            buildFeatureLayer(map, LAYER_CENSUS_COUNTIES, 0),
            buildFeatureLayer(map, LAYER_CENSUS_TRACTS, 1),
        ]);
        buildLegend(view);
    }, (e: Error) => console.error("failed to build or display map:", e))
});

async function buildFeatureLayer(map: Map, meta: FeatureLayerMeta, idx?: number): Promise<void> {
    try {
        map.add(await makeFeatureLayer(meta), idx);
    } catch (e) { throw new Error(`failed to build layer: ${e}`) }
}

async function makeFeatureLayer(meta: FeatureLayerMeta): Promise<FeatureLayer> {
    try {
        if (meta.dataUrl) {
            const res = await fetch(meta.dataUrl);
            const data = await res.json();
            console.log("layer data:", data);
            meta.source = data.features.map((f: any) => new Graphic({
                geometry: new Polygon({
                    rings: f.geometry.rings,
                    spatialReference: { wkid: gbl.STLWKID }
                }),
                attributes: f.attributes,
            }));
            // meta.source = data.features.map((f: any) => Graphic.fromJSON({
            //     geometry: f.geometry,
            //     attributes: f.attributes,
            // }));
            console.log("first tract:", data.features[0].attributes);
        }
    } catch(e) { throw new Error("no data source for layer: " + meta.title); }
    // fallback for url-based layers if you ever need one
    return new FeatureLayer({
        title: meta.title,
        source: meta.source,
        objectIdField: "ObjectID",  // add this
        geometryType: "polygon",
        spatialReference: { wkid: gbl.STLWKID },  // add this too
        renderer: meta.renderer,
        popupTemplate: meta.popupTemplate,
        fields: meta.fields,
    });
}

// wait for layers to exist then add expandable legend to map
// as long as the layers have a title and renderer function they will add to the legend automatically
function buildLegend(view: MapView) {
    view.ui.add(new Expand({
        view,
        content: new Legend({
            view: view,
        }),
        expanded: true,
    }), "top-right");
}

// get metro stops from backend
async function getStops(): Promise<StopMarkers> {
    const res = await fetch("/stops");
    if (!res.ok) {
        throw new Error(`failed to fetch`)
    }
    return await res.json();
}

// create and add feature layers to map for each stop category
async function buildStopLayers(map: Map): Promise<void> {
    const stopMarkers = await getStops();
    
    const bus: StopMarker[] = [];
    const mlc: StopMarker[] = [];
    const mlb: StopMarker[] = [];
    const mlr: StopMarker[] = [];

    stopMarkers.stops.forEach((s) => {
        switch (s.typ) {
            case 'bus': bus.push(s); break;
            case 'mlc': mlc.push(s); break;
            case 'mlb': mlb.push(s); break;
            case 'mlr': mlr.push(s); break;
        }
    });
    return (async function () {
        map.add(await makeStopLayer(bus, 'MetroBus Stops', BUS_STOP_COLOR, BUS_STOP_SIZE));
        map.add(await makeStopLayer(mlc, 'MetroLink Blue/Red Line Stops', MLC_STOP_COLOR, ML_STOP_SIZE));
        map.add(await makeStopLayer(mlb, 'MetroLink Blue Line Stops', MLB_STOP_COLOR, ML_STOP_SIZE));
        map.add(await makeStopLayer(mlr, 'MetroLink Red Line Stops', MLR_STOP_COLOR, ML_STOP_SIZE));
    })();
}

// make feature layers for a specific stop category 
async function makeStopLayer(stops: StopMarker[],
    title: string,
    color: string,
    size: number
): Promise<FeatureLayer> {
    const source = stops.map((s) => new Graphic({
        geometry: new Point({ latitude: s.yx.latitude, longitude: s.yx.longitude }),
        attributes: {
            name: s.name,
            type: RouteTypes[s.typ],
            routes: s.routes.map(r => `${r.name}-${r.nameLong}`).join(", "),
        }
    }))
    return new FeatureLayer({
        title,
        source,
        spatialReference: { wkid: gbl.STLWKID },
        objectIdField: "ObjectID",
        geometryType: "point",
        fields: [
            new Field({ name: "name", alias: "Name", type: "string" }),
            new Field({ name: "type", alias: "Service Type", type: "string" }),
            new Field({ name: "routes", alias: "Routes Served", type: "string" }),
        ],
        renderer: new SimpleRenderer({
            symbol: createMarkerSymbol(color, size),
        }),
        popupTemplate: {
            title: "{type} Stop: {name}",
            content: [
                {
                    type: "fields", fieldInfos: [
                        { fieldName: "routes", label: "Routes Served:" },
                    ]
                }
            ]
        },
    });
}

function createMarkerSymbol(color: string, size: number) {
    return new SimpleMarkerSymbol({
        style: 'circle',
        color: color,
        size: size
    }); 
}