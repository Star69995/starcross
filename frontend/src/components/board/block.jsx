import  {  useRef, useState } from 'react';
import { useCrossword } from '../../providers/CrosswordContext';
import PropTypes from 'prop-types';


const Block = ({ row, col }) => {
    const { grid, showSolution, updateCell, selectedDefinition, setActiveDefinition } = useCrossword();
    const cell = grid[row][col];
    const value = showSolution && cell.solution ? cell.solution : cell.value || '';

    const inputRef = useRef(null);

    // const handleChange = (e) => {
    //     const inputValue = e.target.value;
    //     if (inputValue === '' || /^[א-ת]$/.test(inputValue)) {
    //         updateCell(row, col, inputValue);
    //         // מציאת האות הבאה באותה הגדרה
    //         moveToNextCell(row, col, selectedDefinition.isVertical);
    //     }
    // };

    // פונקציה שמעבירה את הפוקוס לאות הבאה
    const moveToNextCell = (row, col, isVertical) => {
        // console.log(row, col, isVertical);
        let nextRow = row;
        let nextCol = col;

        if (isVertical) {
            nextRow++;
        } else {
            nextCol++;
        }

        // if the next cell is not out of bounds, focus on it
        if (nextRow >= 0 && nextRow < grid.length && nextCol >= 0 && nextCol < grid[0].length) {
            // console.log("in bounds");

            const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextCell && nextCell.disabled == false && !nextCell.hasAttribute('readonly')) {
                nextCell.focus();
                // console.log(nextCell);
                // console.log(1);

                return
            }
            else {
                moveToNextCell(nextRow, nextCol, isVertical);
                return
            }
        }
    };

    const handleClick = () => {
        if (cell.definition !== null) {
            setActiveDefinition(cell, null);
        }
    };
    const isBlack = cell.solution === null;

    const moveToPrevCell = (row, col, isVertical) => {
        let prevRow = row;
        let prevCol = col;

        // determine direction
        if (isVertical) prevRow--;
        else prevCol--;

        // make sure we’re still inside the grid
        if (prevRow >= 0 && prevRow < grid.length && prevCol >= 0 && prevCol < grid[0].length) {
            const prevCell = document.querySelector(
                `[data-row="${prevRow}"][data-col="${prevCol}"]`
            );

            if (prevCell && !prevCell.disabled && !prevCell.hasAttribute("readonly")) {
                // clear previous cell value
                updateCell(prevRow, prevCol, "");

                // focus it slightly delayed to ensure DOM updates render first
                setTimeout(() => prevCell.focus(), 10);

                return;
            } else {
                // recursively move further back if current previous is invalid
                moveToPrevCell(prevRow, prevCol, isVertical);
            }
        }
    };

    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Normal letter typing (A-Z or Hebrew)
        if (/^[א-ת]$/.test(inputValue)) {
            updateCell(row, col, inputValue);
            moveToNextCell(row, col, selectedDefinition.isVertical);
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

            // CASE 1: Current cell has a value → just clear it
            if (cell.value) {
                updateCell(row, col, ""); // clear current
                return;
            }

            // CASE 2: Current cell is already empty → move back and clear previous
            moveToPrevCell(row, col, selectedDefinition.isVertical);
        }
    };

    // const isSelected = selectedDefinition && cell.definitions.includes(selectedDefinition);

    const [focusedCell, setFocusedCell] = useState(null);
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
                    backgroundColor: isBlack ? 'black' :
                        focusedCell?.row === row && focusedCell?.col === col && cell.value === cell.solution ? 'rgb(84, 180, 143)' :  // צבע ירוק בהיר כשנכון וממוקד
                            focusedCell?.row === row && focusedCell?.col === col ? 'rgb(171, 178, 255)' :
                                (cell.isHighlighted && cell.value === cell.solution) ? 'rgb(158, 255, 198)' : // צבע שונה אם ההגדרה מודגשת והתשובה נכונה
                                    cell.isHighlighted ? 'rgb(200, 220, 255)' :
                                        (cell.value === cell.solution || (showSolution && cell.solution)) ? 'rgb(221, 255, 221)' :
                                            'white',
                    outline: 'none',
                    opacity: isBlack || (showSolution && cell.solution) ? 1 : undefined,
                }}
                disabled={isBlack}
                readOnly={cell.value === cell.solution || showSolution && cell.solution}
                onFocus={(e) => {
                    if (!showSolution) {
                        e.target.select();

                        setFocusedCell({ row, col });
                    }
                }}
                onBlur={() => {
                    setFocusedCell(null);
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