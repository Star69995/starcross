import { useRef } from 'react';
import { useCrossword } from '../../providers/CrosswordContext';
import PropTypes from 'prop-types';


const Block = ({ row, col }) => {
    const {
        grid, showSolution, updateCell, typeLetter, deleteLetterAt,
        selectedDefinition, setActiveDefinition, activeCell, setActiveCell,
    } = useCrossword();
    const cell = grid[row][col];
    const value = showSolution && cell.solution ? cell.solution : cell.value || '';

    const inputRef = useRef(null);

    const handleClick = () => {
        if (cell.definition !== null) {
            setActiveDefinition(cell, null);
        }
    };
    const isBlack = cell.solution === null;

    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Normal letter typing (Hebrew) - shared with the on-screen keyboard so
        // physical and on-screen typing behave identically (see CrosswordContext).
        if (/^[א-ת]$/.test(inputValue)) {
            typeLetter(row, col, inputValue, selectedDefinition.isVertical);
            return;
        }

        // Handle deletion (manual deletion via Backspace or clearing)
        if (inputValue === '') {
            updateCell(row, col, '');
            // Do NOT move here — backspace movement handled in onKeyDown
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            deleteLetterAt(row, col, selectedDefinition.isVertical);
        }
    };

    const isFocused = activeCell?.row === row && activeCell?.col === col;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {cell.definitionNumber && !isBlack && (
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '12px',
                    zIndex: 1
                }}>
                    {cell.definitionNumber}
                </div>
            )}
            <input
                type="text"
                inputMode="none"
                value={value}
                onChange={handleChange}
                onClick={handleClick}
                maxLength="1"
                style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    fontSize: '24px',
                    border: 'none',
                    backgroundColor: isBlack ? 'var(--ink)' :
                        isFocused && cell.value === cell.solution ? '#D8E9C9' : // focused + correct
                            isFocused ? 'var(--highlight-tint)' : // focused (highlighter-pen tint)
                                (cell.isHighlighted && cell.value === cell.solution) ? '#EAF6DE' : // active word + correct
                                    cell.isHighlighted ? 'var(--accent-tint)' : // active word
                                        (cell.value === cell.solution || (showSolution && cell.solution)) ? 'var(--success-tint)' :
                                            'white',
                    outline: 'none',
                    opacity: isBlack || (showSolution && cell.solution) ? 1 : undefined,
                }}
                disabled={isBlack}
                readOnly={cell.value === cell.solution || showSolution && cell.solution}
                onFocus={(e) => {
                    if (!showSolution) {
                        e.target.select();
                        setActiveCell({ row, col });
                    }
                }}
                onBlur={() => {
                    setActiveCell(null);
                }}
                onKeyDown={(e) => {
                    // detect Backspace
                    handleKeyDown(e);
                }}
                data-row={row}
                data-col={col}
                ref={inputRef}
            />
        </div>
    );
};

Block.propTypes = {
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired
};

export default Block;
