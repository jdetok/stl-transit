import { ReactNode } from "react";

export type panelChildTypes = 'legend' | 'div';

export type panelProps = {
    key: string;
    childType: panelChildTypes;
    heading?: string;
    closable?: boolean;
    cssClass?: string;
    slot?: string;
    isOpen?: boolean;
    onClose?: () => void;
};

const panelChildMap: Record<panelChildTypes, ReactNode> = {
    legend: <arcgis-legend legendStyle='classic' />,
    div: <div />,
};

export default function Panel({ key, childType, heading, isOpen, closable, cssClass, slot, onClose }: panelProps) {
    return (
        <calcite-panel key={key} className={cssClass} slot={slot}
            heading={heading} closable={closable} closed={!isOpen}
            oncalcitePanelClose={onClose}
        >{panelChildMap[childType]}</calcite-panel>
    );
}