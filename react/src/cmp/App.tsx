import { BASEMAP, EXTENT, HIGHLIGHTS } from "@/consts";
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { useCallback, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import { makeFeatureLayer } from "@/utils";
import { FeatureLayerMeta, mapLayer } from "@/types";
import {
    LAYER_CENSUS_COUNTIES, LAYER_CENSUS_TRACTS, LAYER_CYCLING, LAYER_AMTRAK,
    makePlacesLayer, makeLinesLayer, makeMetroStopsLayer, makeBusStopsLayer, 
} from "@/layers";

const mapLayers: Map<string, mapLayer> = new Map([
    ['counties', { meta: { ...LAYER_CENSUS_COUNTIES }, i: 0 },],
    ['tracts', { meta: { ...LAYER_CENSUS_TRACTS }, i: 1 }],
    ['amtrak', { meta: { ...LAYER_AMTRAK }, i: 2 }],
    ['cycling', { meta: { ...LAYER_CYCLING }, i: 3 }],
    ['places', { fn: makePlacesLayer, meta: {} as FeatureLayerMeta, i: 4 }],
    ['lines', { fn: makeLinesLayer, meta: {} as FeatureLayerMeta, i: 5 }],
    ['metro', { fn: makeMetroStopsLayer, meta: {} as FeatureLayerMeta, i: 6 }],
    ['bus', { fn: makeBusStopsLayer, meta: {} as FeatureLayerMeta, i: 7 }],
]);

export default function App() {
    const [_, setView] = useState<MapView | null>(null);

    const onViewReady = useCallback(async (view: MapView) => {
        console.log('view')
        view.highlights = HIGHLIGHTS;

        const layers = [...mapLayers.entries()];

        await Promise.all(layers.map(async ([k, v]) => {
            try {
                if (v.fn) v.meta = v.fn(
                    (route: string | string[]) => { console.log(route) },
                    (routes: string | string[]) => { console.log(routes) }
                )
            } catch (err) {
                console.error('error building FeatureLayerMeta:', err);
            }
            try {
                v.layer = await makeFeatureLayer(v.meta);
                view.map?.add(v.layer);
                console.log('added layer:', k);
            } catch (err) {
                console.error('error building FeatureLayer:', err);
            }
        }));

        layers.sort(([, v1], [_, v2]) => v1.i - v2.i).forEach(([k, v]) => {
            if (v.layer) {
                view.map?.add(v.layer);
            } else {
                console.warn('missing layer:', k);
            }
        });
        
        setView(view);
    }, []);

    return (
        <main className="app">
            <Hdr ttl="St. Louis Transit Map" />
            <MapDiv
                basemap={BASEMAP}
                extent={EXTENT}
                onViewReady={onViewReady}
            />
        </main>
    )
}