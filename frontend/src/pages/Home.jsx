// pages/Home.jsx
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import CrosswordCard from '../components/cards/CrosswordCard'
import CreateCard from '../components/cards/CreateCard'
import PageHeader from '../components/layout/PageHeader'
import SearchInput from '../components/forms/SearchInput'
import { getCrosswords, getMyCrosswords, getInProgressCrossword, getRecentSolves, getSolvedCount } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../providers/AuthContext'
import { percentComplete } from '../utils/gridProgress'
import { formatRelativeDate } from '../utils/relativeDate'

const FILTERS = [
    { key: 'all', label: 'הכל' },
    { key: 'mine', label: 'שלי' },
    { key: 'favorites', label: 'אהובות' },
]

const Home = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')

    const fetchCrosswords = useCallback(async () => {
        try {
            if (filter === 'mine') {
                if (!user) return []
                return await getMyCrosswords()
            }
            if (filter === 'favorites') {
                if (!user) return []
                const [publicCrosswords, myCrosswords] = await Promise.all([getCrosswords(), getMyCrosswords()])
                const uniqueMap = new Map()
                    ;[...publicCrosswords, ...myCrosswords].forEach(cw => uniqueMap.set(cw._id, cw))
                return Array.from(uniqueMap.values()).filter(cw => cw.likes.includes(user._id))
            }
            return await getCrosswords()
        } catch (error) {
            console.error('Error fetching crosswords:', error);
            return []; // Fallback to empty array on error
        }
    }, [filter, user]);

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

    const handleFilterClick = (key) => {
        if (key !== 'all' && !user) {
            toast.info('כדי לצפות בתשבצים שלך או באהובים צריך להתחבר תחילה')
            return
        }
        setFilter(key)
    }

    const hasActivity = user && activity && (activity.inProgress || activity.recentSolves.length > 0 || activity.solvedCount > 0)

    return (
        <div className="container py-4">
            <PageHeader
                title="תשבצים"
                subtitle="יש תשבץ אחד באמצע פתירה, ואפשר להמשיך להתקדם בדיוק מאיפה שהפסקת"
            />

            {hasActivity && (
                <div className="row g-3 mb-4">
                    <div className="col-lg-5">
                        <div className="card content-card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <span className="content-card-icon">
                                        <i className="bi bi-check2-circle"></i>
                                    </span>
                                    <div>
                                        <strong className="fs-4 d-block lh-1">{activity.solvedCount}</strong>
                                        <span className="text-muted small">תשבצים נפתרו עד כה</span>
                                    </div>
                                </div>
                                {activity.recentSolves.length > 0 && (
                                    <ul className="list-unstyled mb-0 small content-card-footer">
                                        {activity.recentSolves.map(solve => (
                                            <li key={solve.crosswordId} className="d-flex align-items-center gap-2 py-1">
                                                <i className="bi bi-check-circle-fill text-success"></i>
                                                <span className="text-truncate flex-grow-1" style={{ minWidth: 0 }}>{solve.crossword.title}</span>
                                                <span className="text-muted text-nowrap">{formatRelativeDate(solve.updatedAt)}</span>
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

            <div className="row mb-4 g-2">
                <div className="col-md-8">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חיפוש תשבץ לפי שם..."
                    />
                </div>
                <div className="col-md-4">
                    <div className="filter-pills justify-content-md-end">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                type="button"
                                className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                                onClick={() => handleFilterClick(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
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
                    {filteredCrosswords.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-puzzle fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו תשבצים</h4>
                                <p>נסה לשנות את החיפוש או חזור מאוחר יותר</p>
                            </div>
                        </div>
                    )}
                    {filteredCrosswords.map(crossword => (
                        <div key={crossword._id} className="col-lg-4 col-md-6">
                            <CrosswordCard crossword={crossword} onDelete={handleDeleteCrossword} showVisibilityBadge={filter !== 'all'} />
                        </div>
                    ))}
                    {filter === 'all' && (
                        <div className={`col-lg-4 col-md-6 ${filteredCrosswords.length === 0 ? 'mx-auto' : ''}`}>
                            <CreateCard
                                to="/create-crossword"
                                title="יצירת תשבץ חדש"
                                subtitle="בנייה פשוטה בכמה צעדים"
                                buttonText="להתחיל"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Home
