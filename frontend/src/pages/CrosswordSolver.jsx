// pages/CrosswordSolver.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Crossword from '../components/board/Crossword'
import { getCrosswordById, deleteCrossword, toggleLikeCrossword } from '../services/api'
import { useCrossword } from '../providers/CrosswordContext'
import ActionButtons from '../components/cards/ActionButtons'
import { useAuth } from '../providers/AuthContext'
import { toast } from 'react-toastify'

const CrosswordSolver = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [crossword, setCrossword] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { setGridData } = useCrossword()
    const { user, loading: authLoading } = useAuth()
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        fetchCrossword()
    }, [id, user, authLoading])

    const fetchCrossword = async () => {
        try {
            setLoading(true)
            const data = await getCrosswordById(id)
            setCrossword(data)
            setIsLiked(data.likes.includes(user?._id))
            setGridData(data.crosswordObject.gridData)
        } catch (error) {
            setError('שגיאה בטעינת התשבץ')
            console.error('Error fetching crossword:', error)
        } finally {
            setLoading(false)
        }
    }

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

    const handleLike = async (id) => {
        if (!user) {
            toast.info("כדי לעשות לייק על תשבץ צריך להתחבר תחילה")
            return false;
        }
        try {
            await toggleLikeCrossword(id)
            setIsLiked(!isLiked);
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
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-5 text-primary">{crossword.title}</h1>
                            {crossword.description && (
                                <p className="text-muted">{crossword.description}</p>
                            )}
                        </div>
                        <ActionButtons
                            isLiked={isLiked}
                            canEdit={crossword.creator._id === user?._id}
                            canDelete={crossword.creator._id === user?._id}
                            onEdit={handleEdit}
                            handleLike={handleLike}
                            handleDelete={handleDelete}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-arrow-right me-2"></i>
                            חזור
                        </button>

                    </div>
                </div>
            </div>

            {/* Pass the crossword data to your existing Crossword component */}
            <Crossword crosswordData={crossword} />
        </div>
    )
}

export default CrosswordSolver