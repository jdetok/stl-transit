import { TRACTS_FIELDINFOS, WKID, CHOROPLETH } from '@/consts';
import { FeatureLayerMeta, choroProps, cplethEls, choropleth, ColorProperties } from '@/types';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FieldInfo from '@arcgis/core/popup/FieldInfo';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import { HighlightOptionsProperties } from '@arcgis/core/views/support/HighlightOptions';
import { ClassBreakInfoProperties } from '@arcgis/core/renderers/support/ClassBreakInfo';
import { RefObject, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import MapView from '@arcgis/core/views/MapView';
import { actionBarProps } from './cmp/calcite/ActionBar';

export const buildGraphics = (meta: FeatureLayerMeta, data: any): Graphic[] => {
    if (meta.toGraphics) {
        return meta.toGraphics(data);
    } else {
        if (!data?.features?.length) {
            throw new Error(`layer '${meta.title}' expected data.features[]`);
        }
        return data.features.map((f: any) => new Graphic({
            geometry: new Polygon({
                rings: f.geometry.rings,
                spatialReference: { wkid: WKID },
            }),
            attributes: f.attributes,
        }));
    }   
}

export const makeFeatureLayer = async (meta: FeatureLayerMeta): Promise<FeatureLayer> => {
    const m = { ...meta };
    let data: any;
    let res: Response;
    try {
        if (m.dataUrl) {
            res = await fetch(m.dataUrl);
            // console.log(res.body);
        } else {
            throw new Error(`no data source for ${m.title} layer`);
        }
    } catch (e) {
        throw new Error(`failed to fetch ${m.dataUrl}: ${e}`);
    }

    try {
        data = await res.json();
        // console.log(data); // no longer visible if this is removed - timing issue to fix
    } catch (e) {
        throw new Error(`failed to get json from ${m.dataUrl}: ${e}`);
    }

    try {
        m.source = buildGraphics(m, data);
    } catch (e) {
        throw new Error(`failed to build graphics for ${m.dataUrl}: ${e}`);
    }

    return new FeatureLayer({
        title: m.title,
        source: m.source,
        objectIdField: 'ObjectID',
        geometryType: m.geometryType,
        spatialReference: { wkid: WKID },
        renderer: m.renderer,
        popupTemplate: m.popupTemplate,
        fields: m.fields,
        outFields: ['*'],
        legendEnabled: m.legendEnabled ?? true,
    });
}

export function makeChoroplethRanges(numRanges: number, ranges: number[], cpleth: choropleth): cplethEls[] {
    if (ranges.length !== numRanges + 1 ) {
        throw new Error(`length of array (${ranges.length}) should equal numRanges + 1 (${numRanges} + 1: ${numRanges + 1})`);
    }
    const cplethLevels: cplethEls[] = [];

    ranges.forEach((r: number, i) => {
        if (i === numRanges) return;
        cplethLevels.push([r, ranges[i+1] as number, cpleth[`lvl${i + 1}`]])
    })
    return cplethLevels;
}

// create choropleth levels for the array of min/max/color
export const newChoroplethLevel = (props: choroProps) => {
    if (!props.level) return;
    return {
        minValue: props.level[0],
        maxValue: props.level[1],
        symbol: props.line ? new SimpleLineSymbol({ color: [...props.level[2], 0.65], width: 0.5 }) :
            new SimpleFillSymbol({ color: [...props.level[2], props.opac] }),
    };
};

export const makeChoroplethLevels = (props: choroProps): ClassBreakInfoProperties[] => {
    if (!props.levels) throw new Error(`props.levels can't be empty`);
    let lvls: ClassBreakInfoProperties[] = [];
    for (const l of props.levels) {
        lvls.push(newChoroplethLevel({
            level: l, opac: props.opac, line: props.line ?? false
        }) as ClassBreakInfoProperties);
    }
    return lvls;
};

export const toPolygon = (data: any): Graphic[] => {
    return data.features.map((f: any) => { 
        return new Graphic({
            geometry: new Polygon({
                rings: (f.geometry.type === 'MultiPolygon') ? f.geometry.coordinates.flat(1) : f.geometry.coordinates,
                spatialReference: { wkid: WKID },
            }),
            attributes: f.properties,
        })
    })
}

// create and return an array of graphics from passed bus/metro stop locations
export const toPoint = (data: any): Graphic[] => {
    return data.features.map((f: any) => {
        return new Graphic({
            geometry: new Point({
                longitude: f.geometry.coordinates[0],
                latitude: f.geometry.coordinates[1],
                spatialReference: { wkid: WKID },
            }),
            attributes: {
                ...f.properties,
                ObjectID: f.properties.id,
                route_count: f.properties.route_names ? f.properties.route_names.split(', ').length : 1,
            },
        })
    })
};
export const toPolyline = (data: any): Graphic[] => {
    return data.features.map((f: any) => {
        return new Graphic({
            geometry: new Polyline({
                paths: f.geometry.coordinates,
                spatialReference: { wkid: WKID },
            }),
            attributes: {
                ...f.properties,
                ObjectID: f.properties.id,
                route_count: f.properties.route_names ? f.properties.route_names.split(', ').length : 1,
            },
        })
    })
};


// pass only the breaks (6 for 5 levels)
export const makeChoroRanges = (numRanges: number, ranges: number[]): cplethEls[] => {
    return makeChoroplethRanges(numRanges, ranges, CHOROPLETH);
}

export const fieldInfos = (fields: FieldProperties[], exclude: string[]): FieldInfo[] => {
    return [...fields].filter((f) => !exclude.includes(f.name!)).map(({ name, alias }) => ({
        fieldName: name,
        label: alias,
    })) as FieldInfo[];
}

export const tractFieldFromInfos = (globalFieldInfos: FieldInfo[], field: string): FieldInfo => {
    return globalFieldInfos.find((f) => f.fieldName === field) as FieldInfo ?? {
        fieldName: field, label: field
    };
}

export const tractsField = (field: string): FieldInfo => {
    return tractFieldFromInfos(TRACTS_FIELDINFOS, field);
};

export function newHighlightSetting(name: string, color: ColorProperties): HighlightOptionsProperties {
    return {
        name: name, color: color,
        fillOpacity: 0.05, shadowColor: 'black',
        shadowOpacity: 0.4, shadowDifference: 0.2,
    }
}

export const makePopupContent = (e: ReactElement): HTMLElement => {
    const div = document.createElement('div');
    flushSync(() => createRoot(div).render(e));
    return div;
}

export const mapFullscreen = async () => { 
    const refEl = document.querySelector('arcgis-map');
    if (!refEl) return;
    if (!document.fullscreenElement) {
        refEl.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
};

export const queryFeatureLayer = async (layer: FeatureLayer, query: string, returnGeometry?: boolean, returnCentroid?: boolean): Promise<FeatureSet> => {
    return await layer.queryFeatures({
        where: query,
        returnGeometry: returnGeometry,
        returnCentroid: returnCentroid,
    });
}

export const applyFeatureFx = (view: FeatureLayerView, fx: FeatureEffect) => view.featureEffect = fx;

export const applyRoutesFilter = async (mapView: MapView, linesLayer: FeatureLayer, stopLayers: FeatureLayer[], routeNames: string | string[]) => { 
    const routes = Array.isArray(routeNames) ? routeNames : [routeNames];

    // stops layers use route_names field, lines layer uses route_desc field. build separate queries for each
    let whereStop: string;
    let whereLine: string;
    if (routeNames.length > 1) {
        whereStop = (routes as string[]).map(r => `route_names like '%${r}%'`).join(" or ");
        if (routes.some(r => r.includes("MetroLink"))) {
            // lines layer stores metro routes as "MetroLink Red Line" rather than "MLR-MetroLink Red Line"
            whereLine = (routes as string[]).map(r => `route_desc like '%${r.substring(4)}%'`).join(" or ");
        } else {
            whereLine = (routes as string[]).map(r => `route_desc like '%${r}%'`).join(" or ");
        }
    } else {
        whereStop = `route_names like '%${routeNames[0]}%'`;
        whereLine = `route_desc like '%${routeNames[0]}%'`;
    }

    const layers = [linesLayer, ...stopLayers];

    // add the feature effect for each layer
    layers.forEach(async (layer: FeatureLayer, i: number) => {
        const layerView = await mapView.whenLayerView(layer) as FeatureLayerView;

        layerView.featureEffect = new FeatureEffect({
            filter: new FeatureFilter({ where: i < (layers.length - 1) ? whereStop : whereLine }),
            includedEffect: "bloom(1, 1px, 0.3) drop-shadow(2px 2px 4px black) brightness(2)",
        });
    })

    // query just the lines and move the map there
    const res = await queryFeatureLayer(linesLayer, whereLine);
    if (res.features.length) {
        await mapView.goTo(res.features, { duration: 600 });
    }
};

export const highlightPlaces = ({ bar, placesLayer, layerView, activeHighlight }: {
    bar: actionBarProps,
    placesLayer: FeatureLayer | undefined,
    layerView: FeatureLayerView | undefined,
    activeHighlight: RefObject<{ remove: () => void; } | null>
}) => {
    if ( bar.cssClass !== 'actbar2' || !placesLayer || !layerView ) return bar;
    return {
        ...bar,
        actions: bar.actions?.map((action) => ({
            ...action,
            onClick: action.where
                ? async () => {
                    if (!placesLayer) {
                        console.warn('palces layer not ready');
                        return;
                    }
                    try {
                        const result = await queryFeatureLayer(placesLayer, action.where!);
                                    
                        activeHighlight.current?.remove();
                        activeHighlight.current = layerView?.highlight(result.features);
                        console.log(`Query results for [${action.id}]:`, result);
                    } catch (err) {
                        console.error(`Query failed for action ${action.id}:`, err);
                    }
                }
                : undefined
        }))
    }
}