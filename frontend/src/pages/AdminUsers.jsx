import { useState, useCallback } from 'react'
import PageHeader from '../components/layout/PageHeader'
import AdminNav from '../components/layout/AdminNav'
import SearchInput from '../components/forms/SearchInput'
import Avatar from '../components/layout/Avatar'
import { getAllUsers, updateUserRole, deleteUserCascade } from '../services/api'
import { useAuth } from '../providers/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { isAdmin } from '../utils/permissions'
import { toast } from 'react-toastify'

const AdminUsers = () => {
    const { user: currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')

    const fetchUsers = useCallback(() => getAllUsers(), [])
    const { data, loading, setData: setUsers } = useAsyncData(fetchUsers)
    const users = data || []

    // So the panel can never demote/delete its way down to zero admins - that
    // would require a manual Firebase Console fix to recover from, same as
    // bootstrapping the very first admin.
    const adminCount = users.filter(isAdmin).length

    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleRole = async (targetUser) => {
        const nextRole = isAdmin(targetUser) ? 'user' : 'admin'
        try {
            await updateUserRole(targetUser._id, nextRole)
            setUsers(prev => (prev || []).map(u => u._id === targetUser._id ? { ...u, role: nextRole } : u))
            toast.success(nextRole === 'admin' ? 'המשתמש הפך למנהל' : 'הרשאת המנהל הוסרה')
        } catch (error) {
            console.error('Error updating user role:', error)
            toast.error('שגיאה בעדכון ההרשאה')
        }
    }

    const handleDelete = async (targetUser) => {
        if (!window.confirm(`האם למחוק את המשתמש "${targetUser.userName}" וכל התוכן שיצר? פעולה זו בלתי הפיכה.`)) {
            return
        }
        try {
            await deleteUserCascade(targetUser._id)
            setUsers(prev => (prev || []).filter(u => u._id !== targetUser._id))
            toast.success('המשתמש נמחק בהצלחה')
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('שגיאה במחיקת המשתמש')
        }
    }

    return (
        <div className="container py-4">
            <PageHeader title="ניהול משתמשים" subtitle="עדכון הרשאות ומחיקת משתמשים" />
            <AdminNav />

            <div className="row mb-4 g-2">
                <div className="col-md-6">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חפש לפי שם או אימייל..."
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">טוען...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>משתמש</th>
                                <th>אימייל</th>
                                <th>הרשאה</th>
                                <th>נרשם בתאריך</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">לא נמצאו משתמשים</td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => {
                                    const isSelf = u._id === currentUser?._id
                                    const isLastAdmin = isAdmin(u) && adminCount <= 1
                                    const disableActions = isSelf || isLastAdmin

                                    let toggleTitle = isAdmin(u) ? 'הסרת הרשאת מנהל' : 'הפיכה למנהל'
                                    if (isSelf) toggleTitle = 'לא ניתן לשנות הרשאה לעצמך'
                                    else if (isLastAdmin) toggleTitle = 'לא ניתן להסיר את המנהל האחרון'

                                    let deleteTitle = 'מחיקת משתמש'
                                    if (isSelf) deleteTitle = 'לא ניתן למחוק את עצמך'
                                    else if (isLastAdmin) deleteTitle = 'לא ניתן למחוק את המנהל האחרון'

                                    return (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Avatar photoURL={u.photoURL} name={u.userName} size={32} />
                                                    <span>{u.userName}</span>
                                                </div>
                                            </td>
                                            <td dir="ltr" style={{ textAlign: 'right' }}>{u.email}</td>
                                            <td>
                                                {isAdmin(u)
                                                    ? <span className="badge bg-primary">מנהל</span>
                                                    : <span className="badge bg-secondary">משתמש</span>}
                                            </td>
                                            <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('he-IL') : '-'}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleToggleRole(u)}
                                                        disabled={disableActions}
                                                        title={toggleTitle}
                                                    >
                                                        <i className={`bi ${isAdmin(u) ? 'bi-shield-slash' : 'bi-shield-lock'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(u)}
                                                        disabled={disableActions}
                                                        title={deleteTitle}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
