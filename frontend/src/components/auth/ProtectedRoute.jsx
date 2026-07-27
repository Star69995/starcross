import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthContext'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="loader text-accent" role="status">
                        <span className="visually-hidden">טוען...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};