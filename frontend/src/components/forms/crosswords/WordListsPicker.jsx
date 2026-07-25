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
            <div className="alert alert-info">
                <p className="mb-2">אין לך רשימות מילים עדיין.</p>
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={onCreateNew}
                >
                    צור רשימת מילים חדשה
                </button>
            </div>
        ) : (
            <div className="border rounded p-3" style={{ maxHeight: 200, overflowY: "auto" }}>
                {wordLists.map((wordList) => (
                    <div key={wordList._id} className="form-check mb-2 d-flex flex-row align-items-center">
                        <input
                            className="form-check-input ms-2"
                            type="checkbox"
                            id={`wordlist-${wordList._id}`}
                            checked={value.map(String).includes(String(wordList._id))}
                            onChange={() => {
                                if (value.map(String).includes(String(wordList._id))) {
                                    onChange(value.filter((id) => String(id) !== String(wordList._id)));
                                } else {
                                    onChange([...value, wordList._id]);
                                }
                            }}
                        />
                        <label className="form-check-label" htmlFor={`wordlist-${wordList._id}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold m-1">{wordList.title}</span>
                                <small className="text-muted">{wordList.words.length} מילים</small>
                            </div>
                            {wordList.description && (
                                <small className="text-muted d-block">{wordList.description}</small>
                            )}
                        </label>
                    </div>
                ))}
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