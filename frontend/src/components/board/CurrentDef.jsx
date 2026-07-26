import { useCrossword } from '../../providers/CrosswordContext';

// Combines across+down into one number-ordered list so prev/next can step
// through every clue in reading order, regardless of direction.
const buildOrderedDefs = (definitionsUsed) => [
    ...(definitionsUsed.across || []).map((d) => ({ ...d, isVertical: false })),
    ...(definitionsUsed.down || []).map((d) => ({ ...d, isVertical: true })),
].sort((a, b) => a.number - b.number || (a.isVertical === b.isVertical ? 0 : a.isVertical ? 1 : -1));

function CurrentDef() {
    const { selectedDefinition, definitionsUsed, setActiveDefinition } = useCrossword();

    const orderedDefs = buildOrderedDefs(definitionsUsed);
    const currentIndex = orderedDefs.findIndex(
        (d) => d.text === selectedDefinition?.definition && d.isVertical === selectedDefinition?.isVertical
    );

    const goToAdjacent = (step) => {
        if (orderedDefs.length === 0) return;
        const nextIndex = (currentIndex + step + orderedDefs.length) % orderedDefs.length;
        setActiveDefinition(null, orderedDefs[nextIndex].text);
    };

    const def = selectedDefinition?.definition || 'כאן תופיעה ההגדרה המסומנת';

    return (
        <div className="clue-banner d-flex align-items-center gap-2">
            {/* previous flows toward reading-start (right, per CLAUDE.md RTL arrow rule) */}
            <button
                type="button"
                className="clue-nav-btn"
                onClick={() => goToAdjacent(-1)}
                disabled={orderedDefs.length === 0}
                aria-label="הגדרה קודמת"
            >
                <i className="bi bi-chevron-right"></i>
            </button>
            <span className="flex-grow-1 text-center">{def}</span>
            {/* next flows toward reading-end (left) */}
            <button
                type="button"
                className="clue-nav-btn"
                onClick={() => goToAdjacent(1)}
                disabled={orderedDefs.length === 0}
                aria-label="הגדרה הבאה"
            >
                <i className="bi bi-chevron-left"></i>
            </button>
        </div>
    );
}

export default CurrentDef;
