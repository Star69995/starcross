import { useEffect, useRef, useState } from 'react';
import { useCrossword } from '../../providers/CrosswordContext';

// Standard Israeli physical-keyboard letter layout (including final forms
// ך/ם/ן/ף/ץ in their natural positions) so it matches users' existing muscle
// memory, docked at the bottom of the viewport in place of the OS keyboard -
// see Block.jsx's inputMode, which suppresses the native one while this is on.
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
    const {
        activeCell, selectedDefinition, typeLetter, deleteLetterAt,
        isKeyboardOpen, closeKeyboard, showKeyboardClue,
        orderedDefinitions, goToAdjacentDefinition,
    } = useCrossword();
    const keyboardRef = useRef(null);
    const spacerRef = useRef(null);
    // The spacer only needs to reserve as much room as isn't already free
    // below the page's real content - a short crossword (few clues) already
    // leaves blank space above the keyboard on its own, and reserving the
    // keyboard's full height on top of that would double the gap. The page's
    // Footer (outside this component, rendered on every route) sits right
    // after this reserved spacer and already provides scrollable room of its
    // own, which counts the same way - so both are netted out against how
    // much the keyboard actually needs. Recomputed live since the keyboard's
    // own height varies too (a long clue can wrap to several lines, and the
    // "show clue" preference can remove that row entirely).
    const [spacerHeight, setSpacerHeight] = useState(0);

    useEffect(() => {
        if (!isKeyboardOpen || !keyboardRef.current) {
            setSpacerHeight(0);
            return undefined;
        }
        const el = keyboardRef.current;
        const updateHeight = () => {
            const kbHeight = el.getBoundingClientRect().height;
            const spacerContribution = spacerRef.current?.getBoundingClientRect().height || 0;
            const footerHeight = document.querySelector('footer')?.getBoundingClientRect().height || 0;
            const clientHeight = document.documentElement.clientHeight;
            const realContentEnd = document.documentElement.scrollHeight - spacerContribution - footerHeight;

            // Scrolling always lets real content's own bottom edge reach the
            // physical bottom of the viewport on its own - reserved space is
            // only needed for the extra kbHeight-worth of scroll past that,
            // to bring it up above the keyboard instead. Not needed at all
            // if the content was already short enough to fit above the
            // keyboard with no scrolling in the first place.
            const contentOverflowsAboveKeyboard = realContentEnd > clientHeight - kbHeight;
            const neededSpacer = contentOverflowsAboveKeyboard ? Math.max(0, kbHeight - footerHeight) : 0;
            setSpacerHeight(neededSpacer);
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);
        observer.observe(document.body);
        window.addEventListener('resize', updateHeight);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateHeight);
        };
    }, [isKeyboardOpen]);

    // Docked only while a cell is focused (see CrosswordContext's
    // isKeyboardOpen) - nothing to type into otherwise.
    if (!isKeyboardOpen) return null;

    const handleKey = (letter) => {
        if (!activeCell) return;
        typeLetter(activeCell.row, activeCell.col, letter, Boolean(selectedDefinition?.isVertical));
    };

    const handleBackspace = () => {
        if (!activeCell) return;
        deleteLetterAt(activeCell.row, activeCell.col, Boolean(selectedDefinition?.isVertical));
    };

    return (
        <>
            <div className="hebrew-keyboard" ref={keyboardRef}>
                {/* Mirrors CurrentDef (same prev/next clue navigation) so the
                    active clue stays visible right above the keys instead of
                    scrolled off-screen - hidden entirely via showKeyboardClue
                    (KeyboardSettings) for users who'd rather keep this row for
                    keys only. The close button is always present - the
                    keyboard has no other way to dismiss it before this. */}
                <div className="hebrew-keyboard-clue">
                    {showKeyboardClue && (
                        <>
                            {/* previous flows toward reading-start (right, per CLAUDE.md RTL arrow rule) */}
                            <button
                                type="button"
                                className="hebrew-keyboard-clue-nav"
                                onMouseDown={preventBlur}
                                onClick={() => goToAdjacentDefinition(-1)}
                                disabled={orderedDefinitions.length === 0}
                                aria-label="הגדרה קודמת"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                            <span className="hebrew-keyboard-clue-text">
                                {selectedDefinition?.definition || 'כאן תופיעה ההגדרה המסומנת'}
                            </span>
                            {/* next flows toward reading-end (left) */}
                            <button
                                type="button"
                                className="hebrew-keyboard-clue-nav"
                                onMouseDown={preventBlur}
                                onClick={() => goToAdjacentDefinition(1)}
                                disabled={orderedDefinitions.length === 0}
                                aria-label="הגדרה הבאה"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        className="hebrew-keyboard-close"
                        onMouseDown={preventBlur}
                        onClick={closeKeyboard}
                        aria-label="סגירת המקלדת"
                        title="סגירת המקלדת"
                    >
                        <i className="bi bi-chevron-down"></i>
                    </button>
                </div>
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
            <div className="solver-keyboard-spacer" style={{ height: spacerHeight }} ref={spacerRef}></div>
        </>
    );
};

export default HebrewKeyboard;
