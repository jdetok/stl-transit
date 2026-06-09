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
import { type ReactElement } from 'react'
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

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
            console.log(res.body);
        } else {
            throw new Error(`no data source for ${m.title} layer`);
        }
    } catch (e) {
        throw new Error(`failed to fetch ${m.dataUrl}: ${e}`);
    }

    try {
        data = await res.json();
        console.log(data); // no longer visible if this is removed - timing issue to fix
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