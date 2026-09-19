import { useEffect, useRef } from 'react';
import { Dropdown } from 'bootstrap';
import { useCrossword } from '../../providers/CrosswordContext';

// Toolbar control for whether a correct letter locks (becomes read-only,
// tinted green) the instant it's typed, or only once its whole word is
// correct. Framed to the user as "automatic checking" timing rather than
// "locking" - locking is what happens internally, but users think of this
// as when the app checks their answer, not when a cell becomes uneditable.
// Persisted via CrosswordContext/utils/solvingSettings, which block.jsx's
// isCellConfirmed reads. Visible at every breakpoint (unlike
// KeyboardSettings) since it affects desktop solving just as much as mobile.
//
// Dropdown toggled manually rather than via data-bs-toggle, same reasoning
// as SoundSettings/KeyboardSettings: Bootstrap's own autoClose only wires up
// when that attribute is present, and having both fire on the same click
// double-toggles it shut again instantly.
const SolvingSettings = () => {
    const { lockMode, updateSolvingSettings } = useCrossword();
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
        <div className="dropdown" ref={containerRef}>
            <button
                ref={toggleRef}
                type="button"
                className="solve-toolbar-btn"
                onClick={() => dropdownRef.current?.toggle()}
                aria-expanded="false"
                aria-label="הגדרות בדיקה אוטומטית"
                title="הגדרות בדיקה אוטומטית"
            >
                <i className="bi bi-patch-check"></i>
            </button>
            <div className="dropdown-menu toolbar-dropdown-menu p-3">
                <p className="text-muted small mb-2 fw-semibold">מתי לבדוק אוטומטית שאות נכונה</p>
                <div className="form-check d-flex flex-row align-items-center mb-2">
                    <input
                        className="form-check-input ms-2"
                        type="radio"
                        name="lockMode"
                        id="lockModeLetter"
                        checked={lockMode === 'letter'}
                        onChange={() => updateSolvingSettings({ lockMode: 'letter' })}
                    />
                    <label className="form-check-label" htmlFor="lockModeLetter">
                        מיד עם כתיבת האות
                    </label>
                </div>
                <div className="form-check d-flex flex-row align-items-center">
                    <input
                        className="form-check-input ms-2"
                        type="radio"
                        name="lockMode"
                        id="lockModeWord"
                        checked={lockMode === 'word'}
                        onChange={() => updateSolvingSettings({ lockMode: 'word' })}
                    />
                    <label className="form-check-label" htmlFor="lockModeWord">
                        רק לאחר השלמת המילה
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SolvingSettings;
