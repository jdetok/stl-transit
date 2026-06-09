// import { BASEMAP, EXTENT, HIGHLIGHTS, PANEL_CSS_CLASSES } from '@/consts';
import {
    BASEMAP, EXTENT, HIGHLIGHTS,
    // PANEL_CSS_CLASSES
} from '@/consts';
import { actionBars, panels, mapLayers } from '@/data';
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { useCallback, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';

import { makeFeatureLayer } from '@/utils';

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
        <main className='app'>
            <Hdr ttl='St. Louis Transit Map' />
            <MapDiv
                basemap={BASEMAP}
                extent={EXTENT}
                onViewReady={onViewReady}
                actionBars={actionBars}
                panels={panels}
            />
        </main>
    )
}