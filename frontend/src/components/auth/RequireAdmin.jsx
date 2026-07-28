import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthContext'
import { isAdmin } from '../../utils/permissions'

const RequireAdmin = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">טוען...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isAdmin(user)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default RequireAdmin

RequireAdmin.propTypes = {
    children: PropTypes.node.isRequired,
};
