import { BASEMAP, EXTENT, HIGHLIGHTS, PANEL_CSS_CLASSES } from '@/consts';
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { useCallback, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import { makeFeatureLayer } from '@/utils';
import { FeatureLayerMeta, mapLayer } from '@/types';
import {
    makeCyclingLayer, makePlacesLayer, makeLinesLayer, makeMetroStopsLayer,
    makeBusStopsLayer, makeAmtrakLayer, makeCountiesLayer, makeTractsLayer, 
} from '@/layers';
import { actionBarProps } from './calcite/ActionBar';
import { panelProps } from './calcite/Panel';

const phFn = () => console.log('test');

const actionBars: actionBarProps[] = [{
    layout: 'horizontal', cssClass: 'actbar1', expandable: true,
    actions: [
        { text: 'Legend', label: 'Legend', scale: 's', icon: 'legend', panelKey: PANEL_CSS_CLASSES['legend']},
        { text: 'Layers', label: 'Layers', scale: 's', icon: 'layers', panelKey: PANEL_CSS_CLASSES['layerlist']},
    ],
}, {
    layout: 'vertical', cssClass: 'actbar2', expandable: false,
    actions: [
        {text: 'Legend', label: 'Legend', scale: 's', icon: 'legend', onClick: phFn},
    ],
}];

// isOpen should only be set on a maximum of one item (open by default)
const panels: panelProps[] = [
    { key: PANEL_CSS_CLASSES['legend']!, childType: 'legend', heading: 'Legend', closable: true, isOpen: true },
    { key: PANEL_CSS_CLASSES['layerlist']!, childType: 'layerlist', heading: 'Layers', closable: true },
];

const mapLayers: Map<string, mapLayer> = new Map([
    ['counties', { fn: makeCountiesLayer, meta: {} as FeatureLayerMeta, i: 0 },],
    ['tracts', { fn: makeTractsLayer, meta: {} as FeatureLayerMeta, i: 1 },],
    ['amtrak', { fn: makeAmtrakLayer, meta: {} as FeatureLayerMeta, i: 2 }],
    ['cycling', { fn: makeCyclingLayer, meta: {} as FeatureLayerMeta, i: 3 }],
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