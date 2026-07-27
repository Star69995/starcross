// pages/Profile.jsx
import { useState, useCallback } from 'react'
import { useAuth } from '../providers/AuthContext'
import { auth } from '../services/firebase'
import { updateProfile, changePassword, getCrosswords, getMyCrosswords, getMyWordLists } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'
import Avatar from '../components/layout/Avatar'

// Milestones are just thresholds checked against the real counts below - not a
// separate achievements system, so nothing here is invented/fake data.
const CROSSWORD_MILESTONES = [10, 50, 100]
const CREATED_MILESTONES = [5, 20]

const Profile = () => {
    const { user, updateUser } = useAuth()
    const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password')

    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const fetchStats = useCallback(async () => {
        if (!user) return { solvedCount: 0, createdCrosswords: 0, createdWordLists: 0 }
        try {
            const [publicCrosswords, myCrosswords, myWordLists] = await Promise.all([
                getCrosswords(),
                getMyCrosswords(),
                getMyWordLists(),
            ])
            const uniqueMap = new Map()
                ;[...publicCrosswords, ...myCrosswords].forEach(cw => uniqueMap.set(cw._id, cw))
            const solvedCount = Array.from(uniqueMap.values())
                .filter(cw => cw.solved?.includes(user._id)).length
            return {
                solvedCount,
                createdCrosswords: myCrosswords.length,
                createdWordLists: myWordLists.length,
            }
        } catch (error) {
            console.error('Error loading profile stats:', error)
            return { solvedCount: 0, createdCrosswords: 0, createdWordLists: 0 }
        }
    }, [user])

    const { data: stats } = useAsyncData(fetchStats, { enabled: Boolean(user) })
    const { solvedCount = 0, createdCrosswords = 0, createdWordLists = 0 } = stats || {}

    const [profileData, setProfileData] = useState({
        userName: user?.userName || '',
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const updatedUser = await updateProfile(user._id, profileData)
            updateUser(updatedUser)
            setMessage('הפרופיל עודכן בהצלחה')
        } catch (error) {
            console.log('error: ', error);
            setError('שגיאה בעדכון הפרופיל')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('הסיסמאות אינן תואמות')
            setLoading(false)
            return
        }

        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword)
            setMessage('הסיסמה שונתה בהצלחה')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            console.log('error: ', error);
            setError('שגיאה בשינוי הסיסמה')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-4">
            <div className="grid-row justify-center">
                <div className="col-8-lg">
                    <div className="panel shadow profile-cover-motif mb-3">
                        <div className="panel-header bg-accent text-white border-0">
                            <div className="flex items-center">
                                <span className="ml-3 shrink-0">
                                    <Avatar photoURL={user?.photoURL} name={user?.userName} size={56} />
                                </span>
                                <div className="text-truncate">
                                    <h2 className="panel-title mb-0 text-truncate">{user?.userName}</h2>
                                    <small className="opacity-75 block text-truncate" dir="ltr" style={{ textAlign: 'right' }}>{user?.email}</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats-row mb-3">
                        <div className="profile-stat-card">
                            <i className="bi bi-collection"></i>
                            <strong>{createdWordLists}</strong>
                            <span>רשימות נוצרו</span>
                        </div>
                        <div className="profile-stat-card">
                            <i className="bi bi-puzzle-fill"></i>
                            <strong>{createdCrosswords}</strong>
                            <span>תשבצים נוצרו</span>
                        </div>
                        <div className="profile-stat-card">
                            <i className="bi bi-check2-circle"></i>
                            <strong>{solvedCount}</strong>
                            <span>תשבצים נפתרו</span>
                        </div>
                    </div>

                    <div className="mb-3">
                        <h6 className="text-muted mb-2">הישגים</h6>
                        <div className="profile-badges-row">
                            {CROSSWORD_MILESTONES.map(n => (
                                <div key={`solved-${n}`} className={`profile-badge ${solvedCount >= n ? '' : 'locked'}`}>
                                    <div className="profile-badge-circle">
                                        <i className={`bi ${solvedCount >= n ? 'bi-trophy-fill' : 'bi-lock-fill'}`}></i>
                                    </div>
                                    <span>{n} תשבצים נפתרו</span>
                                </div>
                            ))}
                            {CREATED_MILESTONES.map(n => (
                                <div key={`created-${n}`} className={`profile-badge ${createdCrosswords >= n ? '' : 'locked'}`}>
                                    <div className="profile-badge-circle">
                                        <i className={`bi ${createdCrosswords >= n ? 'bi-pencil-fill' : 'bi-lock-fill'}`}></i>
                                    </div>
                                    <span>{n} תשבצים נוצרו</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="filter-pills">
                            <button
                                type="button"
                                className={`filter-pill ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                פרטים אישיים
                            </button>
                            {hasPasswordProvider && (
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'password' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    שינוי סיסמה
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="panel shadow">
                        <div className="panel-body p-0">
                            <div className="p-3 p-4-md">
                                {message && (
                                    <div className="banner banner-success" role="alert">
                                        {message}
                                    </div>
                                )}
                                {error && (
                                    <div className="banner banner-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="userName" className="field-label">שם משתמש</label>
                                            <input
                                                type="text"
                                                className="field-input"
                                                id="userName"
                                                value={profileData.userName}
                                                onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="button button-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="loader loader-sm ml-2"></span>
                                                    שומר...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle ml-2"></i>
                                                    שמור שינויים
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}

                                {activeTab === 'password' && hasPasswordProvider && (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="currentPassword" className="field-label">סיסמה נוכחית</label>
                                            <input
                                                type="password"
                                                className="field-input"
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="field-label">סיסמה חדשה</label>
                                            <input
                                                type="password"
                                                className="field-input"
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                minLength="6"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="confirmPassword" className="field-label">אישור סיסמה חדשה</label>
                                            <input
                                                type="password"
                                                className="field-input"
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="button button-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="loader loader-sm ml-2"></span>
                                                    משנה...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-shield-check ml-2"></i>
                                                    שנה סיסמה
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
