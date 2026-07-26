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
