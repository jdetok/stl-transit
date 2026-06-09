import MapView from "@arcgis/core/views/MapView";
import { actionBarProps } from "./cmp/calcite/ActionBar";
import { RefObject } from "react";
import { HIGHLIGHTS } from "./consts";
import { actionBars, mapLayers } from "./data";
import { addLayer, applyRoutesFilter, buildFeatureLayer, highlightPlaces } from "./utils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// ON VIEW READY FUNC/ARGS
export type viewReadyArgs = {
    setView: (view: MapView) => void;
    setBuiltActionBars: (bars: actionBarProps[]) => void;
    activeHighlight: RefObject<{ remove: () => void } | null>;
};
export const viewReady = ({ setView, setBuiltActionBars, activeHighlight }: viewReadyArgs) => {
    return async (view: MapView) => {
        view.highlights = HIGHLIGHTS;
        
        const layers = [...mapLayers.entries()];

        const routeCallbacks = {
            onRouteClick: (route: string | string[]) => console.log('not ready', route),
            onRoutesClick: (routes: string | string[]) => console.log('not ready', routes),
        };

        const stableOnRouteClick = (route: string | string[]) => routeCallbacks.onRouteClick(route);
        const stableOnRoutesClick = (routes: string | string[]) => routeCallbacks.onRoutesClick(routes);

        await Promise.all(layers.map(([k, v]) => buildFeatureLayer(
            [k, v], stableOnRouteClick, stableOnRoutesClick
        )));

        layers.sort(([, v1], [_, v2]) => v1.i - v2.i).forEach(addLayer(view));

        const placesLayer = mapLayers.get('places')?.layer as FeatureLayer;
        const linesLayer = mapLayers.get('lines')?.layer as FeatureLayer;
        const metroLayer = mapLayers.get('metro')?.layer as FeatureLayer;
        const busLayer = mapLayers.get('bus')?.layer as FeatureLayer;
        const stopLayers = [metroLayer, busLayer].filter(Boolean) as FeatureLayer[];

        routeCallbacks.onRouteClick = (route) => applyRoutesFilter(view, linesLayer, stopLayers, route);
        routeCallbacks.onRoutesClick = (routes) => applyRoutesFilter(view, linesLayer, stopLayers, routes);

        for (const [, v] of layers) {
            if (!v.fn) continue;
            v.meta = v.fn(
                (route: string | string[]) => applyRoutesFilter(view, linesLayer, stopLayers, route),
                (routes: string | string[]) => applyRoutesFilter(view, linesLayer, stopLayers, routes),
            );
        }

        const layerView = await view?.whenLayerView(placesLayer!);
        const newActBars = actionBars.map((bar) => highlightPlaces({ bar, placesLayer, layerView, activeHighlight }) ?? bar);

        setBuiltActionBars(newActBars);
        setView(view);
    }
};
