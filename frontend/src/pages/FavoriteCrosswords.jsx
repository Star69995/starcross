// pages/Home.jsx
import { useState, useEffect } from 'react'
import CrosswordCard from '../components/cards/CrosswordCard'
import { getCrosswords, getMyCrosswords } from '../services/api'
import { useAuth } from '../providers/AuthContext'

const FavoriteCrosswords = () => {
    const { user, loading: authLoading } = useAuth()
    const [crosswords, setCrosswords] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        // If no user after auth loaded, don't fetch
        if (!user) {
            setLoading(false);
            return;
        }

        fetchCrosswords()
    }, [user, authLoading]) // Add all dependencies

    const fetchCrosswords = async () => {
        try {
            setLoading(true);
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
            const likedCrosswords = allCrosswords.filter(crossword =>
                crossword.likes.includes(user._id)
            );

            setCrosswords(likedCrosswords);
        } catch (error) {
            console.error('Error fetching crosswords:', error);
            setCrosswords([]); // Fallback to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCrossword = (id) => {
        setCrosswords(prev => prev.filter(cw => cw._id !== id));
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="display-4 text-primary">תשבצים אהובים</h1>
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