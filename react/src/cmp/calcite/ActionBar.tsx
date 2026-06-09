import type { IconName } from '@esri/calcite-components/dist/components/calcite-icon/interfaces';
import type { Scale } from '@esri/calcite-components/dist/components/interfaces';
import { MouseEventHandler } from 'react';

export type actionProps = {
    text: string,
    id?: string,
    label?: string;
    scale?: Scale,
    icon?: IconName;
    panelKey?: string;
    onClick?: MouseEventHandler;
    where?: string;
    highlightName?: string;
};

export type actionBarProps = {
    layout?: 'horizontal' | 'vertical' | 'grid';
    cssClass?: string;
    expandable?: boolean;
    actions?: actionProps[];
    onActionClick?: (panelKey?: string) => void;
};

export default function ActionBar({ cssClass, layout, expandable, actions, onActionClick }: actionBarProps) {
    return (
        <calcite-action-bar
            className={cssClass}
            layout={layout}
            expandDisabled={!(expandable ?? false)}
        >{actions?.map((action, i) => (
            <calcite-action
                key={i}
                scale={action.scale}
                text={action.text}
                icon={action.icon}
                label={action.label}
                onClick={(e) => {
                    action.onClick?.(e);
                    onActionClick?.(action.panelKey)
                }}
            />
        ))}</calcite-action-bar>
    );
}