import Button from '@/cmp/calcite/Button';

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
                <Button key={`route-${i}`} txt={route} onClick={() => onRouteClick(route.trim())} />
            ))}
            {routes.length > 1 && (
                <Button txt='Highlight Each' onClick={() => onRoutesClick(routes)} />
            )}
        </div>
    );
}