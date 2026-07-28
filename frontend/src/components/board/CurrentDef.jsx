import { useCrossword } from '../../providers/CrosswordContext';

function CurrentDef() {
    const { selectedDefinition, orderedDefinitions, goToAdjacentDefinition } = useCrossword();

    const def = selectedDefinition?.definition || 'כאן תופיעה ההגדרה המסומנת';

    return (
        <div className="clue-banner d-flex align-items-center gap-2">
            {/* previous flows toward reading-start (right, per CLAUDE.md RTL arrow rule) */}
            <button
                type="button"
                className="clue-nav-btn"
                onClick={() => goToAdjacentDefinition(-1)}
                disabled={orderedDefinitions.length === 0}
                aria-label="הגדרה קודמת"
            >
                <i className="bi bi-chevron-right"></i>
            </button>
            <span className="flex-grow-1 text-center">{def}</span>
            {/* next flows toward reading-end (left) */}
            <button
                type="button"
                className="clue-nav-btn"
                onClick={() => goToAdjacentDefinition(1)}
                disabled={orderedDefinitions.length === 0}
                aria-label="הגדרה הבאה"
            >
                <i className="bi bi-chevron-left"></i>
            </button>
        </div>
    );
}

export default CurrentDef;
