import { Link, useLocation } from 'react-router-dom'

const ADMIN_LINKS = [
    { to: '/admin/users', label: 'משתמשים' },
    { to: '/admin/crosswords', label: 'תשבצים' },
    { to: '/admin/wordlists', label: 'רשימות מילים' },
]

// Pill nav shared by the 3 admin pages so the section reads as one panel.
const AdminNav = () => {
    const location = useLocation()

    return (
        <div className="filter-pills mb-4">
            {ADMIN_LINKS.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`filter-pill text-decoration-none ${location.pathname === link.to ? 'active' : ''}`}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    )
}

export default AdminNav
