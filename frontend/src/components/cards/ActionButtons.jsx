import PropTypes from 'prop-types'
function ActionButtons({
    isLiked,
    canEdit,
    canDelete,
    onEdit,
    handleLike,
    likeLoadingInternal,
    handleDelete
}) {
    return (<div className="d-flex justify-content-between align-items-center">

        <div className="d-flex gap-2">
            <button
                className={`btn btn-sm ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleLike}
                disabled={likeLoadingInternal}
                title={isLiked ? 'Unlike' : 'Like'}
            >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
            {canEdit && (
                <button className="btn btn-sm btn-outline-primary" onClick={onEdit} title="Edit">
                    <i className="bi bi-pencil"></i>
                </button>
            )}
            {canDelete && (
                <button className="btn btn-sm btn-outline-danger" onClick={handleDelete} title="Delete">
                    <i className="bi bi-trash"></i>
                </button>
            )}
        </div>
    </div>);
}

ActionButtons.propTypes = {
    isLiked: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
    handleLike: PropTypes.func.isRequired,
    likeLoadingInternal: PropTypes.bool.isRequired,
    handleDelete: PropTypes.func.isRequired,
};

export default ActionButtons;