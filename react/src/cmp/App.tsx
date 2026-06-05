import { BASEMAP, EXTENT, HIGHLIGHTS } from "@/consts";
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { useCallback, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import { watch } from "@arcgis/core/core/reactiveUtils";
import { cleanupPopupRoots, makeFeatureLayer } from "@/utils";
import { FeatureLayerMeta, mapLayer } from "@/types";
import { makeLinesLayer } from "@/layers";
// import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const mapLayers: Map<string, mapLayer> = new Map([
    ['lines', { fn: makeLinesLayer, meta: {} as FeatureLayerMeta }],
]);

export default function App() {
    const [_, setView] = useState<MapView | null>(null);

    const onViewReady = useCallback(async (view: MapView) => {
        console.log('view')
        view.highlights = HIGHLIGHTS;

        watch(() => view.popup?.visible, visible => { if (!visible) cleanupPopupRoots() });

        await Promise.all([...mapLayers.entries()].map(async ([k, v]) => {
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