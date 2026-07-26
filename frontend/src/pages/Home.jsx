// pages/Home.jsx
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CrosswordCard from '../components/cards/CrosswordCard'
import CreateCard from '../components/cards/CreateCard'
import { getCrosswords, getInProgressCrossword, getRecentSolves, getSolvedCount } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../providers/AuthContext'
import { percentComplete } from '../utils/gridProgress'
import { formatRelativeDate } from '../utils/relativeDate'

const Home = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')

    const fetchCrosswords = useCallback(async () => {
        try {
            const data = await getCrosswords();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching crosswords:', error);
            return []; // Fallback to empty array on error
        }
    }, []);

    const { data, loading, setData: setCrosswords } = useAsyncData(fetchCrosswords)
    const crosswords = data || []

    // "Continue where you left off" + recent activity - real per-user progress
    // data (see services/api.js#getInProgressCrossword/getRecentSolves), not an
    // invented streak. Failures (e.g. a Firestore rule gap on listing the
    // progress subcollection) are swallowed so the rest of the page still works.
    const fetchActivity = useCallback(async () => {
        if (!user) return null
        try {
            const [inProgress, recentSolves, solvedCount] = await Promise.all([
                getInProgressCrossword(),
                getRecentSolves(2),
                getSolvedCount(),
            ])
            return { inProgress, recentSolves, solvedCount }
        } catch (error) {
            console.error('Error loading activity:', error)
            return null
        }
    }, [user])

    const { data: activity } = useAsyncData(fetchActivity, { enabled: Boolean(user) })
    const inProgressPercent = useMemo(() => {
        if (!activity?.inProgress?.crossword) return 0
        return percentComplete(activity.inProgress.values, activity.inProgress.crossword.crosswordObject.gridData.grid)
    }, [activity])

    const filteredCrosswords = crosswords.filter(cw =>
        cw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cw.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteCrossword = (id) => {
        setCrosswords(prev => (prev || []).filter(cw => cw._id !== id));
    };

    const hasActivity = user && activity && (activity.inProgress || activity.recentSolves.length > 0 || activity.solvedCount > 0)

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="mb-4">
                        <h1 className="display-4 mb-1">תשבצים</h1>
                        <p className="text-muted mb-0">יש תשבץ אחד באמצע פתירה, ואפשר להמשיך להתקדם בדיוק מאיפה שהפסקת</p>
                    </div>
                </div>
            </div>

            {hasActivity && (
                <div className="row g-3 mb-4">
                    <div className="col-lg-5">
                        <div className="card content-card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong className="fs-4">{activity.solvedCount}</strong>
                                    <span className="text-muted small">תשבצים נפתרו עד כה</span>
                                </div>
                                {activity.recentSolves.length > 0 && (
                                    <ul className="list-unstyled mb-0 small">
                                        {activity.recentSolves.map(solve => (
                                            <li key={solve.crosswordId} className="d-flex justify-content-between align-items-center py-1">
                                                <span className="text-muted">{formatRelativeDate(solve.updatedAt)}</span>
                                                <span className="text-truncate">
                                                    {solve.crossword.title}
                                                    <i className="bi bi-check-circle-fill text-success ms-2"></i>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    {activity.inProgress?.crossword && (
                        <div className="col-lg-7">
                            <div className="continue-card h-100">
                                <div className="fw-bold mb-2">
                                    <i className="bi bi-play-circle ms-1"></i>
                                    ממשיכים מאיפה שהפסקת
                                </div>
                                <div className="mb-2">
                                    {activity.inProgress.crossword.title} · {inProgressPercent}% הושלם
                                </div>
                                <div className="continue-card-progress mb-3">
                                    <div className="continue-card-progress-fill" style={{ width: `${inProgressPercent}%` }}></div>
                                </div>
                                <Link className="btn btn-primary btn-sm" to={`/crossword/${activity.inProgress.crosswordId}`}>
                                    <i className="bi bi-arrow-left ms-1"></i>
                                    להמשיך לפתור
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="row mb-4">
                <div className="col-12">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="חיפוש תשבץ לפי שם..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">טוען...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredCrosswords.map((crossword, i) => (
                        <Fragment key={crossword._id}>
                            <div className="col-lg-4 col-md-6">
                                <CrosswordCard crossword={crossword} onDelete={handleDeleteCrossword} showVisibilityBadge={false} />
                            </div>
                            {i === 2 && (
                                <div className="col-lg-4 col-md-6">
                                    <CreateCard
                                        to="/create-crossword"
                                        title="יצירת תשבץ חדש"
                                        subtitle="בנייה פשוטה בכמה צעדים"
                                        buttonText="להתחיל"
                                    />
                                </div>
                            )}
                        </Fragment>
                    ))}
                    {filteredCrosswords.length > 0 && filteredCrosswords.length < 3 && (
                        <div className="col-lg-4 col-md-6">
                            <CreateCard
                                to="/create-crossword"
                                title="יצירת תשבץ חדש"
                                subtitle="בנייה פשוטה בכמה צעדים"
                                buttonText="להתחיל"
                            />
                        </div>
                    )}
                    {filteredCrosswords.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-puzzle fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו תשבצים</h4>
                                <p>נסה לשנות את החיפוש או חזור מאוחר יותר</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Home
