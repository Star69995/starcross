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

        <div className="btn-group btn-group-sm">
            <button
                className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} m-1`}
                onClick={handleLike}
                disabled={likeLoadingInternal}
                title={isLiked ? 'Unlike' : 'Like'}
            >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
            {canEdit && (
                <button className="btn btn-outline-primary m-1" onClick={onEdit} title="Edit">
                    <i className="bi bi-pencil"></i>
                </button>
            )}
            {canDelete && (
                <button className="btn btn-outline-danger m-1" onClick={handleDelete} title="Delete">
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