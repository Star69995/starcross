import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WordListForm from '../components/forms/wordlists/WordListForm';
import { updateWordList, getWordListById } from '../services/api';
import { toast } from 'react-toastify';

// Loads directly from the route parameter
const WordListEditor = () => {
    const { id } = useParams(); // from /edit-crossword/:id
    const navigate = useNavigate();

    const [wordList, setWordList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const fetchWordList = async () => {
            try {
                const data = await getWordListById(id);
                setWordList(data);
            } catch (error) {
                console.log('error: ', error);
                setLoadError("שגיאה בטעינת רשימת המילים");
            } finally {
                setLoading(false);
            }
        };
        fetchWordList();
    }, [id]);

    const handleUpdateWordList = async (formData) => {
        try {
            // Usually you need to send the id along with the data (check your API expectation)
            await updateWordList(id, formData);
            navigate(`/wordList/${id}`);
            toast.success('רשימת המילים עודכנה בהצלחה');
        } catch (error) {
            console.log('error: ', error);
            // Optionally: handle/save an update error to show in the form
            toast.error('שגיאה בעדכון רשימת המילים');
        }
    };

    if (loading) {
        return <div>טוען...</div>;
    }
    if (loadError) {
        return <div className="alert alert-danger">{loadError}</div>;
    }

    return (
        <WordListForm
            initialData={wordList}
            onSubmit={handleUpdateWordList}
        />
    );
};

export default WordListEditor;