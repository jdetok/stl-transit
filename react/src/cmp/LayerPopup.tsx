import { RouteBtns } from '@/cmp/RouteBtns';
import FieldInfo from '@arcgis/core/popup/FieldInfo';
import { CSSProperties } from 'react';

type layerPopupProps = {
    attrs: Record<string, any>;
    fieldInfos: FieldInfo[];
    routeField: string;
    routeLabel: string; 
    onRouteClick: (route: string) => void;
    onRoutesClick: (route: string | string[]) => void;
    onRoutesClear: () => void;
};

const styleGridCont = {
    overflow: 'hidden',
    display: 'grid',
    gap: '0.4rem',
} as CSSProperties;

const styleFlexCont = {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
} as CSSProperties;

const styleHeader = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textDecoration: 'underline',
} as CSSProperties;


export default function LayerPopup({
    attrs, fieldInfos, routeField, routeLabel, onRouteClick, onRoutesClick, onRoutesClear,
}: layerPopupProps) {
    const routeNames = attrs?.[routeField];
    return (
        <div className='popup' style={styleGridCont}>
                <div style={styleFlexCont}>
                    {fieldInfos.filter(({ fieldName }) => fieldName !== routeField).map(({ fieldName, label }) => {
                        const val = (attrs?.[fieldName!]);
                        if (val !== 'false') return (
                            <div key={fieldName}>
                                <span>{label}<b>{val === 'true' ? '' : `: ${val}`}</b></span>
                            </div>
                        )
                    })}
                </div>
                <div style={styleFlexCont}>
                {routeNames && (
                    // <div>
                    <RouteBtns
                        routeNames={routeNames}
                        routeLabel={routeLabel}
                        onRouteClick={onRouteClick}
                        onRoutesClick={onRoutesClick}
                        onClear={onRoutesClear}
                    />

                )}</div>
        </div>
    );
}