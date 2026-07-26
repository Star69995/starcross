import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { playCorrectSound } from '../utils/sound';

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
        if (grid[row][col].value !== grid[row][col].solution) return false;
        if (isVertical) row++; else col++;
    }

    return hasCell;
};

export const CrosswordProvider = ({ children }) => {
    const [grid, setGrid] = useState([]);
    const [definitionsUsed, setDefinitionsUsed] = useState({});
    const [wordPositions, setWordPositions] = useState([]);
    const [selectedDefinition, setSelectedDefinition] = useState(null);

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
            }
        } catch (error) {
            console.error('Error setting active definition:', error);
        }
    };

    const isCompleted = useMemo(() => {
        const allDefinitions = [...(definitionsUsed.across || []), ...(definitionsUsed.down || [])];
        return allDefinitions.length > 0 && allDefinitions.every((d) => d.isAnswered);
    }, [definitionsUsed]);

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