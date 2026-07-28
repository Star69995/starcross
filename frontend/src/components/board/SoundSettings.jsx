import { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'bootstrap';
import { SOUND_OPTIONS, getSoundSettings, setSoundSettings } from '../../utils/sound';

// Toolbar control for the "play a sound on a correct answer" preference -
// an on/off switch plus a choice of which sound to play. Lives next to the
// other solve-toolbar buttons since it's specific to the solving experience.
//
// The dropdown is toggled manually (like Navbar's account dropdown) rather
// than via the data-bs-toggle="dropdown" attribute, and outside-clicks/Escape
// close it through a plain listener rather than Bootstrap's built-in
// autoClose: Bootstrap's own outside-click/Escape handling only recognizes
// toggles carrying that attribute, but the attribute also wires up
// Bootstrap's own delegated click-to-toggle handler - having both fire on
// the same click double-toggles it shut again instantly.
const SoundSettings = () => {
    const [settings, setSettings] = useState(getSoundSettings);
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

    const handleToggle = () => {
        setSettings(setSoundSettings({ enabled: !settings.enabled }));
    };

    const handleSelect = (option) => {
        setSettings(setSoundSettings({ soundId: option.id }));
        option.play();
    };

    return (
        <div className="dropdown" ref={containerRef}>
            <button
                ref={toggleRef}
                type="button"
                className="solve-toolbar-btn"
                onClick={() => dropdownRef.current?.toggle()}
                aria-expanded="false"
                aria-label="הגדרות צליל"
                title="הגדרות צליל"
            >
                <i className={`bi ${settings.enabled ? 'bi-volume-up' : 'bi-volume-mute'}`}></i>
            </button>
            <div className="dropdown-menu toolbar-dropdown-menu p-3">
                <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="soundEnabledSwitch"
                        checked={settings.enabled}
                        onChange={handleToggle}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="soundEnabledSwitch">
                        צליל בתשובה נכונה
                    </label>
                </div>
                <hr className="my-2" />
                <p className="text-muted small mb-2">בחירת צליל</p>
                <div className="d-flex flex-column gap-1">
                    {SOUND_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            className={`btn btn-sm d-flex align-items-center gap-2 sound-option-btn ${settings.soundId === option.id ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                            onClick={() => handleSelect(option)}
                        >
                            <i className="bi bi-play-circle"></i>
                            <span className="flex-grow-1">{option.label}</span>
                            {settings.soundId === option.id && <i className="bi bi-check-lg"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SoundSettings;
