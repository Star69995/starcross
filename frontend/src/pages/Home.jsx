// pages/Home.jsx
import { useCallback } from 'react'
import CrosswordCard from '../components/cards/CrosswordCard'
import { getCrosswords } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'

const Home = () => {
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

    const handleDeleteCrossword = (id) => {
        setCrosswords(prev => (prev || []).filter(cw => cw._id !== id));
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="display-4 text-primary">תשבצים פומביים</h1>
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

export default Home