import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-layer-list';
import '@arcgis/map-components/components/arcgis-basemap-gallery';
import '@arcgis/map-components/components/arcgis-print';
import { Fragment, ReactNode } from 'react';

type containerTypes = 'panel' | 'block';
type containerChildTypes = 'legend' | 'layerlist' | 'basemaps' | 'print' | 'div';
type containerChildMap = Record<containerChildTypes, ReactNode>;
export type panelChildTypes = containerChildTypes | 'blocks'; 
export type blockChildTypes = 'slider' | 'dropdown' | 'select' | 'div';
type blockChildMap = Record<blockChildTypes, ReactNode>;
const blockChildrenTypes: blockChildMap = {
    slider: <calcite-slider />,
    dropdown: <calcite-dropdown />,
    select: <calcite-select label=''/>,
    div: <div />,
};
const containerChildrenTypes: containerChildMap = {
    legend: <arcgis-legend legendStyle='classic' />,
    layerlist: <arcgis-layer-list />,
    basemaps: <arcgis-basemap-gallery />, 
    print: <arcgis-print />,
    div: <div />,
};

export type containerProps = {
    key: string;
    containerType: containerTypes;
    childType: containerChildTypes | blockChildTypes | panelChildTypes;
    heading?: string;
    closable?: boolean;
    cssClass?: string;
    slot?: string;
    isOpen?: boolean;
    onClose?: () => void;
    children?: ReactNode;
    ready?: boolean;
};

export type blockProps = Omit<containerProps & { childType: blockChildTypes }, 'containerType' | 'key'> & { id?: string };
export type panelProps = Omit<containerProps & {
    blocks?: blockProps[],
    blockComponents?: ReactNode[],
}, 'containerType' | 'key'> & { id?: string };

export const Panel = ({ id, childType, heading, isOpen, closable, cssClass, slot, onClose, blockComponents, ready }: panelProps) => {
    const child = childType === 'blocks'
        ? blockComponents?.map((b, i) => <Fragment key={i}>{b}</Fragment>)
        : containerChildrenTypes[childType]
    return (
        <calcite-panel key={`${id}-${ready}`} className={cssClass} slot={slot}
            heading={heading} closable={closable} closed={!isOpen}
            oncalcitePanelClose={onClose}
        >{child}</calcite-panel>
    );
}

export const Block = ({ id, childType, heading, cssClass, slot, children }: blockProps) => {
    return (
        <calcite-block key={id} className={cssClass} slot={slot} heading={heading} collapsible expanded>
            {children ?? blockChildrenTypes[childType as blockChildTypes]}
        </calcite-block>
    )
}