// Sound played when a definition is answered correctly, plus the user's
// preference for it. No audio assets are shipped - tones are synthesized with
// the Web Audio API and the "voice" option uses the browser's built-in speech
// synthesis, so there's nothing to download and nothing to host.

const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    return new AudioContextClass();
};

const playTone = (ctx, { frequency, startTime, duration, type = 'sine', peakGain = 0.2 }) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
};

// Bright ascending major arpeggio (C6-E6-G6) - a fuller, warmer "success"
// chime than a flat two-tone beep.
const playChime = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        playTone(ctx, { frequency: 1046.5, startTime: now, duration: 0.32, peakGain: 0.18 });
        playTone(ctx, { frequency: 1318.5, startTime: now + 0.09, duration: 0.32, peakGain: 0.18 });
        playTone(ctx, { frequency: 1568.0, startTime: now + 0.18, duration: 0.5, peakGain: 0.2 });
        setTimeout(() => ctx.close(), 800);
    } catch (error) {
        console.error('Could not play chime sound:', error);
    }
};

// Single note layered with soft inharmonic overtones and a long decay, for a
// bell/glockenspiel-like timbre instead of a chord run.
const playBell = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const fundamental = 1046.5;
        [1, 2.4, 3.8].forEach((multiplier, index) => {
            playTone(ctx, {
                frequency: fundamental * multiplier,
                startTime: now,
                duration: 1 - index * 0.15,
                peakGain: 0.2 / (index + 1),
            });
        });
        setTimeout(() => ctx.close(), 1300);
    } catch (error) {
        console.error('Could not play bell sound:', error);
    }
};

// Speaks the word "correct" out loud in Hebrew instead of playing a tone.
// Falls back to the chime if speech synthesis isn't available in this browser.
const playVoice = () => {
    try {
        if (!('speechSynthesis' in window)) {
            playChime();
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('נכון!');
        utterance.lang = 'he-IL';
        utterance.pitch = 1.1;
        utterance.rate = 1;
        const hebrewVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang?.startsWith('he'));
        if (hebrewVoice) utterance.voice = hebrewVoice;
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Could not play voice sound:', error);
    }
};

export const SOUND_OPTIONS = [
    { id: 'chime', label: 'צליל נעים', play: playChime },
    { id: 'bell', label: 'פעמון', play: playBell },
    { id: 'voice', label: 'קול אומר "נכון!"', play: playVoice },
];

const SETTINGS_KEY = 'starcross:soundSettings';
const DEFAULT_SETTINGS = { enabled: true, soundId: 'chime' };

// The sound preference is a per-browser UI setting, not solving progress, and
// the crossword solver works for signed-out visitors too - so it lives in
// localStorage rather than the Firestore user doc used for account data.
export const getSoundSettings = () => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
        console.error('Could not read sound settings:', error);
        return { ...DEFAULT_SETTINGS };
    }
};

export const setSoundSettings = (partial) => {
    const next = { ...getSoundSettings(), ...partial };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (error) {
        console.error('Could not save sound settings:', error);
    }
    return next;
};

export const playCorrectSound = () => {
    const { enabled, soundId } = getSoundSettings();
    if (!enabled) return;
    const option = SOUND_OPTIONS.find((candidate) => candidate.id === soundId) || SOUND_OPTIONS[0];
    option.play();
};
