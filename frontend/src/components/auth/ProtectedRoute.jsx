import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthContext'

const ProtectedRoute = ({ children, requiresContentCreator = false }) => {
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

    if (requiresContentCreator && !user.isContentCreator) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="alert alert-warning" role="alert">
                        <h4 className="alert-heading">גישה מוגבלת</h4>
                        <p>עמוד זה זמין רק ליוצרי תוכן. אנא פנה למנהל המערכת להעלאת הרשאות.</p>
                    </div>
                </div>
            </div>
        )
    }

    return children
}

export default ProtectedRoute

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiresContentCreator: PropTypes.bool,
};