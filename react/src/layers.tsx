import { UniqueValueProperties } from '@arcgis/core/renderers/support/UniqueValue';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable.js';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import { FeatureLayerMeta } from '@/types';
import LayerPopup from './cmp/LayerPopup';
import { TRACT_CLASSBREAKS } from './data';
import { LINES_FIELDINFOS, LINES_FIELDS, ML_LAYER_TTL, ML_LAYER_URL, STOP_FIELDINFOS,
    STOP_FIELDS, BUS_LAYER_TTL, BUS_LAYER_URL, PLACE_FIELDINFOS, PLACE_FIELDS, AMTRAK_FIELDINFOS, AMTRAK_FIELDS,
    COUNTIES_FIELDINFOS, COUNTIES_FIELDS, COUNTIES_LAYER_TTL, COUNTIES_LAYER_URL, TRACTS_FIELDS,
    TRACTS_LAYER_TTL, TRACTS_LAYER_URL, CYCLE_LAYER_TTL, CYCLE_LAYER_URL, CYCLING_FIELDS, CYCLING_FIELDINFOS,
    LINES_LAYER_URL, ML_LINES_LAYER_TTL, BUS_LINES_LAYER_TTL, AMTRAK_LAYER_TTL, AMTRAK_LAYER_URL, AMTRAK_SIZE,
    AMTRAK_COLOR, BUS_STOP_NA_COLOR, BUS_STOP_NO_COLOR, BUS_STOP_SIZE, BUS_STOP_Y_COLOR, CHURCH_COLOR,
    CYCLE_LAYER_SIZE, FUN_COLOR, GROCERY_INNER_COLOR, LINES_CLASSBREAKS, MED_COLOR, ML_BLUE_COLOR,
    ML_BOTH_COLOR, ML_LINE_SIZE, ML_RED_COLOR, ML_STOP_OUTLINE_WIDTH, ML_STOP_SIZE, PARKS_COLOR,
    RAIL_INNER_COLOR, SCHOOL_COLOR, SOCIAL_COLOR, UNI_COLOR, CYCLE_LAYER_OTHER_COLOR,
    CYCLE_LAYER_ASPHALT_COLOR, CYCLE_LAYER_GRAVEL_COLOR, COUNTIES_OUTLINE_COLOR, COUNTIES_OUTLINE_SIZE,
    COUNTIES_INNER_COLOR,
} from '@/consts';
import { makeChoroplethLevels, toPoint, toPolygon, toPolyline, makePopupContent, tractsField, makeMarkerSymbol, makeLineSymbol } from '@/utils';

export const makeMetroLinesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
): FeatureLayerMeta => ({
    title: ML_LINES_LAYER_TTL,
    dataUrl: LINES_LAYER_URL,
    geometryType: 'polyline',
    fields: LINES_FIELDS,
    filter: (f) => f.properties?.route_type === '2',
    toGraphics: toPolyline,
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
        title: '{route_desc}',
        outFields: ['*'],
        content: (feature: any) => makePopupContent(
            <LayerPopup 
                attrs={feature.graphic?.attributes ?? feature.attributes}
                fieldInfos={LINES_FIELDINFOS}
                routeField='connected_bus_routes'
                routeLabel='MetroBus Routes w/ stop within 50m of Station'
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
                onRoutesClear={onRoutesClear}
            />
        ),
    },
});

export const makeBusLinesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
): FeatureLayerMeta => ({
    title: BUS_LINES_LAYER_TTL,
    dataUrl: LINES_LAYER_URL,
    geometryType: 'polyline',
    fields: LINES_FIELDS,
    filter: (f) => f.properties?.route_type === '3',
    toGraphics: toPolyline,
    renderer: new ClassBreaksRenderer({
        field: 'freq_wk',
        classBreakInfos: makeChoroplethLevels({ levels: LINES_CLASSBREAKS, opac: 0.65, line: true }),
        defaultSymbol: new SimpleLineSymbol({ color: 'gray', width: 3 })
    }),
    popupTemplate: {
        title: 'MetroBus Route: {route_desc}',
         content: (feature: any) => makePopupContent(
            <LayerPopup
                attrs={feature.graphic?.attributes}
                fieldInfos={LINES_FIELDINFOS}
                routeField='route_desc'
                routeLabel='Serves MetroBus Routes: '
                onRouteClick={onRouteClick}
                onRoutesClick={onRoutesClick}
                onRoutesClear={onRoutesClear}
            />
        )
    }
});

export const makeMetroStopsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
): FeatureLayerMeta => ({
    title: ML_LAYER_TTL,
    dataUrl: ML_LAYER_URL,
    geometryType: 'point',
    fields: STOP_FIELDS,
    renderer: new UniqueValueRenderer({
        field: 'route_ids',
        uniqueValueInfos: [
            {
                value: 'MLR',
                label: 'Red Line',
                symbol: makeMarkerSymbol(RAIL_INNER_COLOR, ML_STOP_SIZE, makeLineSymbol(ML_RED_COLOR, ML_STOP_OUTLINE_WIDTH))
            },
            {
                value: 'MLB',
                label: 'Blue Line',
                symbol: makeMarkerSymbol(RAIL_INNER_COLOR, ML_STOP_SIZE, makeLineSymbol(ML_BLUE_COLOR, ML_STOP_OUTLINE_WIDTH))
            },
            {
                value: 'MLB, MLR',
                label: 'Blue/Red Lines',
                symbol: makeMarkerSymbol(RAIL_INNER_COLOR, ML_STOP_SIZE, makeLineSymbol(ML_BOTH_COLOR, ML_STOP_OUTLINE_WIDTH))
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPoint,
});
export const makeBusStopsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPoint,
});

export const makePlacesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeAmtrakLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
): FeatureLayerMeta => ({
    title: AMTRAK_LAYER_TTL,
    dataUrl: AMTRAK_LAYER_URL,
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPoint,
});

export const makeCountiesLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeTractsLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPolygon,
});

export const makeCyclingLayer = (
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void,
    onRoutesClear: () => void
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
                onRoutesClear={onRoutesClear}
            />
        ),
    },
    toGraphics: toPolyline,
});