import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { playCorrectSound } from '../utils/sound';

const CrosswordContext = createContext();

export const useCrossword = () => useContext(CrosswordContext);

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
                    const { row: startRow, col: startCol, isVertical } = wordData;
                    let isFullyAnswered = true;

                    for (let i = 0; i < defText.length; i++) {
                        const checkRow = isVertical ? startRow + i : startRow;
                        const checkCol = isVertical ? startCol : startCol + i;

                        if (!updatedGrid[checkRow] || !updatedGrid[checkRow][checkCol]) {
                            continue;
                        }

                        const cell = updatedGrid[checkRow][checkCol];
                        if (!cell.solution || cell.value !== cell.solution) {
                            isFullyAnswered = false;
                            break;
                        }
                    }

                    const definitionCategory = isVertical ? "down" : "across";
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

    return (
        <CrosswordContext.Provider value={{
            grid,
            definitionsUsed,
            wordPositions,
            // showSolution,
            // handleNewPuzzle,
            // handleNewCustomPuzzle,
            // handleToggleSolution,
            updateCell,
            selectedDefinition,
            setActiveDefinition,
            setGridData
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