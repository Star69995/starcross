const MakeGrid = ({ size = 12, maxWords = 10, definitionsList = [] }) => {
    size = parseInt(size);
    maxWords = parseInt(maxWords);
    const createEmptyGrid = () => {
        return Array(size).fill().map(() =>
            Array(size).fill().map(() => ({
                solution: null,
                definitions: [],
                isHighlighted: false,
                definitionNumber: null  // הוספנו שדה למספר ההגדרה
            }))
        );
    };

    // Returns the crop bounds trimGrid would apply, so callers can shift any
    // row/col recorded against the untrimmed grid (e.g. wordPositions) by the
    // same top/left offset - otherwise those coordinates point at the wrong
    // cells once the grid is cropped.
    const getTrimBounds = (grid) => {
        const rows = grid.length;
        const cols = grid[0].length;

        let top = 0, bottom = rows - 1;
        while (top < rows && grid[top].every(cell => cell.solution === null)) {
            top++;
        }
        while (bottom >= 0 && grid[bottom].every(cell => cell.solution === null)) {
            bottom--;
        }

        let left = 0, right = cols - 1;
        while (left < cols && grid.every(row => row[left].solution === null)) {
            left++;
        }
        while (right >= 0 && grid.every(row => row[right].solution === null)) {
            right--;
        }

        return { top, bottom, left, right };
    };

    const trimGrid = (grid, { top, bottom, left, right }) => {
        // אם לא נותרו שורות או עמודות, תחזיר גריד ריק
        if (top > bottom || left > right) {
            return [];
        }

        // חיתוך הגריד
        return grid.slice(top, bottom + 1).map(row => row.slice(left, right + 1));
    };

    const sanitizeWord = (word) => {
        return word.replace(/[^A-Za-zא-ת]/g, "");
        // keeps only English or Hebrew letters, removes spaces, apostrophes, dashes, etc.
    };

    const canPlaceWord = (grid, word, row, col, isVertical) => {
        if (isVertical && row + word.length > size) return false;
        if (!isVertical && col + word.length > size) return false;

        let hasValidIntersection = false;

        for (let i = 0; i < word.length; i++) {
            const currentRow = isVertical ? row + i : row;
            const currentCol = isVertical ? col : col + i;
            const cell = grid[currentRow][currentCol];

            if (cell.solution !== null) {
                if (cell.solution !== word[i] || cell.isVertical === isVertical) {
                    return false;
                }
                hasValidIntersection = true;
            } else {
                if (isVertical) {
                    if (currentCol > 0 && grid[currentRow][currentCol - 1].solution !== null) return false;
                    if (currentCol < size - 1 && grid[currentRow][currentCol + 1].solution !== null) return false;
                } else {
                    if (currentRow > 0 && grid[currentRow - 1][currentCol].solution !== null) return false;
                    if (currentRow < size - 1 && grid[currentRow + 1][currentCol].solution !== null) return false;
                }
            }

            if (i === 0) {
                const prevRow = isVertical ? row - 1 : row;
                const prevCol = isVertical ? col : col - 1;
                if (prevRow >= 0 && prevCol >= 0 && grid[prevRow][prevCol].solution !== null) return false;
            }
            if (i === word.length - 1) {
                const nextRow = isVertical ? row + word.length : row;
                const nextCol = isVertical ? col : col + word.length;
                if (nextRow < size && nextCol < size && grid[nextRow][nextCol].solution !== null) return false;
            }
        }

        const isFirstWord = grid.every(row => row.every(cell => cell.solution === null));
        return isFirstWord || hasValidIntersection;
    };

    const placeWord = (grid, word, definition, row, col, isVertical, wordIndex, definitionNumber) => {
        const newGrid = JSON.parse(JSON.stringify(grid));

        for (let i = 0; i < word.length; i++) {
            const currentRow = isVertical ? row + i : row;
            const currentCol = isVertical ? col : col + i;

            newGrid[currentRow][currentCol] = {
                ...newGrid[currentRow][currentCol], // שומר על המידע הקיים
                solution: word[i], // מוסיף את האות הנוכחית
                wordIndex: wordIndex, // מזהה המילה
                definitions: [
                    ...newGrid[currentRow][currentCol].definitions, // שומר על ההגדרות הקיימות
                    { definition, isVertical }, // מוסיף את ההגדרה החדשה
                    // isAnswered = false
                ],
                isHighlighted: false,
                definitionNumber: i === 0 ? definitionNumber : newGrid[currentRow][currentCol].definitionNumber
            };
        }

        return newGrid;
    };

    // Places every word (after the first) at whichever valid spot overlaps
    // the most already-placed letters, instead of the first spot found while
    // scanning top-left to bottom-right - a plain first-fit tends to spread
    // words out with only one crossing each. Returns how many words this
    // attempt managed to place and their total overlap count, so
    // generateCrossword can run several shuffled attempts and keep the best.
    const runPlacementAttempt = (words) => {
        let grid = createEmptyGrid();
        const wordPositions = [];
        let currentDefinitionNumber = 1;
        let totalOverlaps = 0;

        const firstWord = words[0];
        const startRow = Math.floor(size / 2);
        const startCol = Math.floor((size - firstWord.solution.length) / 2);

        grid = placeWord(grid, firstWord.solution, firstWord.definition, startRow, startCol, false, 0, currentDefinitionNumber);
        wordPositions.push({
            wordIndex: 0,
            definition: firstWord.definition,
            row: startRow,
            col: startCol,
            isVertical: false,
            definitionNumber: currentDefinitionNumber
        });
        currentDefinitionNumber++;

        for (let i = 1; i < words.length; i++) {
            const wordObj = words[i];
            let best = null; // { row, col, isVertical, overlaps }

            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    for (const isVertical of [true, false]) {
                        if (!canPlaceWord(grid, wordObj.solution, row, col, isVertical)) continue;

                        let overlaps = 0;
                        for (let j = 0; j < wordObj.solution.length; j++) {
                            const checkRow = isVertical ? row + j : row;
                            const checkCol = isVertical ? col : col + j;
                            if (grid[checkRow][checkCol].solution !== null) overlaps++;
                        }
                        if (overlaps === 0) continue;

                        if (!best || overlaps > best.overlaps) {
                            best = { row, col, isVertical, overlaps };
                        }
                    }
                }
            }

            if (best) {
                grid = placeWord(grid, wordObj.solution, wordObj.definition, best.row, best.col, best.isVertical, i, currentDefinitionNumber);
                wordPositions.push({
                    wordIndex: i,
                    definition: wordObj.definition,
                    row: best.row,
                    col: best.col,
                    isVertical: best.isVertical,
                    definitionNumber: currentDefinitionNumber
                });
                currentDefinitionNumber++;
                totalOverlaps += best.overlaps;
            }
        }

        return { grid, wordPositions, totalOverlaps };
    };

    const generateCrossword = () => {
        const shuffledDefinitions = [...definitionsList]
            .sort(() => Math.random() - 0.5)
            .slice(0, maxWords);

        const baseWords = shuffledDefinitions
            .map(def => ({
                ...def,
                solution: sanitizeWord(def.solution)
            }))
            .filter(def => def.solution.length > 0); // keep only valid words

        // A few attempts with different random orderings (longest word still
        // seeds each attempt, so the grid stays anchored) - keeping the one
        // that places the most words, and among ties the one with the most
        // letter overlaps, produces a noticeably denser, more "crossword-y"
        // result than a single greedy pass.
        const ATTEMPTS = 8;
        let bestAttempt = null;

        for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
            const words = [...baseWords]
                .sort(() => Math.random() - 0.5)
                .sort((a, b) => b.solution.length - a.solution.length);

            const result = runPlacementAttempt(words);
            if (
                !bestAttempt ||
                result.wordPositions.length > bestAttempt.wordPositions.length ||
                (result.wordPositions.length === bestAttempt.wordPositions.length && result.totalOverlaps > bestAttempt.totalOverlaps)
            ) {
                bestAttempt = result;
            }
        }

        let { grid, wordPositions } = bestAttempt;

        // חיתוך שורות ועמודות ריקות - ומזיזים את wordPositions באותו היסט,
        // אחרת השורה/עמודה שלהם תצביע על תאים שגויים בגריד החתוך
        const trimBounds = getTrimBounds(grid);
        grid = trimGrid(grid, trimBounds);
        wordPositions.forEach(word => {
            word.row -= trimBounds.top;
            word.col -= trimBounds.left;
        });

        // מסדרים את ההגדרות לפי מאוזן/מאונך
        const formattedDefinitions = {
            across: [], // מאוזן
            down: [],   // מאונך
        };

        wordPositions.forEach(word => {
            const definitionObj = {
                number: word.definitionNumber,
                text: word.definition,
                isAnswered: false
            };

            if (word.isVertical) {
                formattedDefinitions.down.push(definitionObj);
            } else {
                formattedDefinitions.across.push(definitionObj);
            }
        });

        // מיון ההגדרות לפי המספרים
        formattedDefinitions.across.sort((a, b) => a.number - b.number);
        formattedDefinitions.down.sort((a, b) => a.number - b.number);
        
        return {
            grid,
            definitionsUsed: formattedDefinitions,
            wordPositions
        };
    };

    return generateCrossword();
};

export default MakeGrid;