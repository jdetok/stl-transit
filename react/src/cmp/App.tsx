import Hdr from '@/cmp/Hdr';
import MapDiv from '@/cmp/MapDiv';
import { viewReady } from '@/viewReady';
import { BASEMAP, EXTENT, ftrItems, hdrTtl } from '@/consts';
import { actionBars, panels } from '@/data';
import MapView from '@arcgis/core/views/MapView';
import { actionBarProps } from './calcite/ActionBar';
import { useCallback, useRef, useState } from 'react';
import { panelProps } from './calcite/Container';
import Ftr from './Ftr';

export default function App() {
    const [view, setView] = useState<MapView | null>(null);
    const [builtActionBars, setBuiltActionBars] = useState<actionBarProps[]>(actionBars);
    const [builtPanels, setBuiltPanels] = useState<panelProps[]>(panels);
    const activeHighlight = useRef<{ remove: () => void } | null>(null);
    const onViewReady = useCallback(viewReady({ setView, setBuiltActionBars, setBuiltPanels, activeHighlight }), []);

    return (
        <main className='app'>
            <Hdr ttl={hdrTtl} />
            <MapDiv
                view={view}
                basemap={BASEMAP}
                extent={EXTENT}
                onViewReady={onViewReady}
                actionBars={builtActionBars}
                panels={builtPanels}
            />
            <Ftr items={ftrItems}/>
        </main>
    )
}