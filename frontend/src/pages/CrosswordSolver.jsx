// pages/CrosswordSolver.jsx
import { useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Crossword from '../components/board/Crossword'
import HebrewKeyboard from '../components/board/HebrewKeyboard'
import SoundSettings from '../components/board/SoundSettings'
import KeyboardSettings from '../components/board/KeyboardSettings'
import {
    getCrosswordById,
    deleteCrossword,
    toggleLikeCrossword,
    getCrosswordProgress,
    saveCrosswordProgress,
    markCrosswordSolved,
    unmarkCrosswordSolved,
} from '../services/api'
import { useCrossword } from '../providers/CrosswordContext'
import ActionButtons from '../components/cards/ActionButtons'
import { useAuth } from '../providers/AuthContext'
import { canManage } from '../utils/permissions'
import { toast } from 'react-toastify'
import { useAsyncData } from '../hooks/useAsyncData'
import { extractGridValues, percentComplete } from '../utils/gridProgress'

const SAVE_DEBOUNCE_MS = 800

const CrosswordSolver = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { grid, isCompleted, loadGridData, revealHint } = useCrossword()
    const { user, loading: authLoading } = useAuth()
    const [showClueList, setShowClueList] = useState(true)
    const [showLoginBanner, setShowLoginBanner] = useState(true)

    // Progress sync bookkeeping - not React state on purpose, none of it should
    // trigger a re-render or be written to localStorage; Firestore is the only
    // persistence layer.
    const readyToSaveRef = useRef(false)
    const wasCompletedRef = useRef(false)
    const lastSavedSnapshotRef = useRef(null)

    const fetchCrossword = useCallback(async () => {
        try {
            return await getCrosswordById(id)
        } catch (error) {
            console.error('Error fetching crossword:', error)
            throw error
        }
    }, [id])

    const { data: crossword, loading, error: fetchError, setData: setCrossword } = useAsyncData(fetchCrossword, { enabled: !authLoading })
    const error = fetchError ? 'שגיאה בטעינת התשבץ' : (!loading && !crossword ? 'תשבץ לא נמצא' : '')
    const isLiked = Boolean(crossword?.likes?.includes(user?._id))

    const percent = useMemo(() => {
        if (!crossword || grid.length === 0) return 0
        return percentComplete(extractGridValues(grid), grid)
    }, [grid, crossword])

    // Load the grid and, for signed-in users, merge in their previously saved
    // progress from Firestore so solving resumes on any device.
    useEffect(() => {
        if (!crossword) return
        readyToSaveRef.current = false

        let cancelled = false
        const load = async () => {
            let savedValues = {}
            let completed = false
            if (user) {
                try {
                    const progress = await getCrosswordProgress(id)
                    savedValues = progress?.values || {}
                    completed = Boolean(progress?.completed)
                } catch (err) {
                    console.error('Error loading crossword progress:', err)
                }
            }
            if (cancelled) return
            wasCompletedRef.current = completed
            lastSavedSnapshotRef.current = JSON.stringify({ values: savedValues, completed })
            loadGridData(crossword.crosswordObject.gridData, savedValues)
            readyToSaveRef.current = true
        }
        load()

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [crossword, user, id])

    // Autosave: persist filled-in letters (debounced) whenever the grid
    // changes, and flip the crossword's `solved` membership the moment the
    // puzzle becomes (or stops being) fully answered.
    useEffect(() => {
        if (!user || !readyToSaveRef.current || grid.length === 0) return

        const timeoutId = setTimeout(async () => {
            const values = extractGridValues(grid)
            const snapshot = JSON.stringify({ values, completed: isCompleted })
            if (snapshot === lastSavedSnapshotRef.current) return

            try {
                await saveCrosswordProgress(id, values, isCompleted)
                lastSavedSnapshotRef.current = snapshot

                if (isCompleted !== wasCompletedRef.current) {
                    wasCompletedRef.current = isCompleted
                    if (isCompleted) {
                        await markCrosswordSolved(id)
                        setCrossword(prev => prev && { ...prev, solved: [...(prev.solved || []), user._id] })
                        toast.success('כל הכבוד! פתרת את התשבץ בהצלחה')
                    } else {
                        await unmarkCrosswordSolved(id)
                        setCrossword(prev => prev && { ...prev, solved: (prev.solved || []).filter(uid => uid !== user._id) })
                    }
                }
            } catch (err) {
                console.error('Error saving crossword progress:', err)
            }
        }, SAVE_DEBOUNCE_MS)

        return () => clearTimeout(timeoutId)
    }, [grid, isCompleted, user, id, setCrossword])

    const handleEdit = () => {
        navigate(`/edit-crossword/${crossword._id}/`)
    }

    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את התשבץ?')) {

            try {
                await deleteCrossword(id)
                navigate('/')
                toast.success('נמחק בהצלחה');
            } catch (error) {
                console.error('Error deleting crossword:', error)
                toast.error('שגיאה במחיקה');
            }

        }
    }

    const handleLike = async (likeId) => {
        if (!user) {
            toast.info("כדי לעשות לייק על תשבץ צריך להתחבר תחילה")
            return false;
        }
        try {
            await toggleLikeCrossword(likeId)
            setCrossword(prev => prev && {
                ...prev,
                likes: prev.likes.includes(user._id)
                    ? prev.likes.filter(uid => uid !== user._id)
                    : [...prev.likes, user._id],
            });
            return true;
        } catch (error) {
            console.error('Error liking word list:', error)
            toast.error('שגיאה בעדכון לייק');
            return false;
        }
    }

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">טוען תשבץ...</span>
                    </div>
                    <p className="mt-2 text-muted">טוען תשבץ...</p>
                </div>
            </div>
        )
    }

    if (error || !crossword) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">שגיאה</h4>
                        <p>{error || 'תשבץ לא נמצא'}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            חזור לדף הבית
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="solve-toolbar d-flex flex-wrap align-items-center gap-2 mb-2">
                        <h1 className="display-5 mb-0 text-truncate">
                            {crossword.title}
                            <i className="bi bi-puzzle-fill text-primary me-2"></i>
                        </h1>
                        <div className="flex-grow-1"></div>
                        <span className="solve-toolbar-pill">
                            <i className="bi bi-check2-circle ms-1"></i>
                            {percent}% הושלם
                        </span>
                        <button
                            type="button"
                            className="solve-toolbar-btn"
                            onClick={revealHint}
                            aria-label="רמז"
                            title="חשיפת אות ברמז"
                        >
                            <i className="bi bi-lightbulb"></i>
                        </button>
                        <SoundSettings />
                        <KeyboardSettings />
                        <button
                            type="button"
                            className="solve-toolbar-btn d-lg-none"
                            onClick={() => setShowClueList(v => !v)}
                            aria-label="הצג/הסתר רשימת הגדרות"
                        >
                            <i className="bi bi-list-check"></i>
                        </button>
                    </div>
                    <div className="solve-progress-bar mb-3">
                        <div className="solve-progress-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                        <div>
                            {crossword.description && (
                                <p className="text-muted mb-0">{crossword.description}</p>
                            )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <ActionButtons
                                isLiked={isLiked}
                                canEdit={canManage(user, crossword.creator._id)}
                                canDelete={canManage(user, crossword.creator._id)}
                                onEdit={handleEdit}
                                handleLike={handleLike}
                                handleDelete={handleDelete}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/')}
                            >
                                <i className="bi bi-arrow-right ms-2"></i>
                                חזור
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!user && !authLoading && showLoginBanner && (
                <div className="alert alert-info position-relative ps-5 mb-4" role="alert" style={{ textAlign: 'justify' }}>
                    <button
                        type="button"
                        className="btn-close position-absolute top-0 start-0 m-2"
                        aria-label="סגור"
                        onClick={() => setShowLoginBanner(false)}
                    ></button>
                    <i className="bi bi-info-circle-fill ms-2"></i>
                    ההתקדמות בפתרון תשבץ נשמרת אוטומטית רק למשתמשים מחוברים. הירשם כדי שההתקדמות שלך תישמר ותיטען מכל מכשיר.
                    <Link to="/register" className="btn btn-primary btn-sm me-2">
                        הרשמה
                    </Link>
                </div>
            )}

            <Crossword showClueList={showClueList} />
            <HebrewKeyboard />
        </div>
    )
}

export default CrosswordSolver
