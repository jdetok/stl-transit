import { UniqueValueProperties } from '@arcgis/core/renderers/support/UniqueValue';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable.js';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import { cplethEls, FeatureLayerMeta } from '@/types';
import LayerPopup from './cmp/LayerPopup';
import { TRACT_CLASSBREAKS } from './data';
import { LINES_FIELDINFOS, LINES_FIELDS, ML_LAYER_TTL, ML_LAYER_URL, STOP_FIELDINFOS,
    STOP_FIELDS, BUS_LAYER_TTL, BUS_LAYER_URL, PLACE_FIELDINFOS, PLACE_FIELDS, AMTRAK_FIELDINFOS, AMTRAK_FIELDS,
    COUNTIES_FIELDINFOS, COUNTIES_FIELDS, COUNTIES_LAYER_TTL, COUNTIES_LAYER_URL, TRACTS_FIELDS,
    TRACTS_LAYER_TTL, TRACTS_LAYER_URL, CYCLE_LAYER_TTL, CYCLE_LAYER_URL, CYCLING_FIELDS, CYCLING_FIELDINFOS,
} from '@/consts';
import { makeChoroplethLevels, toPoint, toPolygon, toPolyline, makePopupContent, tractsField } from '@/utils';

export const BUS_STOP_SIZE = 4;
const BUS_STOP_Y_COLOR = [0, 255, 255, 0.5];
const BUS_STOP_NO_COLOR = [180, 110, 200, 0.5];
const BUS_STOP_NA_COLOR = [0, 165, 255, 0.5];
const ML_STOP_SIZE = 10;
const ML_LINE_SIZE = 3;
const ML_RED_COLOR = [255, 0, 0, 0.2];
const ML_BLUE_COLOR = [0, 0, 255, 0.8];
const RAIL_INNER_COLOR = [0, 0, 0, 0.6];
const CYCLE_LAYER_GRAVEL_COLOR = [180, 80, 170, 0.6];
const CYCLE_LAYER_ASPHALT_COLOR = [208, 148, 75, 0.6];
const CYCLE_LAYER_OTHER_COLOR = [75, 108, 208, 0.6];
const CYCLE_LAYER_SIZE = .8;
const AMTRAK_LAYER_TTL = 'Amtrak';
const AMTRAK_LAYER_URL = '/layers/amtrak';
const AMTRAK_COLOR = [245, 245, 245, 0.6];
const AMTRAK_SIZE = 18;
const GROCERY_INNER_COLOR = [0, 0, 255, 0.5];
const PARKS_COLOR = [20, 255, 115, 0.35];
const FUN_COLOR = [255, 153, 255, 0.25];
const SOCIAL_COLOR = [184, 217, 255, 0.35];
const SCHOOL_COLOR = [242, 238, 122, 0.3];
const UNI_COLOR = [160, 238, 150, 0.3];
const CHURCH_COLOR = [10, 238, 255, 0.3];
const MED_COLOR = [255, 25, 25, 0.3];
const COUNTIES_OUTLINE_COLOR = [0, 0, 0, 0.5];
const COUNTIES_OUTLINE_SIZE = 1.5;
const COUNTIES_INNER_COLOR = [255, 255, 255, 0];

const LINES_CLASSBREAKS: cplethEls[] = [
    [0, 19, [62, 225, 67]],
    [20, 29, [50, 150, 127]],
    [30, 44, [0, 127, 255]],
    [45, 59, [255, 200, 127]],
    [60, 60, [255, 100, 100]],
    [61, 720, [255, 70, 10]],
];

export const makeLinesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: 'Metro Transit Lines',
    dataUrl: '/layers/lines',
    geometryType: 'polyline',
    fields: LINES_FIELDS,
    renderer: new ClassBreaksRenderer({
        field: 'freq_wk',
        classBreakInfos: makeChoroplethLevels({ levels: LINES_CLASSBREAKS, opac: 0.65, line: true}),
        defaultSymbol: new SimpleLineSymbol({ color: 'gray', width: 3 })
    }),
    toGraphics: toPolyline,
    popupTemplate: {
        title: '{route_desc}',
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes}
                fieldInfos={LINES_FIELDINFOS}
                routeField='route_desc'
                routeLabel='Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        )
    }
});

export const makeLinesLayerBase = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: 'Metro Transit Lines',
    dataUrl: '/layers/lines',
    geometryType: 'polyline',
    fields: LINES_FIELDS,
    renderer: new ClassBreaksRenderer({
        field: 'freq_wk',
        classBreakInfos: makeChoroplethLevels({ levels: LINES_CLASSBREAKS, opac: 0.65, line: true }),
        defaultSymbol: new SimpleLineSymbol({ color: 'gray', width: 3 })
    }),
    toGraphics: toPolyline,
    popupTemplate: {
        title: '{route_desc}',
        content: (feature: any) => makePopupContent(
            <LayerPopup
                attrs={feature.graphic?.attributes}
                fieldInfos={LINES_FIELDINFOS}
                routeField='route_desc'
                routeLabel='Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        )
    }
});

export const makeMetroLinesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
): FeatureLayerMeta => ({
    ...makeLinesLayerBase(onRouteClick, onRoutesClick),
    title: 'MetroLink Transit Lines',
    filter: (f) => f.properties?.route_type === '2',
    renderer: new UniqueValueRenderer({
        field: 'route',
        uniqueValueInfos: [
            {
                value: 'MLR',
                label: 'Red Line',
                symbol: new SimpleLineSymbol({ color: ML_RED_COLOR, width: ML_LINE_SIZE, style: 'solid' }),
            },
            {
                value: 'MLB',
                label: 'Blue Line',
                symbol: new SimpleLineSymbol({ color: ML_BLUE_COLOR, width: ML_LINE_SIZE, style: 'solid' }),
            },
        ],
        defaultSymbol: new SimpleLineSymbol({ color: 'gray', width: ML_LINE_SIZE }),
    }),
    popupTemplate: {
        title: 'MetroLink Route: {route_desc}',
        outFields: ['*'],
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={STOP_FIELDINFOS}
                routeField='route_names'
                routeLabel='MetroLink Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
});
export const makeBusLinesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
): FeatureLayerMeta => ({
    ...makeLinesLayerBase(onRouteClick, onRoutesClick),
    title: 'MetroBus Transit Lines',
    filter: (f) => f.properties?.route_type === '3',
    popupTemplate: {
        title: 'MetroBus Route: {route_desc}',
         content: (feature: any) => makePopupContent(
            <LayerPopup
                attrs={feature.graphic?.attributes}
                fieldInfos={LINES_FIELDINFOS}
                routeField='route_desc'
                routeLabel='Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        )
    }
});



export const makeMetroStopsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: ML_LAYER_TTL,
    dataUrl: ML_LAYER_URL,
    geometryType: 'point',
    fields: STOP_FIELDS,
    renderer: new UniqueValueRenderer({
        visualVariables: [
            new SizeVariable({
                field: 'route_count',
                stops: [
                    { value: 1, size: ML_STOP_SIZE },
                    { value: 2, size: ML_STOP_SIZE * 1.2 },
                ]
            }),
        ],
        field: 'route_ids',
        uniqueValueInfos: [
            {
                value: 'MLR',
                label: 'Red Line',
                symbol: new SimpleMarkerSymbol({
                    style: 'circle',
                    color: RAIL_INNER_COLOR,
                    size: ML_STOP_SIZE,
                    outline: new SimpleLineSymbol({
                        color: 'red',
                        width: 1,
                        style: 'solid',
                    })
                }),
            },
            {
                value: 'MLB',
                label: 'Blue Line',
                symbol: new SimpleMarkerSymbol({
                    style: 'circle',
                    color: RAIL_INNER_COLOR,
                    size: ML_STOP_SIZE,
                    outline: new SimpleLineSymbol({
                        color: 'blue',
                        width: 1,
                        style: 'solid',
                    })
                }),
            },
            {
                value: 'MLB, MLR',
                label: 'Blue/Red Lines',
                symbol: new SimpleMarkerSymbol({
                    style: 'circle',
                    color: RAIL_INNER_COLOR,
                    size: ML_STOP_SIZE,
                    outline: new SimpleLineSymbol({
                        color: 'purple',
                        width: 1,
                        style: 'solid',
                    })
                }),
            },
        ],
    }),
    popupTemplate: {
        title: `Light Rail Stop: {stop_name}`,
        outFields: ['*'],
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={STOP_FIELDINFOS}
                routeField='route_names'
                routeLabel='MetroLink Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPoint,
});
export const makeBusStopsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: BUS_LAYER_TTL,
    dataUrl: BUS_LAYER_URL,
    geometryType: 'point',
    fields: STOP_FIELDS,
    outFields: ['*'],
    renderer: new UniqueValueRenderer({
        field: 'wheelchair_access',
        visualVariables: [
            new SizeVariable({
                field: 'route_count',
                stops: [
                    { value: 1, size: BUS_STOP_SIZE },
                    { value: 2, size: BUS_STOP_SIZE * 1.5 },
                    { value: 3, size: BUS_STOP_SIZE * 2.5 },
                    { value: 4, size: BUS_STOP_SIZE * 3.5 },
                    { value: 5, size: BUS_STOP_SIZE * 4 },
                ]
            }),
        ],
        defaultLabel: 'NA',
        defaultSymbol: new SimpleMarkerSymbol({
            style: 'circle',
            color: BUS_STOP_NA_COLOR,
        }),
        uniqueValueInfos: [
            {
                value: 'true',
                symbol: new SimpleMarkerSymbol({
                    style: 'circle',
                    color: BUS_STOP_Y_COLOR,
                }),
                label: 'Wheelchair Accessible',
            },
            {
                value: 'false',
                symbol: new SimpleMarkerSymbol({
                    style: 'circle',
                    color: BUS_STOP_NO_COLOR,
                }),
                label: 'Not Wheelchair Accessible',
            },
        ],
    }),
    popupTemplate: {
        title: `MetroBus ({route_ids}) Stop: {stop_name}`,
        outFields: ['*'],
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={STOP_FIELDINFOS}
                routeField='route_names'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPoint,
});

export const makePlacesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: 'Places',
    dataUrl: '/layers/places',
    geometryType: 'polygon',
    fields: PLACE_FIELDS,
    renderer: new UniqueValueRenderer({
        field: 'type',
        uniqueValueInfos: [
            {
                value: 'park',
                label: 'Parks',
                symbol: new SimpleFillSymbol({
                    color: PARKS_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 1 }),
                }),
            },
            {
                value: 'grocery',
                label: 'Grocery',
                symbol: new SimpleFillSymbol({
                    color: GROCERY_INNER_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'social_facility',
                label: 'Social Facility',
                symbol: new SimpleFillSymbol({
                    color: SOCIAL_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'university',
                label: 'College/University',
                symbol: new SimpleFillSymbol({
                    color: UNI_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'church',
                label: 'Place of Worship',
                symbol: new SimpleFillSymbol({
                    color: CHURCH_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'medical',
                label: 'Medical Facility',
                symbol: new SimpleFillSymbol({
                    color: MED_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'entertainment',
                label: 'Enterntainment/Fun',
                symbol: new SimpleFillSymbol({
                    color: FUN_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 0.5 }),
                }),
            },
            {
                value: 'school',
                label: 'School',
                symbol: new SimpleFillSymbol({
                    color: SCHOOL_COLOR,
                    style: 'diagonal-cross',
                    outline: new SimpleLineSymbol({ color: 'black', width: 1 }),
                }),
            },
            ],
        defaultLabel: 'Other', 
        defaultSymbol: new SimpleFillSymbol({
            color: [128, 128, 128, 0.3],
            outline: new SimpleLineSymbol({ color: 'grey', width: 0.5 }),
        }),
    }),
    popupTemplate: {
        title: `{name} ({type})`,
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={PLACE_FIELDINFOS}
                routeField='bus_near'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeAmtrakLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: AMTRAK_LAYER_TTL,
    dataUrl: AMTRAK_LAYER_URL,
    legendEnabled: false,
    geometryType: 'point',
    fields: AMTRAK_FIELDS,
    renderer: new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
            style: 'circle',
            color: RAIL_INNER_COLOR,
            size: AMTRAK_SIZE,
            outline: new SimpleLineSymbol({
                color: AMTRAK_COLOR,
                width: 1,
                style: 'solid',
            }),
        }),
    }),
    popupTemplate: {
        title: `Amtrak Stop: {name}`,
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={AMTRAK_FIELDINFOS}
                routeField='bus_near'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPoint,
});

export const makeCountiesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: COUNTIES_LAYER_TTL,
    dataUrl: COUNTIES_LAYER_URL,
    geometryType: 'polygon',
    fields: COUNTIES_FIELDS as FieldProperties[],
    renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
            color: COUNTIES_INNER_COLOR,
            outline: new SimpleLineSymbol({
                color: COUNTIES_OUTLINE_COLOR,
                width: COUNTIES_OUTLINE_SIZE,
                style: 'solid',
            }),
        }),
    }),
    popupTemplate: {
        title: '{county_name}',
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={COUNTIES_FIELDINFOS}
                routeField='bus_near'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeTractsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: TRACTS_LAYER_TTL,
    dataUrl: TRACTS_LAYER_URL,
    geometryType: 'polygon',
    fields: TRACTS_FIELDS as FieldProperties[],
    renderer: new ClassBreaksRenderer({
        field: 'popl_dens',
        classBreakInfos: makeChoroplethLevels({
            levels: TRACT_CLASSBREAKS.get(tractsField('popl_dens')),
            opac: 0.05,
        }),
    }),
    popupTemplate: {
        title: '{tract_name}',
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={COUNTIES_FIELDINFOS}
                routeField='bus_near'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeCyclingLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): FeatureLayerMeta => ({
    title: CYCLE_LAYER_TTL,
    dataUrl: CYCLE_LAYER_URL,
    geometryType: 'polyline',
    fields: CYCLING_FIELDS as FieldProperties[],
    renderer: new UniqueValueRenderer({
        field: 'surface',
        defaultSymbol: new SimpleLineSymbol({ color: CYCLE_LAYER_OTHER_COLOR, width: CYCLE_LAYER_SIZE }),
        defaultLabel: 'Path Type Unknown',
        uniqueValueGroups: [{
            classes: [{
                label: 'Paved Path',
                values: ['paved', 'concrete', 'asphalt'] as UniqueValueProperties[],
                symbol: new SimpleLineSymbol({
                    color: CYCLE_LAYER_ASPHALT_COLOR,
                    width: CYCLE_LAYER_SIZE,
                    style: 'dash',
                }),
            }],
        }, {
            classes: [{
                label: 'Unpaved Path',
                values: ['unpaved', 'dirt', 'gravel', 'fine_gravel', 'crushed_limestone'] as UniqueValueProperties[],
                symbol: new SimpleLineSymbol({
                    color: CYCLE_LAYER_GRAVEL_COLOR,
                    width: CYCLE_LAYER_SIZE,
                    style: 'dash',
                }),
            }],
        }],        
    }),
    popupTemplate: {
        title: '{name}',
         content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={CYCLING_FIELDINFOS}
                routeField='bus_near'
                routeLabel='MetroBus Routes Served'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
            />
        ),
    },
    toGraphics: toPolyline,
});