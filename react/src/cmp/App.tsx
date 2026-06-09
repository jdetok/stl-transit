// import { BASEMAP, EXTENT, HIGHLIGHTS, PANEL_CSS_CLASSES } from '@/consts';
import {
    BASEMAP, EXTENT, HIGHLIGHTS,
    // PANEL_CSS_CLASSES
} from '@/consts';
import { actionBars, panels, mapLayers } from '@/data';
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { useCallback, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';

import { highlightPlaces, makeFeatureLayer } from '@/utils';
import { actionBarProps } from './calcite/ActionBar';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

export default function App() {
    const [view, setView] = useState<MapView | null>(null);
    const [builtActionBars, setBuiltActionBars] = useState<actionBarProps[]>(actionBars);
    const activeHighlight = useRef<{ remove: () => void } | null>(null);

    const onViewReady = useCallback(async (view: MapView) => {
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

        const placesLayer = mapLayers.get('places')?.layer as FeatureLayer | undefined;
        const layerView = await view?.whenLayerView(placesLayer!);
        const newActBars = actionBars.map((bar) => highlightPlaces({ bar, placesLayer, layerView, activeHighlight }));

        setBuiltActionBars(newActBars);
        setView(view);
    }, []);

    return (
        <main className='app'>
            <Hdr ttl='St. Louis Transit Map' />
            <MapDiv
                view={view}
                basemap={BASEMAP}
                extent={EXTENT}
                onViewReady={onViewReady}
                actionBars={builtActionBars}
                panels={panels}
            />
        </main>
    )
}