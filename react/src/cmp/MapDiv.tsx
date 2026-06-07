import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-legend";
import Extent from "@arcgis/core/geometry/Extent";
import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map';
import { useEffect, useRef } from "react";
import MapView from "@arcgis/core/views/MapView";

type mapProps = {
    basemap: string;
    extent: Extent;
    onViewReady: (view: MapView) => void;
}

export default function MapDiv({ basemap, extent, onViewReady }: mapProps) {
    const mapRef = useRef<ArcgisMap>(null);

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
        <div className="map-div">
            <arcgis-map ref={mapRef} basemap={basemap} extent={extent}>
                <arcgis-zoom slot='top-left'></arcgis-zoom>
                <arcgis-search slot='top-right'></arcgis-search>
                <arcgis-legend slot='bottom-right' legendStyle='classic' hidden={false}></arcgis-legend>
            </arcgis-map>
        </div>
    )
}