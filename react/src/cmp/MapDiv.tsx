import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-legend";
import Extent from "@arcgis/core/geometry/Extent";
import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map';
import { useEffect, useRef, useState } from "react";
import MapView from "@arcgis/core/views/MapView";
import ActionBar, { actionBarProps } from "./calcite/ActionBar";
import Panel, { panelProps } from "./calcite/Panel";

type mapProps = {
    basemap: string;
    extent: Extent;
    onViewReady: (view: MapView) => void;
    actionBars?: actionBarProps[];
    panels?: panelProps[];
};

export default function MapDiv({ basemap, extent, onViewReady, actionBars, panels }: mapProps) {
    const mapRef = useRef<ArcgisMap>(null);
    const [openPanelKey, setOpenPanelKey] = useState<string | null>(
        () => panels?.find(p => p.isOpen)?.key ?? null
    );

    const handlePrimaryActionClick = (panelKey?: string) => { 
        if (!panelKey) return;
        setOpenPanelKey(prev => prev === panelKey ? null : panelKey)
    };

    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;

        const handler = (e: Event) => {
            const view = (e.target as ArcgisMap).view as MapView;
            if (view) onViewReady(view);
        };

        if (el.view) {
            onViewReady(el.view as MapView);
        } else {
            el.addEventListener('arcgisViewReadyChange', handler);
        }

        return () => el.removeEventListener('arcgisViewReadyChange', handler);
    }, [onViewReady]);

    return (
        <arcgis-map className="map-div" ref={mapRef} basemap={basemap} extent={extent}>
            <arcgis-zoom slot='top-left'></arcgis-zoom>
            <arcgis-search slot='top-right'></arcgis-search>
            {actionBars?.map((bar, i) => (
                <ActionBar key={i} {...bar} onActionClick={handlePrimaryActionClick}/>
            ))}
            {panels?.map((panel) => (
                <Panel {...panel} key={panel.key}
                    isOpen={openPanelKey === panel.key}
                    onClose={() => setOpenPanelKey(null)}
                />
            ))}
        </arcgis-map>
    )
}