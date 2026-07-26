// Flattens a solved-so-far grid into a sparse map of only the filled cells,
// keyed by "row_col", so Firestore only stores what the user actually typed
// (not the solutions/definitions, which already live on the crossword doc).
export const extractGridValues = (grid) => {
    const values = {}
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell.value) values[`${r}_${c}`] = cell.value
        })
    })
    return values
}

// Non-black (fillable) cell count for a *decoded* grid (array of row arrays of
// cell objects with `.solution`) - the denominator for a percent-complete figure.
// Shared by the Home "continue" card (grid from a fetched-but-not-open crossword)
// and the live solver (grid from CrosswordContext) so both agree on what counts.
export const countFillableCells = (grid) =>
    grid.reduce((total, row) => total + row.filter((cell) => cell.solution !== null).length, 0)

// Percent complete (0-100, rounded) given a saved progress values map and the
// crossword's decoded grid.
export const percentComplete = (values, grid) => {
    const fillable = countFillableCells(grid)
    if (!fillable) return 0
    return Math.round((Object.keys(values || {}).length / fillable) * 100)
}
