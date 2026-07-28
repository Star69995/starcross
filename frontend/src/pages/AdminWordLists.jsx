import { useState, useCallback } from 'react'
import WordListCard from '../components/cards/WordListCard'
import PageHeader from '../components/layout/PageHeader'
import AdminNav from '../components/layout/AdminNav'
import SearchInput from '../components/forms/SearchInput'
import { getAllWordLists } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'

const AdminWordLists = () => {
    const [searchTerm, setSearchTerm] = useState('')

    const fetchWordLists = useCallback(async () => {
        try {
            return await getAllWordLists()
        } catch (error) {
            console.error('Error fetching all word lists:', error)
            return []
        }
    }, [])

    const { data, loading, setData: setWordLists } = useAsyncData(fetchWordLists)
    const wordLists = data || []

    const filteredWordLists = wordLists.filter(list =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteWordList = (id) => {
        setWordLists(prev => (prev || []).filter(list => list._id !== id))
    }

    return (
        <div className="container py-4">
            <PageHeader title="ניהול רשימות מילים" subtitle="כל רשימות המילים במערכת, ציבוריות ופרטיות" />
            <AdminNav />

            <div className="row mb-4 g-2">
                <div className="col-md-8">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חפש רשימות מילים..."
                    />
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
                    {filteredWordLists.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-list-ul fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו רשימות מילים</h4>
                            </div>
                        </div>
                    ) : (
                        filteredWordLists.map(wordList => (
                            <div key={wordList._id} className="col-lg-4 col-md-6">
                                <WordListCard wordList={wordList} onDelete={handleDeleteWordList} showVisibilityBadge={true} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminWordLists
