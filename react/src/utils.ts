import { flushSync } from 'react-dom';
import Graphic from '@arcgis/core/Graphic';
import { createRoot } from 'react-dom/client';
import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';
import Polygon from '@arcgis/core/geometry/Polygon';
import { RefObject, type ReactElement } from 'react';
import FieldInfo from '@arcgis/core/popup/FieldInfo';
import Polyline from '@arcgis/core/geometry/Polyline';
import Renderer from "@arcgis/core/renderers/Renderer";
import { actionBarProps } from './cmp/calcite/ActionBar';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { TRACTS_FIELDINFOS, WKID, CHOROPLETH, dispBlock } from '@/consts';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import { HighlightOptionsProperties } from '@arcgis/core/views/support/HighlightOptions';
import { ClassBreakInfoProperties } from '@arcgis/core/renderers/support/ClassBreakInfo';
import { FeatureLayerMeta, choroProps, cplethEls, choropleth, ColorProperties, mapLayer, featFilter } from '@/types';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable';
import SizeStop from '@arcgis/core/renderers/visualVariables/support/SizeStop';
import Color, { ColorLike } from '@arcgis/core/Color';
import { LineStyle } from '@arcgis/core/symbols/types';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

export const buildGraphics = (meta: FeatureLayerMeta, data: any): Graphic[] => {
    if (meta.toGraphics) {
        return meta.toGraphics(data, meta.filter);
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
    console.log('makeFeatureLayer title:', m.title, ":", m.renderer?.type);
    let data: any;
    let res: Response;
    try {
        if (m.dataUrl) {
            res = await fetch(m.dataUrl);
        } else {
            throw new Error(`no data source for ${m.title} layer`);
        }
    } catch (e) {
        throw new Error(`failed to fetch ${m.dataUrl}: ${e}`);
    }

    try {
        data = await res.json();
    } catch (e) {
        throw new Error(`failed to get json from ${m.dataUrl}: ${e}`);
    }

    try {
        m.source = buildGraphics(m, data);
    } catch (e) {
        throw new Error(`failed to build graphics for ${m.dataUrl}: ${e}`);
    }
// console.log('renderer just before FeatureLayer construction:', m.renderer?.type);
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

export const toPolygon = (data: any, filter?: featFilter): Graphic[] => {
    const features = filter ? data.features.filter((f: any) => filter(f)) : data.features;
    return features.map((f: any) => { 
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
export const toPoint = (data: any, filter?: featFilter): Graphic[] => {
    const features = filter ? data.features.filter((f: any) => filter(f)) : data.features;
    return features.map((f: any) => {
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
export const toPolyline = (data: any, filter?: featFilter): Graphic[] => {
    const features = filter ? data.features.filter((f: any) => filter(f)) : data.features;
    const graphics = features.map((f: any) => {
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
    });
    console.log('polyline graphic attributes sample:', graphics.slice(0, 3).map(g => g.attributes));
    return graphics;
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

export const applyRoutesFilter = async (mapView: MapView, linesLayersArr: FeatureLayer[], stopLayers: FeatureLayer[], routeNames: string | string[]) => { 
    const routes = Array.isArray(routeNames) ? routeNames : [routeNames];

    // stops layers use route_names field, lines layer uses route_desc field. build separate queries for each
    let whereStop: string;
    let whereLine: string;
    if (routeNames.length > 1) {
        whereStop = (routes as string[]).map(r => `route_names like '%${r.replace("'", "")}%'`).join(" or ");
        if (routes.some(r => r.includes("MetroLink"))) {
            whereLine = (routes as string[]).map(r => `route_desc like '%${r.substring(4)}%'`).join(" or ");
        } else {
            whereLine = (routes as string[]).map(r => `route_desc like '%${r}%'`).join(" or ");
        }
    } else {
        whereStop = `route_names like '%${routeNames[0]}%'`;
        whereLine = `route_desc like '%${routeNames[0]}%'`;
    }

    const layers = [...linesLayersArr, ...stopLayers];

    await Promise.all(layers.map(async (layer: FeatureLayer, i: number) => {
        const layerView = await mapView.whenLayerView(layer) as FeatureLayerView;
        layerView.featureEffect = new FeatureEffect({
            filter: new FeatureFilter({ where: i < linesLayersArr.length ? whereLine : whereStop }),
            includedEffect: "bloom(1, 1px, 0.3) drop-shadow(2px 2px 4px black) brightness(2)",
            excludedEffect: "opacity(75%)",
        });
    })); 

    // query just the lines and move the map there
    const res = await queryFeatureLayer(linesLayersArr[0] as FeatureLayer, whereLine);
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

export const buildFeatureLayer = async(
    [k, v],
    onRouteClick: (route: string | string[]) => void,
    onRoutesClick: (routes: string | string[]) => void,
    onRoutesClear: () => void,
) => {
    try {
        if (v.fn) v.meta = v.fn(onRouteClick, onRoutesClick, onRoutesClear);
    } catch (err) {
        console.error('error building FeatureLayerMeta:', err);
    }
    try {
        v.layer = await makeFeatureLayer(v.meta);
        console.log('added layer:', k);
    } catch (err) {
        console.error('error building FeatureLayer:', err);
    }
};

export const addLayer = (view: MapView) => ([k, v]: [string, mapLayer]) => {
    if (v.layer) {
        view.map?.add(v.layer);
    } else {
        console.warn('missing layer:', k);
    }
}

export type renderers = UniqueValueRenderer | ClassBreaksRenderer;
export function updateRenderedSizes(renderer: Renderer, baseSizes: number[], mult: number): renderers {
    switch (renderer.type) {
        case 'unique-value': {
            const uvr = renderer as UniqueValueRenderer;
            if (uvr.visualVariables?.length) {
                const sizeVar = uvr.visualVariables[0] as SizeVariable;
                sizeVar.stops!.forEach((stop, i) => {
                    if (baseSizes[i]) (stop as SizeStop).size = baseSizes[i] * mult;
                });
            } else {
                uvr.uniqueValueInfos?.forEach((uvi, i) => {
                    if (baseSizes[i]) (uvi.symbol as SimpleLineSymbol).width = baseSizes[i] * mult;
                });
            }
            break;
        }
        case 'class-breaks': {
            (renderer as ClassBreaksRenderer).classBreakInfos.forEach((cb, i) => {
                if (baseSizes[i]) (cb.symbol as SimpleLineSymbol).width = baseSizes[i] * mult;
            });
            break;
        }
    }
    return (renderer as renderers).clone() as renderers; 
}

export const makeSizeCallback = (layer: FeatureLayer, ogSizes: number[]) => (v: number) => {
    layer.renderer = updateRenderedSizes(layer.renderer as renderers, ogSizes, v);
};

export const makeOpacityCallback = (layer: FeatureLayer, ogColors: Color[], opac: number) => (v: number) => {
    if (opac) opac = v;
    const renderer = layer.renderer as ClassBreaksRenderer;
    renderer.classBreakInfos.forEach((cb, i) => {
        if (ogColors[i]) {
            const { r, g, b } = ogColors[i];
            cb.symbol.color = new Color([r, g, b, v]);
        }
    });
    layer.renderer = renderer.clone();
};

export const clearRoutesFilter = async (mapView: MapView, linesLayersArr: FeatureLayer[], stopLayers: FeatureLayer[]) => {
    const layers = [...linesLayersArr, ...stopLayers];
    await Promise.all(layers.map(async (layer) => {
        const layerView = await mapView.whenLayerView(layer) as FeatureLayerView;
        layerView.featureEffect = null as any;
    }));
};

export const makeLineSymbol = (color: ColorLike, width: number, style?: LineStyle): SimpleLineSymbol => {
    return new SimpleLineSymbol({
        color: color,
        width: width,
        style: style ?? 'solid',
    });
};

type markerStyle = "circle" | "diamond" | "square" | "triangle" | "cross" | "x" | "path" | undefined;
export const makeMarkerSymbol = (color: ColorLike, size: number, outline?: SimpleLineSymbol, style?: markerStyle): SimpleMarkerSymbol => { 
    return new SimpleMarkerSymbol({
        style: style ?? 'circle',
        color: color,
        size: size,
        outline: outline,
    })
}

export const scrollToInfoBlock = (sectId: string, blockId: string, offset = 40) => {
    try {
        const section = document.querySelector(`#${sectId}`) as HTMLDivElement;
        if (!section) throw new Error(`can't find section with id ${sectId}`);

        const block = section.querySelector(`#${blockId}`) as HTMLDivElement;
        if (!block) throw new Error(`can't find block with id ${blockId}`);;

        section.querySelectorAll(':scope > div').forEach(b => {
            if (b.id === blockId) {
                const disp = (b as HTMLDivElement).style.display === 'block' ? 'none' : 'block';
                (b as HTMLDivElement).style.display = disp;
            } else {
                (b as HTMLDivElement).style.display = 'none';
            }
        });

        section.style.display = 'block';

        window.scrollTo({ top: block.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
        block.hidden = false;
    } catch (e) {
        console.error(e);
    }
};