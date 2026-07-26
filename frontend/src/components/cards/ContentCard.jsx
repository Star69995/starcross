import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ActionButtons from './ActionButtons'

// statObj is array like [{icon: 'bi-heart', label: 13}, {icon: 'bi-list-ul', label: '50 words'}]
const ContentCard = ({
    id,
    title,
    description,
    creator = "משתמש לא ידוע",
    createdAt,
    stats = [],
    icon = "bi-grid",
    badge,
    completed,
    liked,
    onLike,
    likesCount,
    likeLoading = false,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
    viewUrl,
    viewText = "הצגה",
    children // For any custom/injected content
}) => {
    const [isLiked, setIsLiked] = useState(liked)
    const [likesCount1, setLikesCount1] = useState(likesCount)
    const [likeLoadingInternal, setLikeLoadingInternal] = useState(likeLoading);

    const handleLike = async () => {
        setLikeLoadingInternal(true);
        try {
            const success = await onLike(id);
            if (success) {  
                if (isLiked) {
                    setIsLiked(false);
                    setLikesCount1(prev => prev - 1);
                } else {
                    setIsLiked(true);
                    setLikesCount1(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
        setLikeLoadingInternal(false);
    };

    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את התשבץ?')) {
            try {
                await onDelete(id);
            } catch (error) {
                console.error('Error deleting content:', error);
            }
        }
        
    }
    return (
        <div className="card content-card h-100 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="content-card-icon">
                            <i className={`bi ${icon}`}></i>
                        </span>
                        <h5 className="card-title text-primary mb-0">{title}</h5>
                    </div>
                    <div className="d-flex flex-wrap justify-content-end gap-1">
                        {completed && (
                            <span className="badge bg-success">
                                <i className="bi bi-check-circle-fill ms-1"></i>
                                הושלם
                            </span>
                        )}
                        {badge
                            ? <span className="badge bg-success">ציבורית</span>
                            : <span className="badge bg-secondary">פרטית</span>
                        }
                    </div>
                </div>
                {description && (
                    <p className="card-text text-muted small">{description}</p>
                )}
                <div className="mb-3">
                    <small className="text-muted">
                        <i className="bi bi-person ms-1"></i>
                        {creator}
                    </small>
                    <small className="text-muted ms-3">
                        <i className="bi bi-calendar ms-1"></i>
                        {createdAt}
                    </small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-3">
                        {stats.map((stat, i) =>
                            <small key={i} className="text-muted">
                                <i className={`bi ${stat.icon} me-1 m-1`}></i>
                                {stat.label}
                            </small>
                        )}
                        <small className="text-muted">
                            <i className="bi bi-heart ms-1"></i>
                            {likesCount1}
                        </small>
                    </div>
                    {children}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    {viewUrl && (
                        <Link to={viewUrl} className="btn btn-primary btn-sm">
                            <i className="bi bi-play-circle ms-1"></i>{viewText}
                        </Link>
                    )}

                    <ActionButtons
                        isLiked={isLiked}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={onEdit}
                        handleLike={handleLike}
                        likeLoadingInternal={likeLoadingInternal}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    )
}

ContentCard.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    creator: PropTypes.string,
    createdAt: PropTypes.string,
    stats: PropTypes.array,
    icon: PropTypes.string,
    badge: PropTypes.bool,
    completed: PropTypes.bool,
    liked: PropTypes.bool,
    onLike: PropTypes.func,
    likesCount: PropTypes.number,
    likeLoading: PropTypes.bool,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    viewUrl: PropTypes.string,
    viewText: PropTypes.string,
    children: PropTypes.node,
}

export default ContentCard