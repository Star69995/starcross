
import PropTypes from 'prop-types';
const WordsPreview = ({ words }) =>
    words.length > 0 && (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="mb-0">תצוגה מקדימה</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-sm">
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
                        <div className="text-center text-muted">
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