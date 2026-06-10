import { RefObject } from 'react';
import MapView from '@arcgis/core/views/MapView';
import SliderBlock from './cmp/calcite/SliderBlock';
import { panelProps } from './cmp/calcite/Container';
import { actionBars, mapLayers, panels } from '@/data';
import { HIGHLIGHTS, PANEL_CSS_CLASSES } from '@/consts';
import { actionBarProps } from './cmp/calcite/ActionBar';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable';
import SizeStop from '@arcgis/core/renderers/visualVariables/support/SizeStop';
import { addLayer, applyRoutesFilter, buildFeatureLayer, highlightPlaces,
    makeOpacityCallback, makeSizeCallback
} from '@/utils';

type sliderType = 'size' | 'opacity';

// placeholder callbacks for slider values
type sliderCallbackFns = {
    tractOpacity: (_v: number) => void,
    busSize: (_v: number) => void,
    metroSize: (_v: number) => void,
    lineSize: (_v: number) => void,
};
const sliderCallbacks: sliderCallbackFns = {
    tractOpacity: (_v) => { },
    busSize: (_v) => { },
    metroSize: (_v) => { },
    lineSize: (_v) => { },
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
    { key: 'lineSize', layerKey: 'lines', type: 'size' },
];

// placeholder callbacks for route buttons
const routeCallbacks = {
    onRouteClick: (route: string | string[]) => console.log('not ready', route),
    onRoutesClick: (routes: string | string[]) => console.log('not ready', routes),
};
const stableOnRouteClick = (route: string | string[]) => routeCallbacks.onRouteClick(route);
const stableOnRoutesClick = (routes: string | string[]) => routeCallbacks.onRoutesClick(routes);

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
            [k, v], stableOnRouteClick, stableOnRoutesClick
        )));

        // SORT EACH LAYER BY i AND ADD TO MAP VIEW
        layers.sort(([, v1], [_, v2]) => v1.i - v2.i).forEach(addLayer(view));

        // define individual layers 
        const linesLayer = mapLayers.get('lines')?.layer as FeatureLayer;
        const metroLayer = mapLayers.get('metro')?.layer as FeatureLayer;
        const busLayer = mapLayers.get('bus')?.layer as FeatureLayer;
        const placesLayer = mapLayers.get('places')?.layer as FeatureLayer;
        const stopLayers = [metroLayer, busLayer].filter(Boolean) as FeatureLayer[]; 
        
        // real callbacks fror route buttons
        routeCallbacks.onRouteClick = (route) => applyRoutesFilter(view, linesLayer, stopLayers, route);
        routeCallbacks.onRoutesClick = (routes) => applyRoutesFilter(view, linesLayer, stopLayers, routes);

        // attach real callbacks for sliders
        for (const { key, layerKey, type } of layerSliderConfigs) {
            const layer = mapLayers.get(layerKey)?.layer as FeatureLayer;
            if (!layer) { console.warn(`missing layer for slider: ${layerKey}`); continue; }

            if (type === 'opacity') {
                const ogColors = (layer.renderer as ClassBreaksRenderer)
                    .classBreakInfos.map(cb => (cb.symbol as SimpleFillSymbol).color.clone());
                sliderCallbacks[key] = makeOpacityCallback(layer, ogColors);
            } else {
                const renderer = layer.renderer;
                if (!renderer) continue;
                const ogSizes = renderer.type === 'unique-value'
                    ? ((renderer as UniqueValueRenderer).visualVariables![0] as SizeVariable)
                        .stops!.map(s => (s as SizeStop).size as number)
                    : (renderer as ClassBreaksRenderer)
                        .classBreakInfos.map(cb => (cb.symbol as SimpleLineSymbol).width);
                sliderCallbacks[key] = makeSizeCallback(layer, ogSizes);
            }   
        }
 
        // add real highlightPlaces callback to secondary action bar
        const layerView = await view?.whenLayerView(placesLayer!);
        const newActBars = actionBars.map((bar) => highlightPlaces({ bar, placesLayer, layerView, activeHighlight }) ?? bar);
        setBuiltActionBars(newActBars);

        // add real slider callbacks to SliderBlocks in panels
        const newPanels = panels.map(panel => {
            if (panel.id !== PANEL_CSS_CLASSES['modifiers']) return panel;
            return {
                ...panel,
                ready: true,
                blockComponents: [
                    <SliderBlock id='slider-0' heading='Tract Opacity' min={0} max={0.5} value={0.05} step={0.01}
                        onInput={async (v) => { console.log('slider onInput called', v); sliderCallbacks.tractOpacity(v) }} />,
                    <SliderBlock id='slider-1' heading='Bus Stop Size' min={0.1} max={3} value={1} step={0.1}
                        onInput={async (v) => sliderCallbacks.busSize(v)} />,
                    <SliderBlock id='slider-2' heading='MetroLink Stop Size' min={0.1} max={3} value={1} step={0.1}
                        onInput={async (v) => sliderCallbacks.metroSize(v)} />,
                    <SliderBlock id='slider-3' heading='Line Size' min={0.25} max={15} value={1} step={0.25}
                        onInput={async (v) => sliderCallbacks.lineSize(v)} />,
                ],
            };
        });
        setBuiltPanels(newPanels);
        setView(view);
    }
};
