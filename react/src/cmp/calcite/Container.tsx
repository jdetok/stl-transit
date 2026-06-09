import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-layer-list';
import { ReactNode } from 'react';

type containerTypes = 'panel' | 'block';
type containerChildTypes = 'legend' | 'layerlist' | 'div';
type containerChildMap = Record<containerChildTypes, ReactNode>;
export type panelChildTypes = containerChildTypes | 'blocks'; 
export type blockChildTypes = 'slider' | 'dropdown' | 'div';
type blockChildMap = Record<blockChildTypes, ReactNode>;
const blockChildrenTypes: blockChildMap = {
    slider: <calcite-slider />,
    dropdown: <calcite-dropdown />,
    div: <div />,
};
const containerChildrenTypes: containerChildMap = {
    legend: <arcgis-legend legendStyle='classic' />,
    layerlist: <arcgis-layer-list />,
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
};

export type blockProps = Omit<containerProps & { childType: blockChildTypes }, 'containerType'>;
export type panelProps = Omit<containerProps & { blocks?: containerProps[] }, 'containerType'>;

export const Panel = ({ key, childType, heading, isOpen, closable, cssClass, slot, onClose }: panelProps) => {
    return (
        <calcite-panel key={key} className={cssClass} slot={slot}
            heading={heading} closable={closable} closed={!isOpen}
            oncalcitePanelClose={onClose}
        >{containerChildrenTypes[childType]}</calcite-panel>
    );
}

export const Block = ({ key, heading, cssClass, slot, children }: blockProps) => {
    return (
        <calcite-block key={key} className={cssClass} slot={slot} heading={heading}>
            {children}
        </calcite-block>
    )
}