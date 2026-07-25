import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CrosswordForm from '../components/forms/crosswords/CrosswordForm';
import { updateCrossword, getCrosswordById } from '../services/api';
import { toast } from 'react-toastify';
// Loads directly from the route parameter
const CrosswordEditor = () => {
    const { id } = useParams(); // from /edit-crossword/:id
    const navigate = useNavigate();

    const [crossword, setCrossword] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const fetchCrossword = async () => {
            try {
                const data = await getCrosswordById(id);
                setCrossword(data);
            } catch (error) {
                console.log('error: ', error);
                setLoadError("שגיאה בטעינת התשבץ");
            } finally {
                setLoading(false);
            }
        };
        fetchCrossword();
    }, [id]);

    const handleUpdateCrossword = async (formData) => {
        try {
            // Usually you need to send the id along with the data (check your API expectation)
            await updateCrossword(id, formData);
            navigate(`/crossword/${id}`);
            toast.success('התשבץ עודכן בהצלחה');
        } catch (error) {
            console.log('error: ', error);
            // Optionally: handle/save an update error to show in the form
            toast.error('שגיאה בעדכון התשבץ');
        }
    };

    if (loading) {
        return <div>טוען...</div>;
    }
    if (loadError) {
        return <div className="alert alert-danger">{loadError}</div>;
    }

    return (
        <CrosswordForm
            initialData={crossword}
            onSubmit={handleUpdateCrossword}
        />
    );
};

export default CrosswordEditor;