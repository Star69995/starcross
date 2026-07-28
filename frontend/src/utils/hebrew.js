// Crossword solutions are authored with correct final letters (ך/ם/ן/ף/ץ)
// where a word actually ends, but a solved grid only ever stores medial
// letters (see block.jsx's handleChange) - letters sit at word intersections,
// not just word ends, so displaying/typing the final form there would look
// wrong. Any comparison between a typed value and a solution must normalize
// both sides through this map first.
const FINAL_TO_MEDIAL = {
    'ך': 'כ',
    'ם': 'מ',
    'ן': 'נ',
    'ף': 'פ',
    'ץ': 'צ',
};

export const normalizeFinalLetter = (letter) => FINAL_TO_MEDIAL[letter] || letter;

export const lettersMatch = (a, b) => normalizeFinalLetter(a) === normalizeFinalLetter(b);
