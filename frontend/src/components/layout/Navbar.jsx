import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // The crossword solver hides the bottom bar so the grid/keyboard get the full
    // viewport height - a plain back-to-list action lives on that page instead.
    const isSolving = location.pathname.startsWith('/crossword/');

    const [navOpen, setNavOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const toggleNavbar = () => setNavOpen((open) => !open);
    const toggleAccountMenu = () => setAccountOpen((open) => !open);

    const hideNavbar = () => {
        setNavOpen(false);
        setAccountOpen(false);
    };

    const handleLogout = () => {
        hideNavbar(); // Close the menu
        logout();
        navigate('/');
    };

    // Handle clicks outside the navbar to close it
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
        <nav ref={navbarRef} className="top-nav top-nav--expand-lg sticky-top app-navbar">
            <div className="container-fluid">
                <Link className="top-nav-brand font-bold" to="/" onClick={hideNavbar}>
                    <span className="app-brand-mark"><i className="bi bi-grid-3x3-gap-fill"></i></span>
                    משבצת
                </Link>

                <button
                    className="top-nav-toggle"
                    type="button"
                    onClick={toggleNavbar}
                    aria-controls="navbarNav"
                    aria-expanded={navOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="top-nav-toggle-icon"></span>
                </button>

                <div className={`top-nav-collapse ${navOpen ? 'show' : ''}`} id="navbarNav">
                    {/* Main navigation links */}
                    <ul className="top-nav-list mr-auto mb-2 mb-lg-0">
                        <li className="nav-list-item">
                            <Link
                                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                                to="/about"
                                onClick={hideNavbar}
                            >
                                אודות
                            </Link>
                        </li>
                        <li className="nav-list-item">
                            <Link
                                className={`nav-link ${location.pathname === '/wordlists' ? 'active' : ''}`}
                                to="/wordlists"
                                onClick={hideNavbar}
                            >
                                רשימות מילים
                            </Link>
                        </li>
                        <li className="nav-list-item">
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
                    <ul className="top-nav-list">
                        {user ? (
                            <li className="nav-list-item has-menu">
                                <a
                                    className="nav-link menu-toggle flex items-center"
                                    href="#"
                                    id="accountDropdown"
                                    role="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleAccountMenu();
                                    }}
                                    aria-expanded={accountOpen}
                                >
                                    <span className="ml-2">
                                        <Avatar photoURL={user.photoURL} name={user.userName} size={28} />
                                    </span>
                                    {user.userName}
                                </a>
                                {/* menu--start (not the default right-anchored menu): this design
                                    keeps ml-/mr- physical (see CLAUDE.md), and RTL flex mirroring
                                    plus the physical mr-auto above already pushes this toggle to
                                    the visual left edge, so right:0 pushed the menu off the left
                                    side of the viewport. menu--start (left:0) grows it back into
                                    the page. */}
                                <ul className={`menu menu--start account-dropdown-menu ${accountOpen ? 'show' : ''}`} aria-labelledby="accountDropdown">
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/profile" onClick={hideNavbar}>
                                            הפרופיל שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/favorite-crosswords" onClick={hideNavbar}>
                                            תשבצים אהובים
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/favorite-wordlists" onClick={hideNavbar}>
                                            רשימות מילים אהובות
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="menu-divider" />
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/my-crosswords" onClick={hideNavbar}>
                                            התשבצים שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/my-wordlists" onClick={hideNavbar}>
                                            רשימות המילים שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/create-crossword" onClick={hideNavbar}>
                                            יצירת תשבץ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="menu-item account-dropdown-item" to="/create-wordlist" onClick={hideNavbar}>
                                            יצירת רשימת מילים
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="menu-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="menu-item account-dropdown-item"
                                            onClick={handleLogout} // The handler already calls hideNavbar
                                        >
                                            התנתקות
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-list-item">
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
