
import PropTypes from 'prop-types';
const WordsPreview = ({ words }) =>
    words.length > 0 && (
        <div className="card mt-4">
            <div className="card-header d-flex align-items-center justify-content-between gap-2">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-eye text-primary" />
                    תצוגה מקדימה
                </h5>
                <span className="content-card-stat">
                    <i className="bi bi-list-ul" />
                    {words.length} מילים
                </span>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th>מילה</th>
                                <th>הגדרה</th>
                            </tr>
                        </thead>
                        <tbody>
                            {words.slice(0, 10).map((word, index) => (
                                <tr key={index}>
                                    <td className="fw-bold">{word.solution}</td>
                                    <td>{word.definition || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {words.length > 10 && (
                        <div className="text-center text-muted small pt-2">
                            ועוד {words.length - 10} מילים...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

WordsPreview.propTypes = {
    words: PropTypes.arrayOf(PropTypes.object).isRequired,
};
export default WordsPreview