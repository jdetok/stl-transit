import Renderer from '@arcgis/core/renderers/Renderer';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import Collection from '@arcgis/core/core/Collection';
import { PopupTemplateProperties } from '@arcgis/core/PopupTemplate';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

// as of @arcgis/core 5.0 __esri namespace is deprecated. have to create own types
export type ColorProperties = ConstructorParameters<typeof Color>[0];
export type CollectionProperties<t> = ConstructorParameters<typeof Collection<t>>[0];

export type featFilter = (feature: any) => boolean;

export type FeatureLayerMeta = {
    title: string;
    source?: Graphic[];
    dataUrl?: string;
    renderer: Renderer;
    popupTemplate?: PopupTemplateProperties;
    fields?: FieldProperties[];
    outFields?: string[];
    geometryType?: 'point' | 'polygon' | 'polyline';
    toGraphics?: (data: any, filter?: featFilter) => Graphic[];
    filter?: featFilter;
    legendEnabled?: boolean;
};

export type cplethEls = [number, number, readonly number[]];
export type choroProps = {
    levels?: cplethEls[],
    level?: cplethEls,
    opac: number,
    line?: boolean,
}
export type choropleth = {
    lvl1: [number, number, number],
    lvl2: [number, number, number],
    lvl3: [number, number, number],
    lvl4: [number, number, number],
    lvl5: [number, number, number],
};

export type mapLayer = {
    fn?: Function;
    meta: FeatureLayerMeta;
    layer?: FeatureLayer;
    i: number;
}

export type IconName = 'legend' | 'sliders' | 'layers' | 'basemap' | 'print' | 'bus' | 'reset' |
    'home' | 'organization' | 'education' | 'shopping-cart' | 'mooc' | 'medical' | 'park';