import { useRef, useEffect, useState } from 'react'; // Import useRef and useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthContext';
import { Collapse } from 'bootstrap'; // Import Collapse from bootstrap

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const toggleAccountMenu = () => setIsAccountMenuOpen((open) => !open);

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
        setIsAccountMenuOpen(false);
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
        <nav ref={navbarRef} className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/" onClick={hideNavbar}>
                    סטאר תשבצים
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
                            <Link className="nav-link" to="/about" onClick={hideNavbar}>
                                אודות
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/wordlists" onClick={hideNavbar}>
                                רשימות מילים
                            </Link>
                        </li>
                        {user && user.isContentCreator && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/my-crosswords" onClick={hideNavbar}>
                                        התשבצים שלי
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/my-wordlists" onClick={hideNavbar}>
                                        רשימות המילים שלי
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/create-crossword" onClick={hideNavbar}>
                                        יצירת תשבץ
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/create-wordlist" onClick={hideNavbar}>
                                        יצירת רשימת מילים
                                    </Link>
                                </li>

                            </>
                        )}
                    </ul>

                    {/* User-related links */}
                    <ul className="navbar-nav">
                        {user ? (
                            <li className={`nav-item dropdown${isAccountMenuOpen ? ' show' : ''}`}>
                                <a
                                    className="nav-link dropdown-toggle d-flex align-items-center"
                                    href="#"
                                    id="accountDropdown"
                                    role="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleAccountMenu();
                                    }}
                                    aria-expanded={isAccountMenuOpen}
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.userName}
                                            referrerPolicy="no-referrer"
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                            className="ms-2"
                                        />
                                    ) : (
                                        <i className="bi bi-person-circle fs-5 ms-2"></i>
                                    )}
                                    {user.userName}
                                </a>
                                <ul
                                    className={`dropdown-menu dropdown-menu-end${isAccountMenuOpen ? ' show' : ''}`}
                                    aria-labelledby="accountDropdown"
                                >
                                    <li>
                                        <Link className="dropdown-item" to="/profile" onClick={hideNavbar}>
                                            הפרופיל שלי
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/favorite-crosswords" onClick={hideNavbar}>
                                            תשבצים אהובים
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/favorite-wordlists" onClick={hideNavbar}>
                                            רשימות מילים אהובות
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
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
    );
};

export default Navbar;