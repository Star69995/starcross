import { useCrossword } from '../../providers/CrosswordContext';

// Standard Israeli physical-keyboard letter layout (including final forms
// ך/ם/ן/ף/ץ in their natural positions) so it matches users' existing muscle
// memory, docked at the bottom of the viewport in place of the OS keyboard -
// see Block.jsx's inputMode="none", which suppresses the native one.
const ROWS = [
    ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
    ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך'],
    ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
];

// Keeps the currently focused cell's <input> from blurring when a keyboard
// key is tapped - without this, tapping a button moves focus to the button
// first, clearing CrosswordContext's activeCell before the click handler
// could use it.
const preventBlur = (e) => e.preventDefault();

const HebrewKeyboard = () => {
    const { activeCell, selectedDefinition, typeLetter, deleteLetterAt } = useCrossword();

    const handleKey = (letter) => {
        if (!activeCell) return;
        typeLetter(activeCell.row, activeCell.col, letter, Boolean(selectedDefinition?.isVertical));
    };

    const handleBackspace = () => {
        if (!activeCell) return;
        deleteLetterAt(activeCell.row, activeCell.col, Boolean(selectedDefinition?.isVertical));
    };

    return (
        <div className="hebrew-keyboard">
            {ROWS.map((row, i) => (
                <div key={i} className="hebrew-keyboard-row">
                    {/* The row above renders under the page's inherited dir="rtl",
                        which flips flexbox's visual child order right-to-left. ROWS
                        is written left-to-right to match the physical keyboard, so
                        the DOM order fed to it here is reversed to compensate -
                        putting the backspace button first so it lands on the far
                        right instead of the far left. */}
                    {i === ROWS.length - 1 && (
                        <button
                            type="button"
                            className="hebrew-keyboard-key hebrew-keyboard-backspace"
                            onMouseDown={preventBlur}
                            onClick={handleBackspace}
                            aria-label="מחיקה"
                        >
                            <i className="bi bi-backspace"></i>
                        </button>
                    )}
                    {[...row].reverse().map((letter) => (
                        <button
                            key={letter}
                            type="button"
                            className="hebrew-keyboard-key"
                            onMouseDown={preventBlur}
                            onClick={() => handleKey(letter)}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default HebrewKeyboard;
