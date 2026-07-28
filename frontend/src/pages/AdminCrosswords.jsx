import { useState, useCallback } from 'react'
import CrosswordCard from '../components/cards/CrosswordCard'
import PageHeader from '../components/layout/PageHeader'
import AdminNav from '../components/layout/AdminNav'
import SearchInput from '../components/forms/SearchInput'
import { getAllCrosswords } from '../services/api'
import { useAsyncData } from '../hooks/useAsyncData'

const AdminCrosswords = () => {
    const [searchTerm, setSearchTerm] = useState('')

    const fetchCrosswords = useCallback(async () => {
        try {
            return await getAllCrosswords()
        } catch (error) {
            console.error('Error fetching all crosswords:', error)
            return []
        }
    }, [])

    const { data, loading, setData: setCrosswords } = useAsyncData(fetchCrosswords)
    const crosswords = data || []

    const filteredCrosswords = crosswords.filter(cw =>
        cw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cw.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteCrossword = (id) => {
        setCrosswords(prev => (prev || []).filter(cw => cw._id !== id))
    }

    return (
        <div className="container py-4">
            <PageHeader title="ניהול תשבצים" subtitle="כל התשבצים במערכת, ציבוריים ופרטיים" />
            <AdminNav />

            <div className="row mb-4 g-2">
                <div className="col-md-8">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="חיפוש תשבץ לפי שם..."
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
                    {filteredCrosswords.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted">
                                <i className="bi bi-puzzle fs-1 d-block mb-3"></i>
                                <h4>לא נמצאו תשבצים</h4>
                            </div>
                        </div>
                    ) : (
                        filteredCrosswords.map(crossword => (
                            <div key={crossword._id} className="col-lg-4 col-md-6">
                                <CrosswordCard crossword={crossword} onDelete={handleDeleteCrossword} showVisibilityBadge={true} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminCrosswords
