// import { BASEMAP, EXTENT, HIGHLIGHTS, PANEL_CSS_CLASSES } from '@/consts';
import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { viewReady } from '@/viewReady';
import { BASEMAP, EXTENT } from '@/consts';
import { actionBars, panels } from '@/data';
import MapView from '@arcgis/core/views/MapView';
import { actionBarProps } from './calcite/ActionBar';
import { useCallback, useRef, useState } from 'react';

export default function App() {
    const [view, setView] = useState<MapView | null>(null);
    const [builtActionBars, setBuiltActionBars] = useState<actionBarProps[]>(actionBars);
    const activeHighlight = useRef<{ remove: () => void } | null>(null);

    const onViewReady = useCallback(viewReady({ setView, setBuiltActionBars, activeHighlight }), []);

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