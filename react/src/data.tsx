import { actionBarProps } from "./cmp/calcite/ActionBar";
import { PANEL_CSS_CLASSES, HL_CHURCH, HL_GROCERY, HL_MED, HL_PARKS, HL_SCHOOLS,  } from "./consts";
import { makeChoroRanges, mapFullscreen, tractsField } from "./utils";
import FieldInfo from "@arcgis/core/popup/FieldInfo";
import { cplethEls, FeatureLayerMeta, mapLayer } from "./types";
import {
    makeAmtrakLayer, makeBusLinesLayer, makeBusStopsLayer, makeCountiesLayer, makeCyclingLayer,
    makeMetroLinesLayer, makeMetroStopsLayer, makePlacesLayer, makeTractsLayer
} from './layers';
import { panelProps } from "./cmp/calcite/Container";
import SliderBlock from "@/cmp/calcite/SliderBlock";
import SelectBlock from "./cmp/calcite/SelectBlock";
import DropdownBlock from "./cmp/calcite/ListBlock";

export const TRACT_CLASSBREAKS: Map<FieldInfo, cplethEls[]> = new Map([
    [tractsField('popl_dens'), makeChoroRanges(5, [0, 2500, 5000, 7500, 10000, 100000])],
    [tractsField('pov_dens'), makeChoroRanges(5, [0, 150, 450, 1000, 3000, 40000])],
    [tractsField('med_inc'), makeChoroRanges(5, [0, 30000, 45000, 70000, 100000, 400000])],
    [tractsField('med_age'), makeChoroRanges(5, [0, 30, 35, 45, 60, 100])],
    [tractsField('med_rent'), makeChoroRanges(5, [0, 700, 950, 1350, 2000, 5000])],
]);

// isOpen should only be set on a maximum of one item (open by default)
export const panels: panelProps[] = [
    { id: PANEL_CSS_CLASSES['legend']!, childType: 'legend', heading: 'Legend', closable: true, isOpen: true },
    { id: PANEL_CSS_CLASSES['layerlist']!, childType: 'layerlist', heading: 'Layers', closable: true },
    { id: PANEL_CSS_CLASSES['basemaps']!, childType: 'basemaps', heading: 'Basemaps', closable: true },
    { id: PANEL_CSS_CLASSES['print']!, childType: 'print', heading: 'Export', closable: true },
    { id: PANEL_CSS_CLASSES['modifiers']!, childType: 'blocks',
        heading: 'Appearance Modifiers', closable: true, useGrid2v: true,
        blockComponents: [
            <SelectBlock id='select-0' heading='Tract Opacity Field' />,
            <SliderBlock id='slider-0' heading='Tract Opacity'  />,
            <SliderBlock id='slider-1' heading='MetroBus Stop Size' />,
            <SliderBlock id='slider-2' heading='MetroLink Stop Size' />,
            <SliderBlock id='slider-3' heading='MetroBus Line Size' />,
            <SliderBlock id='slider-4' heading='MetroLink Line Size' />,
        ]
    },
    { id: PANEL_CSS_CLASSES['routes']!, childType: 'blocks', heading: 'Bus Routes', closable: true, blockComponents: [
        <DropdownBlock id='dropdown-0' heading='Bus Routes' />,
    ]},
];

export const mapLayers: Map<string, mapLayer> = new Map([
    ['counties', { fn: makeCountiesLayer, meta: {} as FeatureLayerMeta, i: 0 },],
    ['tracts', { fn: makeTractsLayer, meta: {} as FeatureLayerMeta, i: 1 },],
    ['amtrak', { fn: makeAmtrakLayer, meta: {} as FeatureLayerMeta, i: 2 }],
    ['cycling', { fn: makeCyclingLayer, meta: {} as FeatureLayerMeta, i: 3 }],
    ['places', { fn: makePlacesLayer, meta: {} as FeatureLayerMeta, i: 4 }],
    ['metrolines', { fn: makeMetroLinesLayer, meta: {} as FeatureLayerMeta, i: 5 }],
    ['buslines', { fn: makeBusLinesLayer, meta: {} as FeatureLayerMeta, i: 5 }],
    ['metro', { fn: makeMetroStopsLayer, meta: {} as FeatureLayerMeta, i: 7 }],
    ['bus', { fn: makeBusStopsLayer, meta: {} as FeatureLayerMeta, i: 8 }],
]);

export const actionBars: actionBarProps[] = [{
    layout: 'horizontal', cssClass: 'actbar1', expandable: true,
    actions: [
        { text: 'Legend', label: 'Legend', scale: 'm', icon: 'legend', panelKey: PANEL_CSS_CLASSES['legend']},
        { text: 'Layers', label: 'Layers', scale: 'm', icon: 'layers', panelKey: PANEL_CSS_CLASSES['layerlist']},
        { text: 'Basemaps', label: 'Basemaps', scale: 'm', icon: 'basemap', panelKey: PANEL_CSS_CLASSES['basemaps']},
        { text: 'Modifiers', label: 'Appearance Modifiers', scale: 'm', icon: 'sliders', panelKey: PANEL_CSS_CLASSES['modifiers']},
        { text: 'Bus Routes', label: 'AppearanBus Routes', scale: 'm', icon: 'bus', panelKey: PANEL_CSS_CLASSES['routes'] },
        { id: 'clear', text: 'Clear Highlighted Routes', label: 'Clear Highlighted Routes', scale: 'm', icon: 'reset' },
        { text: 'Export', label: 'Export', scale: 'm', icon: 'print', panelKey: PANEL_CSS_CLASSES['print']},
        { text: 'Fullscreen', label: 'Fullscreen', scale: 'm', icon: 'extent', onClick: mapFullscreen},
    ],
}, {
    layout: 'vertical', cssClass: 'actbar2', expandable: false,
    actions: [
        {
            id: "parks", icon: "tree", text: "Highlight Parks",
            where: `type = 'park'`, highlightName: HL_PARKS.name!,
        }, {
            id: "medical", icon: "medical", text: "Highlight Hospitals",
            where: `type = 'medical'`, highlightName: HL_MED.name!,
        }, {
            id: "university", icon: "mooc", text: "Highlight Universities",
            where: `type = 'university'`, highlightName: HL_SCHOOLS.name!,
        }, {
            id: "school", icon: "education", text: "Highlight Schools",
            where: `type = 'school'`, highlightName: HL_SCHOOLS.name!,
        }, {
            id: "grocery", icon: "shopping-cart", text: "Highlight Grocery Stores",
            where: `type = 'grocery'`, highlightName: HL_GROCERY.name!,
        }, {
            id: "church", icon: "organization", text: "Highlight Places of Worship",
            where: `type = 'church'`, highlightName: HL_CHURCH.name!,
        }, {
            id: "social_facility", icon: "home", text: "Highlight Community Centers",
            where: `type = 'social_facility'`, highlightName: HL_MED.name!,
        }, {
            id: "clear", icon: "x", text: "Clear Highlighted",
            where: `type = ''`, highlightName: HL_MED.name!,
        },
    ],
}];