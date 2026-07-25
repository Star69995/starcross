// pages/MyWordLists.jsx
import { useState, useEffect } from 'react'
import WordListCard from '../components/cards/WordListCard'
import { useAuth } from '../providers/AuthContext'
import { getMyWordLists, getWordLists } from '../services/api'

const FavoriteWordLists = () => {
    const { user, loading: authLoading } = useAuth()
    const [wordLists, setWordLists] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')

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

        fetchWordLists()
    }, [user, authLoading, sortBy]) // Add all dependencies

    const fetchWordLists = async () => {
        try {
            setLoading(true)

            const publicWordlists = await getWordLists();
            const MyWordLists = await getMyWordLists();

            // Use Map to remove duplicates efficiently
            const uniqueMap = new Map();

            // Add all lists to the map (duplicates will be overwritten)
            [...publicWordlists, ...MyWordLists].forEach(list => {
                uniqueMap.set(list._id, list);
            });

            // Convert back to array and filter for liked items only
            const allCrosswords = Array.from(uniqueMap.values());
            const likedCrosswords = allCrosswords.filter(crossword =>
                crossword.likes.includes(user._id)
            );

            setWordLists(likedCrosswords);
        } catch (error) {
            console.error('Error fetching word lists:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredWordLists = wordLists.filter(list =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteWordList = (id) => {
        setWordLists(prev => prev.filter(cw => cw._id !== id));
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="display-4 text-primary"> רשימות מילים אהובות</h1>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="חפש רשימות מילים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">החדשות ביותר</option>
                        <option value="oldest">הישנות ביותר</option>
                        <option value="most_liked">הכי אהובות</option>
                        <option value="name">לפי שם</option>
                    </select>
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
                            <WordListCard wordList={wordList} onDelete={handleDeleteWordList} />
                        </div>
                    ))}
                    {filteredWordLists.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-list-ul fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו רשימות מילים</h4>
                                <p>נסה לשנות את החיפוש או הפילטר</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FavoriteWordLists