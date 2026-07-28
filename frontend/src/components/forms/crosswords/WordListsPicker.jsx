import PropTypes from "prop-types";

// רכיב בחירת רשימות מילים
const WordListsPicker = ({
    wordLists,
    value,
    onChange,
    error,
    required,
    onCreateNew,
}) => (
    <div className="mb-3">
        <label className="form-label fw-bold">
            בחר רשימות מילים
            {required && <span className="text-danger"> *</span>}
        </label>
        {wordLists.length === 0 ? (
            <div className="alert alert-info text-center">
                <i className="bi bi-collection fs-3 d-block mb-2"></i>
                <p className="mb-2">אין לך רשימות מילים עדיין</p>
                <button
                    type="button"
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                    onClick={onCreateNew}
                >
                    <i className="bi bi-plus-circle" />
                    צור רשימת מילים חדשה
                </button>
            </div>
        ) : (
            <div className="list-group" style={{ maxHeight: 220, overflowY: "auto" }}>
                {wordLists.map((wordList) => {
                    const isChecked = value.map(String).includes(String(wordList._id));
                    return (
                        <label
                            key={wordList._id}
                            htmlFor={`wordlist-${wordList._id}`}
                            className="list-group-item list-group-item-action d-flex align-items-start gap-2"
                        >
                            <input
                                className="form-check-input mt-1 flex-shrink-0"
                                type="checkbox"
                                id={`wordlist-${wordList._id}`}
                                checked={isChecked}
                                onChange={() => {
                                    if (isChecked) {
                                        onChange(value.filter((id) => String(id) !== String(wordList._id)));
                                    } else {
                                        onChange([...value, wordList._id]);
                                    }
                                }}
                            />
                            <span className="content-card-icon flex-shrink-0">
                                <i className="bi bi-collection-fill" />
                            </span>
                            <span className="flex-grow-1" style={{ minWidth: 0 }}>
                                <span className="d-flex justify-content-between align-items-center gap-2">
                                    <span className="fw-bold text-truncate" style={{ minWidth: 0 }}>
                                        {wordList.title}
                                    </span>
                                    <small className="content-card-stat flex-shrink-0">
                                        <i className="bi bi-list-ul" />
                                        {wordList.words.length} מילים
                                    </small>
                                </span>
                                {wordList.description && (
                                    <small className="text-muted d-block">{wordList.description}</small>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>
        )}
        {error && <div className="text-danger mt-2">{error}</div>}
    </div>
);

// prop types עבור WordListsPicker
WordListsPicker.propTypes = {
    wordLists: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            words: PropTypes.array.isRequired,
            description: PropTypes.string,
        })
    ).isRequired,
    value: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    required: PropTypes.bool,
    onCreateNew: PropTypes.func.isRequired,
};

export default WordListsPicker;