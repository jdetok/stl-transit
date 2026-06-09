import { actionBarProps } from "./cmp/calcite/ActionBar";
import { PANEL_CSS_CLASSES } from "./consts";
import { makeChoroRanges, mapFullscreen, tractsField } from "./utils";
import FieldInfo from "@arcgis/core/popup/FieldInfo";
import { cplethEls, FeatureLayerMeta, mapLayer } from "./types";
import { makeAmtrakLayer, makeBusStopsLayer, makeCountiesLayer, makeCyclingLayer, makeLinesLayer, makeMetroStopsLayer, makePlacesLayer, makeTractsLayer } from './layers';
import { panelProps } from "./cmp/calcite/Container";
import SliderBlock from "@/cmp/calcite/SliderBlock";

export const TRACT_CLASSBREAKS: Map<FieldInfo, cplethEls[]> = new Map([
    [tractsField('popl_dens'), makeChoroRanges(5, [0, 2500, 5000, 7500, 10000, 100000])],
    [tractsField('pov_dens'), makeChoroRanges(5, [0, 150, 450, 1000, 3000, 40000])],
    [tractsField('med_inc'), makeChoroRanges(5, [0, 30000, 45000, 70000, 100000, 400000])],
    [tractsField('med_age'), makeChoroRanges(5, [0, 30, 35, 45, 60, 100])],
    [tractsField('med_rent'), makeChoroRanges(5, [0, 700, 950, 1350, 2000, 5000])],
]);

export const actionBars: actionBarProps[] = [{
    layout: 'horizontal', cssClass: 'actbar1', expandable: true,
    actions: [
        { text: 'Legend', label: 'Legend', scale: 'm', icon: 'legend', panelKey: PANEL_CSS_CLASSES['legend']},
        { text: 'Layers', label: 'Layers', scale: 'm', icon: 'layers', panelKey: PANEL_CSS_CLASSES['layerlist']},
        { text: 'Basemaps', label: 'Basemaps', scale: 'm', icon: 'basemap', panelKey: PANEL_CSS_CLASSES['basemaps']},
        { text: 'Modifiers', label: 'Appearance Modifiers', scale: 'm', icon: 'sliders', panelKey: PANEL_CSS_CLASSES['modifiers']},
        { text: 'Export', label: 'Export', scale: 'm', icon: 'print', panelKey: PANEL_CSS_CLASSES['print']},
        { text: 'Fullscreen', label: 'Fullscreen', scale: 'm', icon: 'extent', onClick: mapFullscreen},
    ],
}, {
    layout: 'vertical', cssClass: 'actbar2', expandable: false,
    actions: [
        {text: 'Legend', label: 'Legend', scale: 's', icon: 'legend'},
    ],
}];

// isOpen should only be set on a maximum of one item (open by default)
export const panels: panelProps[] = [
    { id: PANEL_CSS_CLASSES['legend']!, childType: 'legend', heading: 'Legend', closable: true, isOpen: true },
    { id: PANEL_CSS_CLASSES['layerlist']!, childType: 'layerlist', heading: 'Layers', closable: true },
    { id: PANEL_CSS_CLASSES['basemaps']!, childType: 'basemaps', heading: 'Basemaps', closable: true },
    { id: PANEL_CSS_CLASSES['print']!, childType: 'print', heading: 'Export', closable: true },
    { id: PANEL_CSS_CLASSES['modifiers']!, childType: 'blocks', heading: 'Appearance Modifiers', closable: true, blockComponents: [
        <SliderBlock id='slider-0' heading='Tract Opacity' min={0} max={1} value={1} step={0.1} />,
        <SliderBlock id='slider-1' heading='Bus Stop Size' min={0} max={1} value={1} step={0.1} />,
        <SliderBlock id='slider-2' heading='Bus Stop Size' min={0} max={1} value={1} step={0.1} />,
        <SliderBlock id='slider-3' heading='Line Size' min={0} max={1} value={1} step={0.1} />,
    ]},
];

export const mapLayers: Map<string, mapLayer> = new Map([
    ['counties', { fn: makeCountiesLayer, meta: {} as FeatureLayerMeta, i: 0 },],
    ['tracts', { fn: makeTractsLayer, meta: {} as FeatureLayerMeta, i: 1 },],
    ['amtrak', { fn: makeAmtrakLayer, meta: {} as FeatureLayerMeta, i: 2 }],
    ['cycling', { fn: makeCyclingLayer, meta: {} as FeatureLayerMeta, i: 3 }],
    ['places', { fn: makePlacesLayer, meta: {} as FeatureLayerMeta, i: 4 }],
    ['lines', { fn: makeLinesLayer, meta: {} as FeatureLayerMeta, i: 5 }],
    ['metro', { fn: makeMetroStopsLayer, meta: {} as FeatureLayerMeta, i: 6 }],
    ['bus', { fn: makeBusStopsLayer, meta: {} as FeatureLayerMeta, i: 7 }],
]);