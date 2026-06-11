import { styleBorderRad } from '@/css';
import type { IconName } from '@esri/calcite-components/dist/components/calcite-icon/interfaces';
import type { Appearance, Scale } from '@esri/calcite-components/dist/components/interfaces';
import { MouseEventHandler, useState } from 'react';

export type buttonProps = {
    txt: string,
    appearance?: Appearance;
    scale?: Scale,
    icon?: IconName;
    onClick?: MouseEventHandler;
    active?: boolean;
};

export default function Button({ txt, appearance, scale, icon, onClick, active }: buttonProps) {
    const [hovered, setHovered] = useState(false);
    const cssActive = 'rgba(10,20,50,0.25)';
    const cssActiveHover = 'rgba(1,1,1,0.3)';
    const cssHover = 'rgba(10,20,50,0.2)';
    const cssIdle = 'rgba(5,10,25,0.05)';
    return (
        <calcite-button
            appearance={appearance ?? 'transparent'}
            scale={scale ?? 's'}
            iconStart={icon}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...styleBorderRad,
                margin: '1px 1.5px',
                background: active ? hovered ? cssActiveHover : cssActive : hovered ? cssHover : cssIdle, 
            }}
            round
        >{txt}</calcite-button>
    )
}