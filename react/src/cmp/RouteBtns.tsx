import Button from '@/cmp/calcite/Button';
import { styleBorderRadPadded } from '@/css';
import { act, useState } from 'react';

type routeBtnsProps = {
    routeNames: string;
    routeLabel: string;
    onRouteClick: (route: string) => void;
    onRoutesClick: (route: string | string[]) => void;
    onClear: () => void;
};

export function RouteBtns({ routeNames, routeLabel, onRouteClick, onRoutesClick, onClear }: routeBtnsProps) {
    if (!routeNames) return null;
    const [activeRoute, setActiveRoute] = useState<string | null>(null);

    const routes = routeNames.split(', ').filter(r => !r.includes('No bus stop')).map(r => r.replace("'", "").trim());
    
    const handleRouteClick = (route: string) => {
        if (activeRoute === route) {
            setActiveRoute(null);
            onClear();
        } else {
            setActiveRoute(route);
            onRouteClick(route.trim());
        }
    };

    const handleAllClick = () => {
        if (activeRoute === 'all') {
            setActiveRoute(null);
            onClear();            
        } else {
            setActiveRoute('all');
            onRoutesClick(routes);
        }
    }

    return (
        <div className='route-btns' style={styleBorderRadPadded}>
            <div>{routeLabel}: {routes.length > 1 && (
                <Button
                    txt='Highlight All'
                    onClick={handleAllClick}
                    active={activeRoute === 'all'}
                />
            )}</div>
            {routes.map((route, i) => (
                <Button
                    key={`route-${i}`}
                    txt={route}
                    onClick={() => handleRouteClick(route)}
                    active={activeRoute === route}
                />
            ))}
        </div>
    );
}