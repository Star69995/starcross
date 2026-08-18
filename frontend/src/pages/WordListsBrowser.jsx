// pages/WordListsBrowser.jsx
import { useState, useCallback } from 'react'
import WordListCard from '../components/cards/WordListCard'
import CreateCard from '../components/cards/CreateCard'
import PageHeader from '../components/layout/PageHeader'
import SearchInput from '../components/forms/SearchInput'
import { getWordLists, getMyWordLists } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../providers/AuthContext'
import { toast } from 'react-toastify'

const FILTERS = [
    { key: 'all', label: 'הכל' },
    { key: 'mine', label: 'שלי' },
    { key: 'favorites', label: 'אהובות' },
]

const WordListsBrowser = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')

    const fetchWordLists = useCallback(async () => {
        try {
            if (filter === 'mine') {
                if (!user) return []
                return await getMyWordLists()
            }
            if (filter === 'favorites') {
                if (!user) return []
                const [publicLists, myLists] = await Promise.all([getWordLists(), getMyWordLists()])
                const uniqueMap = new Map()
                    ;[...publicLists, ...myLists].forEach(list => uniqueMap.set(list._id, list))
                return Array.from(uniqueMap.values()).filter(list => list.likes.includes(user._id))
            }
            return await getWordLists()
        } catch (error) {
            console.error('Error fetching word lists:', error)
            return []
        }
    }, [filter, user])

    const { data, loading, setData: setWordLists } = useAsyncData(fetchWordLists)
    const wordLists = data || []

    const filteredWordLists = wordLists.filter(list =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteWordList = (id) => {
        setWordLists(prev => (prev || []).filter(cw => cw._id !== id));
    };

    const handleFilterClick = (key) => {
        if (key !== 'all' && !user) {
            toast.info('כדי לצפות ברשימות שלך או באהובות צריך להתחבר תחילה')
            return
        }
        setFilter(key)
    }

    return (
        <div className="container py-4">
            <PageHeader
                title="רשימות מילים"
                subtitle="אוספי מילים והגדרות, מוכנים לבניית תשבץ חדש או לעיון חופשי"
            />

            <div className="row mb-4 g-2">
                <div className="col-md-8">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חפש רשימות מילים..."
                    />
                </div>
                <div className="col-md-4">
                    <div className="filter-pills justify-content-md-end">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                type="button"
                                className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                                onClick={() => handleFilterClick(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
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
                    {filteredWordLists.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-list-ul fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו רשימות מילים</h4>
                                <p>נסה לשנות את החיפוש או הפילטר</p>
                            </div>
                        </div>
                    )}
                    {filteredWordLists.map(wordList => (
                        <div key={wordList._id} className="col-lg-4 col-md-6">
                            <WordListCard wordList={wordList} onDelete={handleDeleteWordList} showVisibilityBadge={filter !== 'all'} />
                        </div>
                    ))}
                    {filter === 'all' && (
                        <div className={`col-lg-4 col-md-6 ${filteredWordLists.length === 0 ? 'mx-auto' : ''}`}>
                            <CreateCard
                                to="/create-wordlist"
                                title="יצירת רשימת מילים"
                                subtitle="אפשר להתחיל מריק או מקובץ"
                                buttonText="להתחיל"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WordListsBrowser
