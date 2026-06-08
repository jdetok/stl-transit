import { ReactNode } from "react";

export type panelChildTypes = 'legend' | 'div';

export type panelProps = {
    childType: panelChildTypes,
    heading?: string,
    closable?: boolean,
    cssClass?: string,
    slot?: string,
};

const panelChildMap: Record<panelChildTypes, ReactNode> = {
    legend: <arcgis-legend legendStyle='classic' />,
    div: <div />,
};

export default function Panel({ childType, heading, closable, cssClass, slot }: panelProps) {
    return (
        <calcite-panel className={cssClass} slot={slot} heading={heading} closable={closable}>
            {panelChildMap[childType]}
        </calcite-panel>
    );
}