import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { playCorrectSound } from '../utils/sound';
import { lettersMatch, normalizeFinalLetter } from '../utils/hebrew';
import { getKeyboardSettings, setKeyboardSettings } from '../utils/keyboardSettings';

const CrosswordContext = createContext();

export const useCrossword = () => useContext(CrosswordContext);

// Shared by updateCell (checks the one word just touched) and loadGridData
// (checks every word up front when restoring saved progress) so both paths
// agree on what "fully answered" means. Word length isn't stored anywhere
// (wordPositions only has a start cell + direction), so this walks the grid
// from the start cell until it runs off the contiguous run of solution
// cells that make up the word - MakeGrid never leaves gaps within a word,
// even through perpendicular intersections, so this reconstructs the exact
// word extent without needing its length up front.
const isWordFullyAnswered = (grid, wordData) => {
    const { row: startRow, col: startCol, isVertical } = wordData;
    let row = startRow;
    let col = startCol;
    let hasCell = false;

    while (grid[row]?.[col]?.solution) {
        hasCell = true;
        if (!lettersMatch(grid[row][col].value, grid[row][col].solution)) return false;
        if (isVertical) row++; else col++;
    }

    return hasCell;
};

export const CrosswordProvider = ({ children }) => {
    const [grid, setGrid] = useState([]);
    const [definitionsUsed, setDefinitionsUsed] = useState({});
    const [wordPositions, setWordPositions] = useState([]);
    const [selectedDefinition, setSelectedDefinition] = useState(null);
    // The cell currently focused for typing - shared (rather than local Block
    // state) so the on-screen mobile keyboard knows where to type without a
    // DOM element of its own. Kept in sync by each Block's onFocus/onBlur.
    const [activeCell, setActiveCell] = useState(null);
    // Per-browser preferences (KeyboardSettings, solve toolbar): whether the
    // docked on-screen Hebrew keyboard replaces the device's native one, and
    // whether it shows the current clue above the keys.
    const [keyboardSettings, setKeyboardSettingsState] = useState(getKeyboardSettings);
    const { onScreenEnabled: onScreenKeyboardEnabled, showClue: showKeyboardClue } = keyboardSettings;

    const setGridData = (data) => {
        setGrid(data.grid);
        setDefinitionsUsed(data.definitionsUsed);
        setWordPositions(data.wordPositions);
    };

    // Applies previously saved per-cell letters (keyed "row_col") onto a
    // freshly loaded grid and recomputes every word's isAnswered flag in one
    // shot. Used instead of replaying updateCell per saved cell, since each
    // updateCell call reads `grid` from the same stale closure until the
    // component re-renders - a loop of calls would silently drop all but the
    // last cell's change.
    const loadGridData = (data, savedValues = {}) => {
        if (!savedValues || Object.keys(savedValues).length === 0) {
            setGridData(data);
            return;
        }

        const mergedGrid = data.grid.map((row, r) =>
            row.map((cell, c) => {
                const savedValue = savedValues[`${r}_${c}`];
                return savedValue ? { ...cell, value: savedValue } : cell;
            })
        );

        const mergedDefinitions = {
            across: (data.definitionsUsed.across || []).map((d) => ({ ...d })),
            down: (data.definitionsUsed.down || []).map((d) => ({ ...d })),
        };

        data.wordPositions.forEach((wordData) => {
            const category = wordData.isVertical ? 'down' : 'across';
            const entry = mergedDefinitions[category].find((d) => d.text === wordData.definition);
            if (entry) {
                entry.isAnswered = isWordFullyAnswered(mergedGrid, wordData);
            }
        });

        setGridData({ grid: mergedGrid, definitionsUsed: mergedDefinitions, wordPositions: data.wordPositions });
    };

    const updateCell = (row, col, value) => {
        try {
            if (!grid[row] || !grid[row][col]) {
                console.error('Invalid cell position:', row, col);
                return;
            }

            const updatedGrid = [...grid];
            updatedGrid[row][col] = { ...updatedGrid[row][col], value };

            const updatedDefinitions = { ...definitionsUsed };

            updatedGrid[row][col].definitions?.forEach((definition) => {
                const { definition: defText } = definition;
                const wordData = wordPositions.find(w => w.definition === defText);

                if (wordData) {
                    const isFullyAnswered = isWordFullyAnswered(updatedGrid, wordData);
                    const definitionCategory = wordData.isVertical ? "down" : "across";
                    const definitionEntry = updatedDefinitions[definitionCategory]?.find(d => d.text === defText);

                    if (definitionEntry) {
                        if (isFullyAnswered && !definitionEntry.isAnswered) {
                            playCorrectSound();
                        }
                        definitionEntry.isAnswered = isFullyAnswered;
                    }
                }
            });

            setGridData({ grid: updatedGrid, definitionsUsed: updatedDefinitions, wordPositions });
        } catch (error) {
            console.error('Error updating cell:', error);
        }
    };

    const updateHighlightedCells = (definition) => {
        try {
            const newGrid = grid.map(row =>
                row.map(cell => {
                    const isHighlighted = cell.definitions?.some(def =>
                        def.definition === definition.definition && def.isVertical === definition.isVertical
                    );
                    return { ...cell, isHighlighted };
                })
            );
            setGridData({ grid: newGrid, definitionsUsed, wordPositions });
        } catch (error) {
            console.error('Error updating highlighted cells:', error);
        }
    };

    const getDefinitionDirection = (definition) => {
        const word = wordPositions.find(word => word.definition === definition);
        return word ? word.isVertical : null;
    };

    // Focuses the first not-yet-correct cell of a word (falling back to its
    // start cell if the word is already fully answered), so picking a clue
    // from the definitions list lands the cursor somewhere useful instead of
    // just highlighting the word with no active input.
    const focusFirstEmptyCellInWord = (wordData) => {
        if (!wordData) return;
        const { row: startRow, col: startCol, isVertical } = wordData;
        let row = startRow;
        let col = startCol;
        let targetRow = startRow;
        let targetCol = startCol;
        let foundEmpty = false;

        while (grid[row]?.[col]?.solution) {
            if (!foundEmpty && !lettersMatch(grid[row][col].value, grid[row][col].solution)) {
                targetRow = row;
                targetCol = col;
                foundEmpty = true;
            }
            if (isVertical) row++; else col++;
        }

        document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`)?.focus();
    };

    const setActiveDefinition = (cell = null, inputDefinition = null) => {
        try {
            if (cell && cell.definitions?.length > 0) {
                if (cell.definitions.length === 1) {
                    setSelectedDefinition(cell.definitions[0]);
                    updateHighlightedCells(cell.definitions[0]);
                } else {
                    const newDefinition =
                        selectedDefinition == null || selectedDefinition.isVertical !== cell.definitions[0].isVertical
                            ? cell.definitions[0]
                            : cell.definitions[1];
                    setSelectedDefinition(newDefinition);
                    updateHighlightedCells(newDefinition);
                }
            } else if (inputDefinition) {
                const newDefinition = {
                    definition: inputDefinition,
                    isVertical: getDefinitionDirection(inputDefinition)
                };
                setSelectedDefinition(newDefinition);
                updateHighlightedCells(newDefinition);
                const wordData = wordPositions.find(
                    w => w.definition === inputDefinition && w.isVertical === newDefinition.isVertical
                );
                focusFirstEmptyCellInWord(wordData);
            }
        } catch (error) {
            console.error('Error setting active definition:', error);
        }
    };

    // Finds the next focusable (non-black, not-already-correct) cell input in
    // the given direction and focuses it, so both physical typing (Block) and
    // the on-screen keyboard advance through a word the same way. DOM-focus
    // based (not pure state) so physical-keyboard input keeps landing wherever
    // the user is actually looking, matching the pre-existing behavior this
    // replaces.
    const moveFocus = (row, col, isVertical, step) => {
        let r = row;
        let c = col;
        for (; ;) {
            r = isVertical ? r + step : r;
            c = isVertical ? c : c + step;
            if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
            const el = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (!el) return;
            if (!el.disabled && !el.hasAttribute('readonly')) {
                el.focus();
                return;
            }
        }
    };

    // Single source of truth for "type a letter into a cell and advance" -
    // used by Block's physical <input> and the on-screen HebrewKeyboard alike.
    // Final letters (ך/ם/ן/ף/ץ) - which the on-screen keyboard has dedicated
    // keys for, and some OS keyboards insert automatically - are normalized to
    // their medial form, since a grid cell can sit mid-word at an intersection
    // regardless of where the across/down word ends.
    const typeLetter = (row, col, letter, isVertical) => {
        updateCell(row, col, normalizeFinalLetter(letter));
        moveFocus(row, col, isVertical, 1);
    };

    // Mirrors the previous Backspace handling: clear the current cell if it has
    // a value, otherwise step back one cell and clear that one instead.
    const deleteLetterAt = (row, col, isVertical) => {
        if (grid[row]?.[col]?.value) {
            updateCell(row, col, '');
            return;
        }

        let r = row;
        let c = col;
        for (; ;) {
            r = isVertical ? r - 1 : r;
            c = isVertical ? c : c - 1;
            if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
            const el = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (!el) return;
            if (!el.disabled && !el.hasAttribute('readonly')) {
                updateCell(r, c, '');
                setTimeout(() => el.focus(), 10);
                return;
            }
        }
    };

    // Reveals one correct letter in the active word (the first cell that's still
    // wrong/empty) - a real single-letter hint, not a full-grid "show solution".
    const revealHint = () => {
        if (!selectedDefinition) return;
        const wordData = wordPositions.find(
            (w) => w.definition === selectedDefinition.definition && w.isVertical === selectedDefinition.isVertical
        );
        if (!wordData) return;

        let { row, col } = wordData;
        const { isVertical } = wordData;
        while (grid[row]?.[col]?.solution) {
            const cell = grid[row][col];
            if (!lettersMatch(cell.value, cell.solution)) {
                updateCell(row, col, cell.solution);
                return;
            }
            if (isVertical) row++; else col++;
        }
    };

    const isCompleted = useMemo(() => {
        const allDefinitions = [...(definitionsUsed.across || []), ...(definitionsUsed.down || [])];
        return allDefinitions.length > 0 && allDefinitions.every((d) => d.isAnswered);
    }, [definitionsUsed]);

    const updateKeyboardSettings = (partial) => {
        setKeyboardSettingsState(setKeyboardSettings(partial));
    };

    // Combines across+down into one number-ordered list so prev/next can step
    // through every clue in reading order, regardless of direction. Shared by
    // CurrentDef and the on-screen keyboard's clue row so both step through
    // clues the same way.
    const orderedDefinitions = useMemo(() => [
        ...(definitionsUsed.across || []).map((d) => ({ ...d, isVertical: false })),
        ...(definitionsUsed.down || []).map((d) => ({ ...d, isVertical: true })),
    ].sort((a, b) => a.number - b.number || (a.isVertical === b.isVertical ? 0 : a.isVertical ? 1 : -1)), [definitionsUsed]);

    const goToAdjacentDefinition = (step) => {
        if (orderedDefinitions.length === 0) return;
        const currentIndex = orderedDefinitions.findIndex(
            (d) => d.text === selectedDefinition?.definition && d.isVertical === selectedDefinition?.isVertical
        );
        const nextIndex = (currentIndex + step + orderedDefinitions.length) % orderedDefinitions.length;
        setActiveDefinition(null, orderedDefinitions[nextIndex].text);
    };

    // The on-screen keyboard is only docked while a cell is actually focused
    // (like a native keyboard appearing on focus) and the preference above is
    // on - so it starts closed, and gives the grid/clue list the full mobile
    // viewport until the user taps a cell.
    const isKeyboardOpen = onScreenKeyboardEnabled && Boolean(activeCell);

    // Dismisses the on-screen keyboard on demand (its own close button) rather
    // than only via Block's onBlur - blurring the focused cell first so the
    // two stay in sync instead of leaving a cell visually focused underneath
    // a hidden keyboard.
    const closeKeyboard = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setActiveCell(null);
    };

    return (
        <CrosswordContext.Provider value={{
            grid,
            definitionsUsed,
            wordPositions,
            isCompleted,
            // showSolution,
            // handleNewPuzzle,
            // handleNewCustomPuzzle,
            // handleToggleSolution,
            updateCell,
            typeLetter,
            deleteLetterAt,
            revealHint,
            activeCell,
            setActiveCell,
            onScreenKeyboardEnabled,
            showKeyboardClue,
            updateKeyboardSettings,
            isKeyboardOpen,
            closeKeyboard,
            orderedDefinitions,
            goToAdjacentDefinition,
            selectedDefinition,
            setActiveDefinition,
            setGridData,
            loadGridData
            // definitionsList,
            // setDefinitionsList
        }}>
            {children}
        </CrosswordContext.Provider>
    );
};

CrosswordProvider.propTypes = {
    children: PropTypes.node.isRequired,
};