// Preference for the solver page's cell-locking behavior: whether a letter
// locks (becomes read-only, tinted green) the instant it's individually
// correct, or only once every letter in its word is correct. A per-browser
// UI setting, not solving progress, so it lives in localStorage like the
// keyboard/sound settings (utils/keyboardSettings.js, utils/sound.js).

const SETTINGS_KEY = 'starcross:solvingSettings';
const DEFAULT_SETTINGS = { lockMode: 'letter' }; // 'letter' | 'word'

export const getSolvingSettings = () => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
        console.error('Could not read solving settings:', error);
        return { ...DEFAULT_SETTINGS };
    }
};

export const setSolvingSettings = (partial) => {
    const next = { ...getSolvingSettings(), ...partial };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (error) {
        console.error('Could not save solving settings:', error);
    }
    return next;
};
