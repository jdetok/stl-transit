import esriConfig from "@arcgis/core/config"
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Field from "@arcgis/core/layers/support/Field";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import type Renderer from "@arcgis/core/renderers/Renderer";
import "@arcgis/core/assets/esri/themes/light/main.css";

const ARCGIS_PROXY_BASE = `${window.location.origin}/P3ePLMYs2RVChkJx/arcgis/rest/services`;
const MO_COUNTIES: Record<string, string> = {
    "St. Louis County": "189",
    "St. Louis city": "510",
    "St. Charles County": "183",
    "Jefferson County": "099",
    "Franklin County": "071",
    "Warren County": "219",
}
const IL_COUNTIES: Record<string, string> = {
    "St. Clair County": "163",
    "Madison County": "119",
    "Monroe County": "133",
    "Jersey County": "083",
    "Calhoun County": "013",
    "Macoupin County": "117",
    "Clinton County": "027",
    "Bond County": "005",
}
const MO_COUNTY_NAMES = Object.keys(MO_COUNTIES).join("','");
const IL_COUNTY_NAMES = Object.keys(IL_COUNTIES).join("','");
const MO_COUNTY_FIPS = Object.values(MO_COUNTIES).join("','");
const IL_COUNTY_FIPS = Object.values(IL_COUNTIES).join("','");
const ARCGIS_CENSUS_TRACTS_EXP = `(STATE_FIPS = '29' AND COUNTY_FIPS IN ('${MO_COUNTY_FIPS}')) OR (STATE_FIPS = '17' AND COUNTY_FIPS IN ('${IL_COUNTY_FIPS}'))`;
const ARCGIS_CENSUS_COUNTIES_EXP = `(STATE_ABBR = 'MO' AND NAME IN ('${MO_COUNTY_NAMES}')) OR (STATE_ABBR = 'IL' AND NAME IN ('${IL_COUNTY_NAMES}'))`;
const POPLMAP_ALPHA = 0.15;
const BUS_STOP_SIZE = 3.5;
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

type FeatureLayerMetaOld = {
    title: string,
    url: string,
    defEx: string,
    renderer: Renderer,
    popupTemplate?: __esri.PopupTemplateProperties,
    popupEnabled?: boolean,
    idx?: number,
};

type FeatureLayerMeta = {
    title: string,
    dataUrl?: string,      // your backend endpoint
    renderer: Renderer,
    popupTemplate?: __esri.PopupTemplateProperties,
    fields?: __esri.FieldProperties[],
}

const LAYER_CENSUS_COUNTIES: FeatureLayerMeta = {
    title: "St. Louis MSA Counties",
    dataUrl: "/census/counties",
    fields: [
        { name: "NAME", alias: "Name", type: "string" },
        { name: "STATE_ABBR", alias: "State", type: "string" },
        { name: "POPULATION", alias: "Population", type: "integer" },
    ],
    renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
            color: [255, 255, 255, 0.05],
            outline: new SimpleLineSymbol({
                color: [250, 250, 250, 0.8],
                width: 2,
                style: "solid"
            })
        })
    }),
    popupTemplate: {
        title: "{NAME}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "STATE_ABBR", label: "State: " },
                { fieldName: "POPULATION", label: "Population: " },
            ]
        }],
    },
};

const LAYER_CENSUS_TRACTS: FeatureLayerMeta = {
    title: "Census Tract Population Density",
    dataUrl: "/census/tracts",
    fields: [
        { name: "TRACT_FIPS", alias: "Tract FIPS", type: "string" },
        { name: "STATE_ABBR", alias: "State", type: "string" },
        { name: "STATE_FIPS", alias: "State FIPS", type: "string" },
        { name: "COUNTY_FIPS", alias: "County FIPS", type: "string" },
        { name: "POPULATION", alias: "Population", type: "integer" },
        { name: "POP_SQMI", alias: "Population/Mi^2", type: "double" },
    ],
    renderer: new ClassBreaksRenderer({
        field: "POP_SQMI",
        classBreakInfos: [
            { minValue: 0, maxValue: 2500, symbol: new SimpleFillSymbol({ color: [94, 150, 98, POPLMAP_ALPHA] }) },
            { minValue: 2500, maxValue: 5000, symbol: new SimpleFillSymbol({ color: [17, 200, 152, POPLMAP_ALPHA] }) },
            { minValue: 5000, maxValue: 7500, symbol: new SimpleFillSymbol({ color: [0, 210, 255, POPLMAP_ALPHA] }) },
            { minValue: 7500, maxValue: 10000, symbol: new SimpleFillSymbol({ color: [44, 60, 255, POPLMAP_ALPHA] }) },
            { minValue: 10000, maxValue: 99999, symbol: new SimpleFillSymbol({ color: [50, 1, 63, POPLMAP_ALPHA] }) },
        ],
    }),
    popupTemplate: {
        title: "{STATE_ABBR} Census Tract {TRACT_FIPS}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "STATE_ABBR", label: "State: " },
                { fieldName: "STATE_FIPS", label: "State FIPS: " },
                { fieldName: "COUNTY_FIPS", label: "County FIPS: " },
                { fieldName: "POPULATION", label: "Population: " },
                { fieldName: "POP_SQMI", label: "Population/Mi^2: " },
            ]
        }]
    },
};

const LAYER_CENSUS_COUNTIES_OLD: FeatureLayerMetaOld = {
    title: "St. Louis MSA Counties",
    // url: `https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0`,
    url: "/census/counties",
    defEx: ARCGIS_CENSUS_COUNTIES_EXP,
    renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
            color: [255, 255, 255, 0.05],
            outline: new SimpleLineSymbol({
                color: [250, 250, 250, 0.8],
                width: 2,
                style: "solid"
            })
        })
    }),
    popupTemplate: {
        title: "{NAME}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "STATE_ABBR", label: "State: " },
                { fieldName: "POPULATION", label: "Population: " },
            ]
        }],
    },
};

const LAYER_CENSUS_TRACTS_OLD: FeatureLayerMetaOld = {
    title: "Census Tract Population Density",
    // url: `${ARCGIS_PROXY_BASE}/USA_Census_Tracts/FeatureServer/0`,
    url: "/census/tracts",
    // url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/",
    defEx: ARCGIS_CENSUS_TRACTS_EXP,
    renderer: new ClassBreaksRenderer({
        field: "POP_SQMI",
        classBreakInfos: [
            { minValue: 0, maxValue: 2500, symbol: new SimpleFillSymbol({ color: [94, 150, 98, POPLMAP_ALPHA] }) },
            { minValue: 2500, maxValue: 5000, symbol: new SimpleFillSymbol({ color: [17, 200, 152, POPLMAP_ALPHA] }) },
            { minValue: 5000, maxValue: 7500, symbol: new SimpleFillSymbol({ color: [0, 210, 255, POPLMAP_ALPHA] }) },
            { minValue: 7500, maxValue: 10000, symbol: new SimpleFillSymbol({ color: [44, 60, 255, POPLMAP_ALPHA] }) },
            { minValue: 10000, maxValue: 99999, symbol: new SimpleFillSymbol({ color: [50, 1, 63, POPLMAP_ALPHA] }) },
        ],
    }),
    popupTemplate: {
        title: "{STATE_ABBR} Census Tract {TRACT_FIPS}",
        content: [{
            type: "fields",
            fieldInfos: [
                { fieldName: "STATE_ABBR", label: "State: " },
                { fieldName: "STATE_FIPS", label: "State FIPS: " },
                { fieldName: "COUNTY_FIPS", label: "County FIPS: " },
                { fieldName: "POPULATION", label: "Population: " },
                { fieldName: "POP_SQMI", label: "Population/Mi^2: " },
            ]
        }]
    }
};

// ENTRY POINT
window.addEventListener("DOMContentLoaded", () => {
    // esriConfig.apiKey = (window as any).ARCGIS_API_KEY;
    // esriConfig.request.proxyUrl = `${window.location.origin}/arcgis-proxy`;
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
    let source: any; 
    try {
        if (meta.dataUrl) {
            const res = await fetch(meta.dataUrl);
            const data = await res.json();
            console.log("spatialRef:", data[0]?.geometry?.spatialReference);
            console.log("first feature:", data[0]);
            console.log(data);
            source = data.map((f: any) => Graphic.fromJSON({
                geometry: f.geometry,
                attributes: f.attributes,
            }));
        }
    } catch(e) { throw new Error("no data source for layer: " + meta.title); }
    // fallback for url-based layers if you ever need one
    return new FeatureLayer({
        title: meta.title,
        source,
        objectIdField: "ObjectID",  // add this
        geometryType: "polygon",
        spatialReference: { wkid: STLWKID },  // add this too
        renderer: meta.renderer,
        popupTemplate: meta.popupTemplate,
        fields: meta.fields,
    });
}

// BUILD FEATURE LATER FROM AN EXISTING HOSTED FEATURE SERVICE
async function buildFeatureLayerOld(map: Map, meta: FeatureLayerMetaOld, idx?: number): Promise<void> {
    return map.add(await makeFeatureLayerOld(meta), idx);
}
async function makeFeatureLayerOld(meta: FeatureLayerMetaOld): Promise<FeatureLayer> {
    return new FeatureLayer({
        title: meta.title,
        url: meta.url,
        definitionExpression: meta.defEx,
        renderer: meta.renderer,
        popupTemplate: meta.popupTemplate,
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
        spatialReference: { wkid: STLWKID },
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