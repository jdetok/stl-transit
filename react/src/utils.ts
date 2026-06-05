import { FeatureLayerMeta, choroProps, cplethEls, choropleth, ColorProperties } from "@/types";
import { WKID } from "@/consts";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import FieldInfo from "@arcgis/core/popup/FieldInfo";
import { FieldProperties } from "@arcgis/core/layers/support/Field";
import { HighlightOptionsProperties } from "@arcgis/core/views/support/HighlightOptions";
import { ClassBreakInfoProperties } from "@arcgis/core/renderers/support/ClassBreakInfo";
import { type ReactElement } from 'react'
import { createRoot } from "react-dom/client";

export const buildGraphics = (meta: FeatureLayerMeta, data: any): Graphic[] => {
    if (meta.toGraphics) {
        return meta.toGraphics(data);
    } else {
        if (!data?.features?.length) {
            throw new Error(`layer "${meta.title}" expected data.features[]`);
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
    try {
        if (meta.dataUrl) {
            const res = await fetch(meta.dataUrl);
            const data = await res.json();
            console.log(data); // no longer visible if this is removed - timing issue to fix
            meta.source = buildGraphics(meta, data);
        } else {
            throw new Error(`no data source for ${meta.title} layer`);
        }
    } catch (e) {
        throw new Error(`failed to create feature layer: ${e}`);
    }
    return new FeatureLayer({
        title: meta.title,
        source: meta.source,
        objectIdField: "ObjectID",
        geometryType: meta.geometryType,
        spatialReference: { wkid: WKID },
        renderer: meta.renderer,
        popupTemplate: meta.popupTemplate,
        fields: meta.fields,
        outFields: ["*"],
        legendEnabled: meta.legendEnabled ?? true,
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
                rings: (f.geometry.type === "MultiPolygon") ? f.geometry.coordinates.flat(1) : f.geometry.coordinates,
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
                route_count: f.properties.route_names ? f.properties.route_names.split(", ").length : 1,
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
                route_count: f.properties.route_names ? f.properties.route_names.split(", ").length : 1,
            },
        })
    })
};

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

export function newHighlightSetting(name: string, color: ColorProperties): HighlightOptionsProperties {
    return {
        name: name, color: color,
        fillOpacity: 0.05, shadowColor: "black",
        shadowOpacity: 0.4, shadowDifference: 0.2,
    }
}

const popupRoots = new Map<HTMLElement, ReturnType<typeof createRoot>>();
export const makePopupContent = (e: ReactElement): HTMLElement => {
    const div = document.createElement('div');
    const root = createRoot(div);
    popupRoots.set(div, root);
    root.render(e);
    return div;
}
export const cleanupPopupRoots = () => {
    popupRoots.forEach(root => root.unmount());
    popupRoots.clear();
}