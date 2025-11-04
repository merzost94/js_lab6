import { createElement } from '../utils/createComponent.js';
import { ROUTES } from '../data/routes.js';

export function renderBreadcrumbs(currentHash) {
    const container = createElement('div', { class: 'breadcrumbs' });
    const segments = currentHash.split('#').filter(s => s);
    let path = '';
    
    segments.forEach((segment, index) => {
        path += (path ? '#' : '#') + segment;
        const routeData = ROUTES[path];

        if (routeData) {
            const isLast = index === segments.length - 1;
            
            const link = createElement('a', { 
                href: path, 
                class: isLast ? 'active' : '' 
            }, [routeData.title]);
            
            container.appendChild(link);

            if (!isLast) {
                container.appendChild(document.createTextNode(' > '));
            }
        }
    });

    return container;
}