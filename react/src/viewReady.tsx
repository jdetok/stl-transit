import { RefObject } from 'react';
import MapView from '@arcgis/core/views/MapView';
import SliderBlock from './cmp/calcite/SliderBlock';
import { panelProps } from './cmp/calcite/Container';
import { actionBars, mapLayers, panels, TRACT_CLASSBREAKS } from '@/data';
import {
    HIGHLIGHTS, PANEL_CSS_CLASSES, MAX_OPAC_TRACT,
    SVAL_OPAC_TRACT, STEP_XS, MAX_MULT_STOPS, 
    SVAL_MULT, STEP_SM, STEP_MD,
    MAX_MULT_LINES_MBUS, MAX_MJLT_LINES_MLINK
} from '@/consts';
import { actionBarProps } from './cmp/calcite/ActionBar';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable';
import SizeStop from '@arcgis/core/renderers/visualVariables/support/SizeStop';
import { addLayer, applyRoutesFilter, buildFeatureLayer, clearRoutesFilter, highlightPlaces,
    makeChoroplethLevels,
    makeOpacityCallback, makeSizeCallback,
    tractsField
} from '@/utils';
import SelectBlock from './cmp/calcite/SelectBlock';
import ListBlock from './cmp/calcite/ListBlock';

type sliderType = 'size' | 'opacity';

// placeholder callbacks for slider values
type sliderCallbackFns = {
    tractOpacity: (_v: number) => void,
    busSize: (_v: number) => void,
    metroSize: (_v: number) => void,
    busLineSize: (_v: number) => void,
    metroLineSize: (_v: number) => void,
};
const sliderCallbacks: sliderCallbackFns = {
    tractOpacity: (_v) => { },
    busSize: (_v) => { },
    metroSize: (_v) => { },
    busLineSize: (_v) => { },
    metroLineSize: (_v) => { },
};
type layerSliderConfig = {
    key: keyof sliderCallbackFns;
    layerKey: string;
    type: sliderType;
};
const layerSliderConfigs: layerSliderConfig[] = [
    { key: 'tractOpacity', layerKey: 'tracts', type: 'opacity' },
    { key: 'busSize', layerKey: 'bus', type: 'size' },
    { key: 'metroSize', layerKey: 'metro', type: 'size' },
    { key: 'busLineSize', layerKey: 'buslines', type: 'size' },
    { key: 'metroLineSize', layerKey: 'metrolines', type: 'size' },
];

// placeholder callbacks for route buttons
const routeCallbacks = {
    onRouteClick: (route: string | string[]) => console.log('not ready', route),
    onRoutesClick: (routes: string | string[]) => console.log('not ready', routes),
    onRoutesClear: () => { },
};
const stableOnRouteClick = (route: string | string[]) => routeCallbacks.onRouteClick(route);
const stableOnRoutesClick = (routes: string | string[]) => routeCallbacks.onRoutesClick(routes);
const stableOnRoutesClear = () => routeCallbacks.onRoutesClear();

// ON VIEW READY FUNC/ARGS
export type viewReadyArgs = {
    setView: (view: MapView) => void;
    setBuiltActionBars: (bars: actionBarProps[]) => void;
    setBuiltPanels: (panels: panelProps[]) => void;
    activeHighlight: RefObject<{ remove: () => void } | null>;
};
export const viewReady = ({ setView, setBuiltActionBars, setBuiltPanels, activeHighlight }: viewReadyArgs) => {
    return async (view: MapView) => {
        view.highlights = HIGHLIGHTS;
        
        const layers = [...mapLayers.entries()];

        // BUILD ALL FEATURE LAYERS
        await Promise.all(layers.map(([k, v]) => buildFeatureLayer(
            [k, v], stableOnRouteClick, stableOnRoutesClick, stableOnRoutesClear
        )));

        // SORT EACH LAYER BY i AND ADD TO MAP VIEW
        layers.sort(([, v1], [_, v2]) => v1.i - v2.i).forEach(addLayer(view));

        // define individual layers 
        // const linesLayer = mapLayers.get('lines')?.layer as FeatureLayer;
        const metroLinesLayer = mapLayers.get('metrolines')?.layer as FeatureLayer;
        const busLinesLayer = mapLayers.get('buslines')?.layer as FeatureLayer;
        const linesLayersArr = [metroLinesLayer, busLinesLayer].filter(Boolean) as FeatureLayer[];

        const metroLayer = mapLayers.get('metro')?.layer as FeatureLayer;
        const busLayer = mapLayers.get('bus')?.layer as FeatureLayer;
        const placesLayer = mapLayers.get('places')?.layer as FeatureLayer;
        const stopLayers = [metroLayer, busLayer].filter(Boolean) as FeatureLayer[];
        const tractsLayer = mapLayers.get('tracts')?.layer as FeatureLayer;

        const tractChoroOpts = [...TRACT_CLASSBREAKS.keys()].map(({ label, fieldName }) => ({
            label: label!,
            value: fieldName!,
        }));

        // tract opacity/data field used for classbreaks
        const tractOpacState = 0.05;
        const onTractFieldChange = (val: string | string[]) => {
            const renderer = tractsLayer.renderer as ClassBreaksRenderer;
            renderer.field = val as string;
            renderer.classBreakInfos = makeChoroplethLevels({
                levels: TRACT_CLASSBREAKS.get(tractsField(val as string)),
                opac: tractOpacState,
            }!);
            tractsLayer.renderer = renderer.clone();
        };
        
        // real callbacks fror route buttons
        routeCallbacks.onRouteClick = (route) => applyRoutesFilter(view, linesLayersArr, stopLayers, route);
        routeCallbacks.onRoutesClick = (routes) => applyRoutesFilter(view, linesLayersArr, stopLayers, routes);
        routeCallbacks.onRoutesClear = () => clearRoutesFilter(view, linesLayersArr, stopLayers);

        // attach real callbacks for sliders
        for (const { key, layerKey, type } of layerSliderConfigs) {
            const layer = mapLayers.get(layerKey)?.layer as FeatureLayer;
            if (!layer) { console.warn(`missing layer for slider: ${layerKey}`); continue; }

            if (type === 'opacity') {
                const ogColors = (layer.renderer as ClassBreaksRenderer)
                    .classBreakInfos.map(cb => (cb.symbol as SimpleFillSymbol).color.clone());
                sliderCallbacks[key] = makeOpacityCallback(layer, ogColors, tractOpacState);
            } else {
                const renderer = layer.renderer;
                if (!renderer) continue;
                const ogSizes = (() => {
                    if (renderer.type === 'unique-value') {
                        const uvr = renderer as UniqueValueRenderer;
                        if (uvr.visualVariables?.length) {
                            return (uvr.visualVariables[0] as SizeVariable).stops!.map(s => (s as SizeStop).size as number);
                        }
                        return uvr.uniqueValueInfos?.map(uvi => (uvi.symbol as SimpleLineSymbol).width);
                    }
                    return (renderer as ClassBreaksRenderer).classBreakInfos.map(cb => (cb.symbol as SimpleLineSymbol).width);
                })();
                sliderCallbacks[key] = makeSizeCallback(layer, ogSizes!);
            }
        }
 
        // add real highlightPlaces callback to secondary action bar
        const layerView = await view?.whenLayerView(placesLayer!);
        const newActBars = actionBars.map((bar) => {
            if (bar.cssClass === 'actbar2') return highlightPlaces({ bar, placesLayer, layerView, activeHighlight }) ?? bar;
            if (bar.cssClass === 'actbar1') return {
                ...bar,
                actions: bar.actions?.map((action) => {
                    if (action.id === 'clear') return {
                        ...action,
                        onClick: () => clearRoutesFilter(view, linesLayersArr, stopLayers),
                    };
                    return action;
                }),
            };
            return bar;
        });
        
        setBuiltActionBars(newActBars);

        // add real slider callbacks to SliderBlocks in panels
        const newPanels = panels.map(panel => {
            if (panel.id !== PANEL_CSS_CLASSES['modifiers'] && panel.id !== PANEL_CSS_CLASSES['routes']) return panel;
            if (panel.id === PANEL_CSS_CLASSES['modifiers']) {
                return {
                    ...panel,
                    ready: true,
                    blockComponents: [
                        <SelectBlock id='select-0' heading='Tract Opacity Field'
                            optsProps={{ opts: tractChoroOpts }} onChange={onTractFieldChange} />,                        
                        <SliderBlock id='slider-0' heading='Tract Opacity'
                            min={0} max={MAX_OPAC_TRACT} value={SVAL_OPAC_TRACT} step={STEP_XS}
                            onInput={async (v) => { sliderCallbacks.tractOpacity(v) }} />,
                        <SliderBlock id='slider-3' heading='MetroBus Line Size'
                            min={0} max={MAX_MULT_LINES_MBUS} value={SVAL_MULT} step={STEP_MD}
                            onInput={async (v) => sliderCallbacks.busLineSize(v)}/>,
                        <SliderBlock id='slider-4' heading='MetroLink Line Size'
                            min={0} max={MAX_MJLT_LINES_MLINK} value={SVAL_MULT} step={STEP_SM}
                            onInput={async (v) => sliderCallbacks.metroLineSize(v)} />,
                        <SliderBlock id='slider-1' heading='MetroBus Stop Size'
                            min={0} max={MAX_MULT_STOPS} value={SVAL_MULT} step={STEP_SM}
                            onInput={async (v) => sliderCallbacks.busSize(v)} />,
                        <SliderBlock id='slider-2' heading='MetroLink Stop Size'
                            min={0} max={MAX_MULT_STOPS} value={SVAL_MULT} step={STEP_SM}
                            onInput={async (v) => sliderCallbacks.metroSize(v)} />,
                    ],
                };
            } else {
                return {
                    ...panel,
                    ready: true,
                    blockComponents: [
                        <ListBlock
                            id='dropdown-1' heading='Missouri Routes'
                            optsProps={{
                                allOpt: { label: 'All MetroBus Routes', value: 'all' },
                                dataUrl: '/layers/lines',
                                filter: (f: any) => f.properties.state === 'MO',
                                mapFeatures: (features) => features.map((f: any) => f.properties.route_desc.replace("'", '')).sort(),
                            }}
                            onChange={(vals) => {
                                if (vals === 'all' || !vals || (Array.isArray(vals) && vals.includes('all'))) {
                                    clearRoutesFilter(view, linesLayersArr, stopLayers);
                                    return;
                                }
                                applyRoutesFilter(view, linesLayersArr, stopLayers, vals);
                            }}
                        />,
                        <ListBlock
                            id='dropdown-0' heading='Illinois Routes'
                            optsProps={{
                                allOpt: { label: 'All MetroBus Routes', value: 'all' },
                                dataUrl: '/layers/lines',
                                filter: (f: any) => { return f.properties.state === 'IL' },
                                mapFeatures: (features) => features.map((f: any) => f.properties.route_desc.replace("'", '')).sort(),
                            }}
                            onChange={(vals) => {
                                if (vals === 'all' || !vals || (Array.isArray(vals) && vals.includes('all'))) {
                                    clearRoutesFilter(view, linesLayersArr, stopLayers);
                                    return;
                                }
                                applyRoutesFilter(view, linesLayersArr, stopLayers, vals);
                            }}
                        />,
                    ],
                }
            }
            
        });
        setBuiltPanels(newPanels);
        setView(view);
    }
};
