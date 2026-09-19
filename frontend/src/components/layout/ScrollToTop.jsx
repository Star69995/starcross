import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router keeps the browser's scroll position across navigations, so
// following a Link from partway down a page lands mid-scroll on the next
// page instead of at its top - this resets it on every route change.
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
