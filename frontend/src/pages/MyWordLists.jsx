// pages/MyWordLists.jsx
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import WordListCard from '../components/cards/WordListCard'
import { getMyWordLists } from '../services/api'
import { useAuth } from '../providers/AuthContext'
import { useAsyncData } from '../hooks/useAsyncData'

const MyWordLists = () => {
    const { user, loading: authLoading } = useAuth()
    const [filter, setFilter] = useState('all')

    const fetchWordLists = useCallback(async () => {
        if (!user) {
            return []
        }
        try {
            return await getMyWordLists()
        } catch (error) {
            console.error('Error fetching word lists:', error)
            return []
        }
    }, [user])

    const { data, loading, setData: setWordLists } = useAsyncData(fetchWordLists, { enabled: !authLoading })
    const wordLists = data || []

    const filteredWordLists = wordLists.filter(list => {
        if (filter === 'public') return list.isPublic
        if (filter === 'private') return !list.isPublic
        return true
    })

    const handleDeleteWordList = async (id) => {
        setWordLists(prev => (prev || []).filter(cw => cw._id !== id));
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="display-4 text-primary">רשימות המילים שלי</h1>
                        <Link to="/create-wordlist" className="btn btn-primary">
                            <i className="bi bi-plus-circle ms-2"></i>
                            רשימה חדשה
                        </Link>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="btn-group" role="group">
                        <input type="radio" className="btn-check" name="filter" id="all-lists"
                            checked={filter === 'all'} onChange={() => setFilter('all')} />
                        <label className="btn btn-outline-primary" htmlFor="all-lists">הכל</label>

                        <input type="radio" className="btn-check" name="filter" id="public-lists"
                            checked={filter === 'public'} onChange={() => setFilter('public')} />
                        <label className="btn btn-outline-primary" htmlFor="public-lists">ציבוריות</label>

                        <input type="radio" className="btn-check" name="filter" id="private-lists"
                            checked={filter === 'private'} onChange={() => setFilter('private')} />
                        <label className="btn btn-outline-primary" htmlFor="private-lists">פרטיות</label>
                    </div>
                </div>
                <div className="col-md-6 text-md-end">
                    <div className="text-muted">
                        <i className="bi bi-list-ul ms-1"></i>
                        {filteredWordLists.length} רשימות
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
                    {filteredWordLists.map(wordList => (
                        <div key={wordList._id} className="col-lg-4 col-md-6">
                            <WordListCard wordList={wordList} onDelete={handleDeleteWordList}/>
                        </div>
                    ))}
                    {filteredWordLists.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-list-ul fs-1 d-block mb-3"></i>
                                <h4>אין לך עדיין רשימות מילים</h4>
                                <p>התחל ליצור את הרשימה הראשונה שלך</p>
                                <Link to="/create-wordlist" className="btn btn-primary">
                                    <i className="bi bi-plus-circle ms-2"></i>
                                    צור רשימה חדשה
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MyWordLists