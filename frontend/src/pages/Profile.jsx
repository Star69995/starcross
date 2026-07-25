// pages/Profile.jsx
import { useState } from 'react'
import { useAuth } from '../providers/AuthContext'
import { auth } from '../services/firebase'
import { updateProfile, changePassword } from '../services/api'

const Profile = () => {
    const { user, updateUser } = useAuth()
    const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password')

    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

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
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex align-items-center">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.userName}
                                        referrerPolicy="no-referrer"
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                        className="ms-3 flex-shrink-0"
                                    />
                                ) : (
                                    <i className="bi bi-person-circle fs-3 ms-3"></i>
                                )}
                                <div className="text-truncate">
                                    <h2 className="card-title mb-0 text-truncate">{user?.userName}</h2>
                                    <small className="opacity-75">{user?.email}</small>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            <ul className="nav nav-tabs flex-column flex-sm-row" role="tablist">
                                <li className="nav-item flex-fill text-center" role="presentation">
                                    <button
                                        className={`nav-link w-100 ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        פרטים אישיים
                                    </button>
                                </li>
                                {hasPasswordProvider && (
                                    <li className="nav-item flex-fill text-center" role="presentation">
                                        <button
                                            className={`nav-link w-100 ${activeTab === 'password' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('password')}
                                        >
                                            שינוי סיסמה
                                        </button>
                                    </li>
                                )}
                            </ul>

                            <div className="p-3 p-md-4">
                                {message && (
                                    <div className="alert alert-success" role="alert">
                                        {message}
                                    </div>
                                )}
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="userName" className="form-label">שם משתמש</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="userName"
                                                value={profileData.userName}
                                                onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 w-sm-auto"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm ms-2"></span>
                                                    שומר...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle ms-2"></i>
                                                    שמור שינויים
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}

                                {activeTab === 'password' && hasPasswordProvider && (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="currentPassword" className="form-label">סיסמה נוכחית</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="newPassword" className="form-label">סיסמה חדשה</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                minLength="6"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="confirmPassword" className="form-label">אישור סיסמה חדשה</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 w-sm-auto"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm ms-2"></span>
                                                    משנה...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-shield-check ms-2"></i>
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
