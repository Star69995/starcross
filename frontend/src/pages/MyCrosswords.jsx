import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import CrosswordCard from '../components/cards/CrosswordCard'
import PageHeader from '../components/layout/PageHeader'
import { getMyCrosswords } from '../services/api'
import { useAuth } from '../providers/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'

const MyCrosswords = () => {
    const [filter, setFilter] = useState('all')
    const { user, loading: authLoading } = useAuth()

    const fetchMyCrosswords = useCallback(async () => {
        if (!user) {
            return []
        }
        try {
            const data = await getMyCrosswords();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching crosswords:', error);
            return [];
        }
    }, [user]);

    const { data, loading, setData: setCrosswords, refetch: fetchCrosswords } = useAsyncData(fetchMyCrosswords, { enabled: !authLoading })
    const crosswords = data || []

    const handleDelete = async (id) => {
        setCrosswords(prev => (prev || []).filter(cw => cw._id !== id));
    }


    const filteredCrosswords = crosswords.filter(crossword => {
        if (filter === 'public') return crossword.isPublic
        if (filter === 'private') return !crossword.isPublic
        if (filter !== 'all') return crossword.difficulty === filter
        return true
    })

    return (
        <div className="container py-4">
            <PageHeader
                title="התשבצים שלי"
                action={(
                    <Link to="/create-crossword" className="button button-primary">
                        <i className="bi bi-plus-circle ml-2"></i>
                        תשבץ חדש
                    </Link>
                )}
            />

            <div className="grid-row mb-4">
                <div className="col-8-md">
                    <div className="button-group" role="group">
                        <input type="radio" className="button-toggle-input" name="filter" id="all-crosswords"
                            checked={filter === 'all'} onChange={() => setFilter('all')} />
                        <label className="button button-outline" htmlFor="all-crosswords">הכל</label>

                        <input type="radio" className="button-toggle-input" name="filter" id="public-crosswords"
                            checked={filter === 'public'} onChange={() => setFilter('public')} />
                        <label className="button button-outline" htmlFor="public-crosswords">ציבוריים</label>

                        <input type="radio" className="button-toggle-input" name="filter" id="private-crosswords"
                            checked={filter === 'private'} onChange={() => setFilter('private')} />
                        <label className="button button-outline" htmlFor="private-crosswords">פרטיים</label>
                    </div>
                </div>
                <div className="col-4-md text-end-md">
                    <div className="text-muted">
                        <i className="bi bi-puzzle ml-1"></i>
                        {filteredCrosswords.length} תשבצים
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="loader text-accent" role="status">
                        <span className="visually-hidden">טוען...</span>
                    </div>
                </div>
            ) : (
                <div className="grid-row grid-row-gap-4">
                    {Array.isArray(filteredCrosswords) && filteredCrosswords.length > 0 ? (
                        filteredCrosswords.map(crossword => (
                            <div key={crossword._id} className="col-4-lg col-6-md">
                                <CrosswordCard
                                    crossword={crossword}
                                    showActions={true}
                                    onUpdate={fetchCrosswords}
                                    onDelete={() => handleDelete(crossword._id)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-puzzle text-size-1 block mb-3"></i>
                                <h4>אין לך עדיין תשבצים</h4>
                                <p>התחל ליצור את התשבץ הראשון שלך</p>
                                <Link to="/create-crossword" className="button button-primary">
                                    <i className="bi bi-plus-circle ml-2"></i>
                                    צור תשבץ חדש
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MyCrosswords