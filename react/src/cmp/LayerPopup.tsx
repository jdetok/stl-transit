import { RouteBtns } from '@/calcite';
import FieldInfo from '@arcgis/core/popup/FieldInfo';

type layerPopupProps = {
    attrs: Record<string, any>;
    fieldInfos: FieldInfo[];
    routeField: string;
    routeLabel: string; 
    onRouteClick: (route: string) => void;
    onRoutesClick: (route: string | string[]) => void;
};

export default function LayerPopup({
    attrs, fieldInfos, routeField, routeLabel, onRouteClick, onRoutesClick
}: layerPopupProps) {
    const routeNames = attrs?.[routeField];
    return (
        <table className='popup'>
            <tbody>
                {routeNames && (
                    <tr>
                        <td>{routeLabel}</td>
                        <td>
                            <RouteBtns
                                routeNames={routeNames}
                                onRouteClick={onRouteClick}
                                onRoutesClick={onRoutesClick}
                            />
                        </td>
                    </tr>
                )}
                {fieldInfos.filter(({ fieldName }) => fieldName !== routeField).map(({ fieldName, label }) => (
                    <tr key={fieldName}>
                        <td>{label}</td>
                        <td>{attrs?.[fieldName!] ?? '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}