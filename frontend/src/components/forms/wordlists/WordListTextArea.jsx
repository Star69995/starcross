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
            <div className="btn-group btn-group-sm">
                <input
                    type="file"
                    className="d-none"
                    id="import-file"
                    accept=".txt"
                    onChange={handleImport}
                />
                <label htmlFor="import-file" className="btn btn-outline-secondary">
                    <i className="bi bi-upload me-1"></i>יבוא
                </label>
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleExport}
                    disabled={!wordsText.trim()}
                >
                    <i className="bi bi-download me-1"></i>יצוא
                </button>
            </div>
        </div>
        <textarea
            className="form-control font-monospace"
            id="words"
            rows="12"
            placeholder={`מילה|הגדרה
דוגמה|משהו שמסביר או מדגים
תשבץ|משחק מילים צולבות

כל מילה בשורה נפרדת
פורמט: מילה|הגדרה`}
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