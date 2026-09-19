import { useEffect } from 'react';
import PropTypes from 'prop-types';

// Celebration shown once when a puzzle transitions to fully solved (see
// CrosswordSolver's isCompleted effect). A custom fixed overlay rather than
// Bootstrap's Modal class, so the checkmark-draw/confetti animation and
// "what next" actions can be laid out freely.
const CompletionModal = ({ show, onClose, onGoHome, onCreateNew }) => {
    useEffect(() => {
        if (!show) return;
        const handleKeydown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="completion-modal-backdrop" onClick={onClose}>
            <div
                className="completion-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="completionModalTitle"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="btn-close completion-modal-close"
                    aria-label="סגור"
                    onClick={onClose}
                ></button>

                <div className="completion-modal-confetti" aria-hidden="true">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <span
                            key={i}
                            className={`completion-confetti-piece completion-confetti-piece-${i % 6}`}
                            style={{ left: `${(i * 7 + 3) % 100}%`, animationDelay: `${(i % 5) * 0.15}s` }}
                        ></span>
                    ))}
                </div>

                <div className="completion-modal-check" aria-hidden="true">
                    <svg viewBox="0 0 52 52" className="completion-check-svg">
                        <circle className="completion-check-circle" cx="26" cy="26" r="24" fill="none" />
                        <path className="completion-check-mark" fill="none" d="M14 27l7 7 16-16" />
                    </svg>
                </div>

                <h3 id="completionModalTitle" className="completion-modal-title">כל הכבוד!</h3>
                <p className="completion-modal-text">פתרת את התשבץ בהצלחה</p>

                <div className="completion-modal-actions">
                    <button type="button" className="btn btn-primary" onClick={onGoHome}>
                        <i className="bi bi-grid ms-2"></i>
                        לתשבצים נוספים
                    </button>
                    <button type="button" className="btn btn-outline-primary" onClick={onCreateNew}>
                        <i className="bi bi-plus-circle ms-2"></i>
                        יצירת תשבץ חדש
                    </button>
                </div>
            </div>
        </div>
    );
};

CompletionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onGoHome: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
};

export default CompletionModal;
