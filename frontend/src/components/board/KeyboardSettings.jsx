import { useEffect, useRef } from 'react';
import { Dropdown } from 'bootstrap';
import { useCrossword } from '../../providers/CrosswordContext';

// Toolbar control (mobile only, like the docked keyboard itself) for opting
// out of the app's on-screen Hebrew keyboard in favor of each device's
// native one. Persisted via CrosswordContext/utils/keyboardSettings, which
// both Block.jsx's inputMode and HebrewKeyboard's visibility read.
//
// Dropdown toggled manually rather than via data-bs-toggle, same reasoning
// as SoundSettings: Bootstrap's own autoClose only wires up when that
// attribute is present, and having both fire on the same click double-toggles
// it shut again instantly.
const KeyboardSettings = () => {
    const { onScreenKeyboardEnabled, showKeyboardClue, updateKeyboardSettings } = useCrossword();
    const containerRef = useRef(null);
    const toggleRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (toggleRef.current) {
            dropdownRef.current = new Dropdown(toggleRef.current, { autoClose: 'outside' });
        }
        return () => {
            dropdownRef.current?.dispose();
            dropdownRef.current = null;
        };
    }, []);

    useEffect(() => {
        const handleOutsideInteraction = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                dropdownRef.current?.hide();
            }
        };
        const handleKeydown = (event) => {
            if (event.key === 'Escape') dropdownRef.current?.hide();
        };
        document.addEventListener('mousedown', handleOutsideInteraction);
        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('mousedown', handleOutsideInteraction);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    return (
        <div className="dropdown d-lg-none" ref={containerRef}>
            <button
                ref={toggleRef}
                type="button"
                className="solve-toolbar-btn"
                onClick={() => dropdownRef.current?.toggle()}
                aria-expanded="false"
                aria-label="הגדרות מקלדת"
                title="הגדרות מקלדת"
            >
                <i className="bi bi-keyboard"></i>
            </button>
            <div className="dropdown-menu toolbar-dropdown-menu p-3">
                <div className="form-check form-switch mb-1">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="onScreenKeyboardSwitch"
                        checked={onScreenKeyboardEnabled}
                        onChange={() => updateKeyboardSettings({ onScreenEnabled: !onScreenKeyboardEnabled })}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="onScreenKeyboardSwitch">
                        מקלדת עברית על גבי המסך
                    </label>
                </div>
                <p className="text-muted small mb-2">
                    כשהאפשרות כבויה, ההקלדה תתבצע במקלדת המובנית של המכשיר.
                </p>
                <hr className="my-2" />
                <div className="form-check form-switch mb-1">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="keyboardClueSwitch"
                        checked={showKeyboardClue}
                        onChange={() => updateKeyboardSettings({ showClue: !showKeyboardClue })}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="keyboardClueSwitch">
                        הצגת ההגדרה מעל המקלדת
                    </label>
                </div>
                <p className="text-muted small mb-0">
                    כשהאפשרות כבויה, המקלדת תציג רק את האותיות, ללא שורת ההגדרה.
                </p>
            </div>
        </div>
    );
};

export default KeyboardSettings;
