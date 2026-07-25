import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWordListById, deleteWordList, toggleLikeWordList } from "../services/api";
import { useAuth } from "../providers/AuthContext";
import ActionButtons from "../components/cards/ActionButtons";
import { toast } from "react-toastify";

const WordListView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [wordList, setWordList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        const fetchWordList = async () => {
            try {
                const wl = await getWordListById(id);
                setWordList(wl);
                setIsLiked(wl.likes.includes(user?._id));
            } catch (error) {
                console.log('error: ', error);
                setLoadError("שגיאה בטעינת הרשימה");
            } finally {
                setLoading(false);
            }
        };
        fetchWordList();
    }, [id, user, authLoading]);

    if (loading) return <div>טוען...</div>;
    if (loadError) return <div className="alert alert-danger">{loadError}</div>;
    if (!wordList) return <div>לא נמצאה רשימה</div>;

    // הרשאת עריכה
    const canEdit =
        user && (user._id === wordList.creator._id); // תמיכה גם במקרים בהם creator הוא רק id

    const handleLike = async () => {
        if (!user) {
            toast.info("כדי לעשות לייק על רשימת מילים צריך להתחבר תחילה")
            return false;
        }
        try {
            await toggleLikeWordList(wordList._id)
            setIsLiked(!isLiked)
            return true;
        } catch (error) {
            console.error('Error liking word list:', error)
            toast.error('שגיאה בעדכון לייק');
            return false;
        }
    }

    const handleDelete = async () => {
        try {
            await deleteWordList(wordList._id)
            navigate('/my-wordlists')
            toast.success('נמחק בהצלחה');
        } catch (error) {
            console.error('Error deleting crossword:', error)
            toast.error('שגיאה במחיקה');
        }
    }

    const handleEdit = async () => {
        try {
            await navigate(`/edit-wordlist/${wordList._id}`)
        } catch (error) {
            console.error('Error editing crossword:', error)
        }
        
    }
    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h2 className="card-title mb-0">{wordList.title}</h2>
                            <div className="small">
                                יוצר: {wordList.creator?.userName || "לא ידוע"} |{" "}
                                {new Date(wordList.createdAt).toLocaleDateString("he-IL")}
                                {wordList.isPublic && <span className="badge bg-light text-dark me-2">ציבורית</span>}
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="mb-0">{wordList.description}</p>
                                <ActionButtons
                                    isLiked={isLiked}
                                    canEdit={canEdit}
                                    canDelete={canEdit}
                                    onEdit={() => handleEdit(wordList._id)}
                                    handleLike={handleLike}
                                    likeLoadingInternal={false}
                                    handleDelete={handleDelete}
                                />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "20%" }}>מילה</th>
                                            <th>הגדרה</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(wordList.words || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center text-muted">
                                                    אין מילים ברשימה זו
                                                </td>
                                            </tr>
                                        ) : (
                                            wordList.words.map((word, idx) => (
                                                <tr key={word._id || idx}>
                                                    <td className="fw-bold">{word.solution}</td>
                                                    <td>{word.definition || "-"}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="text-end text-muted small">
                                    {wordList.words?.length || 0} מילים
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordListView;