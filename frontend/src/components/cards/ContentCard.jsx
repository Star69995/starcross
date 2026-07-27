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
    showVisibilityBadge = true,
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
        <div className="panel content-card h-100 shadow-sm">
            <div className="panel-body">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="content-card-icon">
                            <i className={`bi ${icon}`}></i>
                        </span>
                        <h5 className="panel-title mb-0">{title}</h5>
                    </div>
                    <div className="flex wrap justify-end gap-1">
                        {completed && (
                            <span className="tag tag-success">
                                <i className="bi bi-check-circle-fill ml-1"></i>
                                הושלם
                            </span>
                        )}
                        {showVisibilityBadge && (
                            badge
                                ? <span className="tag tag-success">ציבורית</span>
                                : <span className="tag tag-muted">פרטית</span>
                        )}
                    </div>
                </div>
                {description && (
                    <p className="panel-text text-muted small">{description}</p>
                )}
                <div className="mb-3 flex items-center gap-3">
                    <small className="text-muted flex items-center gap-1" style={{ minWidth: 0 }}>
                        <i className="bi bi-person shrink-0"></i>
                        <span className="text-truncate" dir="ltr" style={{ textAlign: 'right' }}>{creator}</span>
                    </small>
                    <small className="text-muted flex items-center gap-1 shrink-0">
                        <i className="bi bi-calendar"></i>
                        {createdAt}
                    </small>
                </div>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex wrap gap-2">
                        {stats.map((stat, i) =>
                            <small key={i} className="content-card-stat">
                                <i className={`bi ${stat.icon}`}></i>
                                {stat.label}
                            </small>
                        )}
                        <small className="content-card-stat">
                            <i className="bi bi-heart"></i>
                            {likesCount1}
                        </small>
                    </div>
                    {children}
                </div>
                <div className="flex justify-between items-center content-card-footer">
                    {viewUrl && (
                        <Link to={viewUrl} className="button button-primary button-sm">
                            <i className="bi bi-play-circle ml-1"></i>{viewText}
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
    showVisibilityBadge: PropTypes.bool,
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