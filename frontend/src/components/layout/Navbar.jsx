import { useRef, useEffect } from 'react'; // Import useRef and useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthContext';
import { Collapse, Dropdown } from 'bootstrap'; // Import Collapse/Dropdown from bootstrap
import Avatar from './Avatar';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // The crossword solver hides the bottom bar so the grid/keyboard get the full
    // viewport height - a plain back-to-list action lives on that page instead.
    const isSolving = location.pathname.startsWith('/crossword/');

    const accountToggleRef = useRef(null); // Ref for the account dropdown toggle link
    const bsDropdownRef = useRef(null); // Ref to store the bootstrap Dropdown instance

    useEffect(() => {
        if (accountToggleRef.current) {
            // Bootstrap disables Popper positioning for dropdowns inside a navbar
            // (regardless of the `display` option), so the menu is placed via plain
            // CSS below; width/wrap styles on the menu keep it from clipping.
            bsDropdownRef.current = new Dropdown(accountToggleRef.current);
        }
        return () => {
            if (bsDropdownRef.current) {
                bsDropdownRef.current.dispose();
                bsDropdownRef.current = null;
            }
        };
    }, [user]);

    const toggleAccountMenu = () => {
        if (bsDropdownRef.current) {
            bsDropdownRef.current.toggle();
        }
    };

    const collapseRef = useRef(null); // Ref for the collapsible div
    const bsCollapseRef = useRef(null); // Ref to store the bootstrap Collapse instance

    const toggleNavbar = () => {
        if (bsCollapseRef.current) {
            bsCollapseRef.current.toggle();
        }
    };
    useEffect(() => {
        if (collapseRef.current) {
            // Create a new Collapse instance but prevent it from toggling on initialization
            bsCollapseRef.current = new Collapse(collapseRef.current, { toggle: false });
        }

        // Cleanup function to dispose the instance when the component unmounts
        return () => {
            if (bsCollapseRef.current) {
                bsCollapseRef.current.dispose();
            }
        };
    }, []);

    const hideNavbar = () => {
        if (bsCollapseRef.current) {
            bsCollapseRef.current.hide();
        }
        if (bsDropdownRef.current) {
            bsDropdownRef.current.hide();
        }
    };

    // This is the original logout handler, now with the hideNavbar call
    const handleLogout = () => {
        hideNavbar(); // Close the menu
        logout();
        navigate('/');
    };

    // Bonus: Handle clicks outside the navbar to close it
    const navbarRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the navbar ref exists and the click was outside of it
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                hideNavbar();
            }
        };
        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);
        // Cleanup the event listener on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <>
        <nav ref={navbarRef} className="navbar navbar-expand-lg sticky-top app-navbar">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/" onClick={hideNavbar}>
                    <span className="app-brand-mark"><i className="bi bi-grid-3x3-gap-fill"></i></span>
                    משבצת
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleNavbar}
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div ref={collapseRef} className="collapse navbar-collapse" id="navbarNav">
                    {/* Main navigation links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                                to="/about"
                                onClick={hideNavbar}
                            >
                                אודות
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/wordlists' ? 'active' : ''}`}
                                to="/wordlists"
                                onClick={hideNavbar}
                            >
                                רשימות מילים
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                                to="/"
                                onClick={hideNavbar}
                            >
                                תשבצים
                            </Link>
                        </li>
                    </ul>

                    {/* User-related links */}
                    <ul className="navbar-nav">
                        {user ? (
                            <li className="nav-item dropdown">
                                <a
                                    ref={accountToggleRef}
                                    className="nav-link dropdown-toggle d-flex align-items-center"
                                    href="#"
                                    id="accountDropdown"
                                    role="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleAccountMenu();
                                    }}
                                    aria-expanded="false"
                                >
                                    <span className="ms-2">
                                        <Avatar photoURL={user.photoURL} name={user.userName} size={28} />
                                    </span>
                                    {user.userName}
                                </a>
                                {/* dropdown-menu-start (not -end): this build is the standard LTR
                                    bootstrap.min.css under dir="rtl" (see CLAUDE.md), so -end is
                                    physical right:0 - but RTL flex mirroring plus the physical
                                    me-auto above already pushes this toggle to the visual left
                                    edge, so right:0 pushed the menu off the left side of the
                                    viewport. start (left:0) grows it back into the page. */}
                                <ul className="dropdown-menu dropdown-menu-start account-dropdown-menu" aria-labelledby="accountDropdown">
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/profile" onClick={hideNavbar}>
                                            הפרופיל שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/favorite-crosswords" onClick={hideNavbar}>
                                            תשבצים אהובים
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/favorite-wordlists" onClick={hideNavbar}>
                                            רשימות מילים אהובות
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/my-crosswords" onClick={hideNavbar}>
                                            התשבצים שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/my-wordlists" onClick={hideNavbar}>
                                            רשימות המילים שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/create-crossword" onClick={hideNavbar}>
                                            יצירת תשבץ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item account-dropdown-item" to="/create-wordlist" onClick={hideNavbar}>
                                            יצירת רשימת מילים
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item account-dropdown-item"
                                            onClick={handleLogout} // The handler already calls hideNavbar
                                        >
                                            התנתקות
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login" onClick={hideNavbar}>
                                        התחברות
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>

        {!isSolving && (
            <>
                <div className="bottom-nav">
                    <Link className={`bn-item ${location.pathname === '/' ? 'active' : ''}`} to="/">
                        <i className="bi bi-puzzle"></i>תשבצים
                    </Link>
                    <Link className={`bn-item ${location.pathname === '/wordlists' ? 'active' : ''}`} to="/wordlists">
                        <i className="bi bi-collection"></i>רשימות
                    </Link>
                    <Link className="bn-fab" to="/create-crossword" aria-label="יצירת תשבץ חדש">
                        <i className="bi bi-plus-lg"></i>
                    </Link>
                    <Link className={`bn-item ${location.pathname === '/about' ? 'active' : ''}`} to="/about">
                        <i className="bi bi-info-circle"></i>אודות
                    </Link>
                    <Link className={`bn-item ${location.pathname === '/profile' ? 'active' : ''}`} to={user ? '/profile' : '/login'}>
                        <i className="bi bi-person-circle"></i>חשבון
                    </Link>
                </div>
                <div className="bottom-nav-spacer"></div>
            </>
        )}
        </>
    );
};

export default Navbar;