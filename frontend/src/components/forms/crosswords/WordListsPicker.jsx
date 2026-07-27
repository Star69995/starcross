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
        <label className="field-label font-bold">
            בחר רשימות מילים
            {required && <span className="text-like"> *</span>}
        </label>
        {wordLists.length === 0 ? (
            <div className="banner banner-info">
                <p className="mb-2">אין לך רשימות מילים עדיין.</p>
                <button
                    type="button"
                    className="button button-sm button-primary"
                    onClick={onCreateNew}
                >
                    צור רשימת מילים חדשה
                </button>
            </div>
        ) : (
            <div className="item-list" style={{ maxHeight: 220, overflowY: "auto" }}>
                {wordLists.map((wordList) => {
                    const isChecked = value.map(String).includes(String(wordList._id));
                    return (
                        <label
                            key={wordList._id}
                            htmlFor={`wordlist-${wordList._id}`}
                            className="item-list-item item-list-item-action flex items-start gap-2"
                        >
                            <input
                                className="field-check-input mt-1 shrink-0"
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
                            <span className="grow" style={{ minWidth: 0 }}>
                                <span className="flex justify-between items-center gap-2">
                                    <span className="font-bold text-truncate" style={{ minWidth: 0 }}>
                                        {wordList.title}
                                    </span>
                                    <small className="text-muted shrink-0">
                                        {wordList.words.length} מילים
                                    </small>
                                </span>
                                {wordList.description && (
                                    <small className="text-muted block">{wordList.description}</small>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>
        )}
        {error && <div className="text-like mt-2">{error}</div>}
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