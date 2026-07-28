// Preferences for the solver page's on-screen Hebrew keyboard
// (HebrewKeyboard.jsx): whether it replaces the device's native keyboard at
// all, and whether it shows the current clue above the keys. A per-browser
// UI setting, not solving progress, so it lives in localStorage like the
// sound settings (utils/sound.js).

const SETTINGS_KEY = 'starcross:keyboardSettings';
const DEFAULT_SETTINGS = { onScreenEnabled: true, showClue: true };

export const getKeyboardSettings = () => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
        console.error('Could not read keyboard settings:', error);
        return { ...DEFAULT_SETTINGS };
    }
};

export const setKeyboardSettings = (partial) => {
    const next = { ...getKeyboardSettings(), ...partial };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (error) {
        console.error('Could not save keyboard settings:', error);
    }
    return next;
};
