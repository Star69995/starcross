// pages/CrosswordSolver.jsx
import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Crossword from '../components/board/Crossword'
import { getCrosswordById, deleteCrossword, toggleLikeCrossword } from '../services/api'
import { useCrossword } from '../providers/CrosswordContext'
import ActionButtons from '../components/cards/ActionButtons'
import { useAuth } from '../providers/AuthContext'
import { toast } from 'react-toastify'
import { useAsyncData } from '../hooks/useAsyncData'

const CrosswordSolver = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { setGridData } = useCrossword()
    const { user, loading: authLoading } = useAuth()

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

    useEffect(() => {
        if (crossword) {
            setGridData(crossword.crosswordObject.gridData)
        }
    }, [crossword, setGridData])

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
                            <i className="bi bi-arrow-right ms-2"></i>
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