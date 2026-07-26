// pages/Home.jsx
import { useCallback } from 'react'
import CrosswordCard from '../components/cards/CrosswordCard'
import { getCrosswords, getMyCrosswords } from '../services/api'
import { useAuth } from '../providers/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'

const FavoriteCrosswords = () => {
    const { user, loading: authLoading } = useAuth()

    const fetchCrosswords = useCallback(async () => {
        if (!user) {
            return []
        }
        try {
            const publicCrosswords = await getCrosswords();
            const myCrosswords = await getMyCrosswords();

            // Use Map to remove duplicates efficiently
            const uniqueMap = new Map();

            // Add all lists to the map (duplicates will be overwritten)
            [...publicCrosswords, ...myCrosswords].forEach(list => {
                uniqueMap.set(list._id, list);
            });

            // Convert back to array and filter for liked items only
            const allCrosswords = Array.from(uniqueMap.values());
            return allCrosswords.filter(crossword =>
                crossword.likes.includes(user._id)
            );
        } catch (error) {
            console.error('Error fetching crosswords:', error);
            return []; // Fallback to empty array on error
        }
    }, [user]);

    const { data, loading, setData: setCrosswords } = useAsyncData(fetchCrosswords, { enabled: !authLoading })
    const crosswords = data || []

    const handleDeleteCrossword = (id) => {
        setCrosswords(prev => (prev || []).filter(cw => cw._id !== id));
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="display-4">תשבצים אהובים</h1>
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
                    {crosswords.map(crossword => (
                        <div key={crossword._id} className="col-lg-4 col-md-6">
                            <CrosswordCard crossword={crossword} onDelete={handleDeleteCrossword} />
                        </div>
                    ))}
                    {crosswords.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-puzzle fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו תשבצים</h4>
                                <p>נסה לשנות את הפילטר או חזור מאוחר יותר</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FavoriteCrosswords