import MapView from "@arcgis/core/views/MapView";
import { actionBarProps } from "./cmp/calcite/ActionBar";
import { RefObject } from "react";
import { HIGHLIGHTS } from "./consts";
import { actionBars, mapLayers } from "./data";
import { addLayer, buildFeatureLayer, highlightPlaces } from "./utils";
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

        await Promise.all(layers.map(buildFeatureLayer));

        layers.sort(([, v1], [_, v2]) => v1.i - v2.i).forEach(addLayer(view));

        const placesLayer = mapLayers.get('places')?.layer as FeatureLayer | undefined;
        const layerView = await view?.whenLayerView(placesLayer!);
        const newActBars = actionBars.map((bar) => highlightPlaces({ bar, placesLayer, layerView, activeHighlight }) ?? bar);

        setBuiltActionBars(newActBars);
        setView(view);
    }
};
