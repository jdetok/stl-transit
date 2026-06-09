import MapView from '@arcgis/core/views/MapView';
import Extent from '@arcgis/core/geometry/Extent';
import { useEffect, useRef, useState } from 'react';
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-zoom';
import '@arcgis/map-components/components/arcgis-search';
import ActionBar, { actionBarProps } from './calcite/ActionBar';
import { Panel, type panelProps } from './calcite/Container';
import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map';

type mapProps = {
    basemap: string;
    extent: Extent;
    onViewReady: (view: MapView) => void;
    actionBars?: actionBarProps[];
    panels?: panelProps[];
    view?: MapView | null;
};

export default function MapDiv({ basemap, extent, onViewReady, actionBars, panels, view }: mapProps) {
    const mapRef = useRef<ArcgisMap>(null);
    const [openPanelKey, setOpenPanelKey] = useState<string | null>(
        () => panels?.find(p => p.isOpen)?.id ?? null
    );

    const handlePrimaryActionClick = (panelKey?: string) => { 
        if (!panelKey) return;
        setOpenPanelKey(prev => prev === panelKey ? null : panelKey)
    };

    const hasRun = useRef(false);
    useEffect(() => {
        if (hasRun.current) return;
        const el = mapRef.current;
        if (!el) return;

        const handler = (e: Event) => {
            const view = (e.target as ArcgisMap).view as MapView;
            if (view) {
                onViewReady(view);
                hasRun.current = true;
            } 
        };

        if (el.view) {
            onViewReady(el.view as MapView);
            hasRun.current = true;
        } else {
            el.addEventListener('arcgisViewReadyChange', handler);
        }

        return () => el.removeEventListener('arcgisViewReadyChange', handler);
    }, [onViewReady]);

    return (
        <arcgis-map className='map-div' ref={mapRef} basemap={basemap} extent={extent}>
            <arcgis-zoom slot='top-left'></arcgis-zoom>
            <arcgis-search slot='top-right'></arcgis-search>
            {actionBars?.map((bar, i) => (
                <ActionBar key={i} {...bar} onActionClick={handlePrimaryActionClick}/>
            ))}
            {panels?.map((panel, i) => (
                <Panel {...panel} key={`${panel.id}-${i}`}
                    isOpen={openPanelKey === panel.id}
                    onClose={() => setOpenPanelKey(null)}
                />
            ))}
        </arcgis-map>
    )
}