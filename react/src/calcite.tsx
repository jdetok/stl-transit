import CalciteButton from "@/cmp/CalciteBtn";
import type { ReactElement } from 'react'

type routeBtnsProps = {
    routeNames: string;
    onRouteClick: (route: string) => void;
    onRoutesClick: (route: string | string[]) => void;
}

export function RouteBtns({ routeNames, onRouteClick, onRoutesClick }: routeBtnsProps) {
    if (!routeNames) return null;

    const routes = routeNames.split(', ').filter(r => !r.includes('No bus stop')).map(r => r.trim());
    
    return (
        <div className='route-btns'>
            {routes.map((route, i) => (
                <CalciteButton key={`route-${i}`} txt={route} onClick={() => onRouteClick(route.trim())} />
            ))}
            {routes.length > 1 && (
                <CalciteButton txt="Highlight Each" onClick={() => onRoutesClick(routes)} />
            )}
        </div>
    );
}

export function makeRoutesButtons(routeNames: string,
    onRouteClick: (route: string) => void,
    onRoutesClick: (route: string | string[]) => void
): ReactElement[] {
    let routeBtns: ReactElement[] = [];
    if (routeNames) {
        routeNames.split(", ").forEach((route: string) => {
            if (route.includes("No bus stop")) return;
            const btn = (<CalciteButton txt={route} onClick={() => onRouteClick(route.trim())} />);
            routeBtns.push(btn);
        });
        if (routeBtns.length > 1) {
            const routes = routeNames.split(", ").map(r => r.trim());
            const allBtn = (<CalciteButton txt="Highlight Each" onClick={() => onRoutesClick(routes)} />);
            routeBtns.push(allBtn)
        }
    }
    return routeBtns;
}