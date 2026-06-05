import type { IconName } from '@esri/calcite-components/dist/components/calcite-icon/interfaces';
import type { Appearance, Scale } from "@esri/calcite-components/dist/components/interfaces";
import { MouseEventHandler } from 'react';

export type calciteBtnProps = {
    txt: string,
    appearance?: Appearance;
    scale?: Scale,
    icon?: IconName;
    onClick?: MouseEventHandler;
};

export default function CalciteButton({ txt, appearance, scale, icon, onClick }: calciteBtnProps) {
    return (
        <calcite-button
            appearance={appearance ?? 'outline'}
            scale={scale ?? 's'}
            iconStart={icon}
            onClick={onClick}
        >{txt}</calcite-button>
    )
}