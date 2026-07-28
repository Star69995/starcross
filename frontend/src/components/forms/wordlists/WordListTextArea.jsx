import PropTypes from 'prop-types';
const WordListTextArea = ({
    wordsText,
    setWordsText,
    parseWordsFromText,
    handleImport,
    handleExport,
}) => (
    <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
            <label htmlFor="words" className="form-label mb-0">מילים</label>
            <div className="d-flex gap-2">
                <input
                    type="file"
                    className="d-none"
                    id="import-file"
                    accept=".txt"
                    onChange={handleImport}
                />
                <label htmlFor="import-file" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
                    <i className="bi bi-upload"></i>יבוא
                </label>
                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                    onClick={handleExport}
                    disabled={!wordsText.trim()}
                >
                    <i className="bi bi-download"></i>יצוא
                </button>
            </div>
        </div>
        <div className="form-text mt-0 mb-2">
            כל מילה בשורה נפרדת, בפורמט <code>מילה|הגדרה</code>
        </div>
        <textarea
            className="form-control font-monospace"
            id="words"
            rows="12"
            placeholder={`מילה|הגדרה
דוגמה|משהו שמסביר או מדגים
תשבץ|משחק מילים צולבות`}
            value={wordsText}
            onChange={(e) => setWordsText(e.target.value)}
            style={{ minHeight: "200px" }}
        />
        <div className="form-text">
            נמצאו {parseWordsFromText(wordsText).length} מילים
        </div>
    </div>
);

WordListTextArea.propTypes = {
    wordsText: PropTypes.string.isRequired,
    setWordsText: PropTypes.func.isRequired,
    parseWordsFromText: PropTypes.func.isRequired,
    handleImport: PropTypes.func.isRequired,
    handleExport: PropTypes.func.isRequired,
};

export default WordListTextArea