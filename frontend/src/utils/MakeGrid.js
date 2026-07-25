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

    const trimGrid = (grid) => {
        const rows = grid.length;
        const cols = grid[0].length;

        // חיתוך שורות ריקות מלמעלה ומלמטה
        let top = 0, bottom = rows - 1;
        while (top < rows && grid[top].every(cell => cell.solution === null)) {
            top++;
        }
        while (bottom >= 0 && grid[bottom].every(cell => cell.solution === null)) {
            bottom--;
        }

        // חיתוך עמודות ריקות מצד ימין ושמאל
        let left = 0, right = cols - 1;
        while (left < cols && grid.every(row => row[left].solution === null)) {
            left++;
        }
        while (right >= 0 && grid.every(row => row[right].solution === null)) {
            right--;
        }

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

    const generateCrossword = () => {
        let grid = createEmptyGrid();
        const placedWords = new Set();
        const wordPositions = [];
        let currentDefinitionNumber = 1;  // מונה להגדרות

        const shuffledDefinitions = [...definitionsList]
            .sort(() => Math.random() - 0.5)
            .slice(0, maxWords);

        const sortedWords = shuffledDefinitions
            .map(def => ({
                ...def,
                solution: sanitizeWord(def.solution)
            }))
            .filter(def => def.solution.length > 0) // keep only valid words
            .sort((a, b) => b.solution.length - a.solution.length);

        const firstWord = sortedWords[0];
        const startRow = Math.floor(size / 2);
        const startCol = Math.floor((size - firstWord.solution.length) / 2);

        grid = placeWord(
            grid,
            firstWord.solution,
            firstWord.definition,
            startRow,
            startCol,
            false,
            0,
            currentDefinitionNumber
        );

        placedWords.add(0);
        wordPositions.push({
            wordIndex: 0,
            definition: firstWord.definition,
            row: startRow,
            col: startCol,
            isVertical: false,
            definitionNumber: currentDefinitionNumber
        });
        currentDefinitionNumber++;

        for (let i = 1; i < sortedWords.length; i++) {
            const wordObj = sortedWords[i];
            let placed = false;

            for (let row = 0; row < size && !placed; row++) {
                for (let col = 0; col < size && !placed; col++) {
                    for (const isVertical of [true, false]) {
                        if (canPlaceWord(grid, wordObj.solution, row, col, isVertical)) {
                            let hasIntersection = false;
                            for (let j = 0; j < wordObj.solution.length; j++) {
                                const checkRow = isVertical ? row + j : row;
                                const checkCol = isVertical ? col : col + j;
                                if (grid[checkRow][checkCol].solution !== null) {
                                    hasIntersection = true;
                                    break;
                                }
                            }

                            if (hasIntersection) {
                                grid = placeWord(
                                    grid,
                                    wordObj.solution,
                                    wordObj.definition,
                                    row,
                                    col,
                                    isVertical,
                                    i,
                                    currentDefinitionNumber
                                );
                                placedWords.add(i);
                                wordPositions.push({
                                    wordIndex: i,
                                    definition: wordObj.definition,
                                    row: row,
                                    col: col,
                                    isVertical: isVertical,
                                    definitionNumber: currentDefinitionNumber
                                });
                                currentDefinitionNumber++;
                                placed = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // חיתוך שורות ועמודות ריקות
        grid = trimGrid(grid);

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