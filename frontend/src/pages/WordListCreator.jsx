import WordListForm from '../components/forms/wordlists/WordListForm'
import { createWordList } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const WordListCreator = () => {
    const navigate = useNavigate();
    const handleCreateWordList = async (formData) => {
        try {
            await createWordList(formData);
            navigate("/my-wordlists");
            toast.success('נשמר בהצלחה');
        } catch (error) {
            console.log('error: ', error);
            toast.error('שגיאה בשמירה');
        }
    }
    return (
        <WordListForm onSubmit={handleCreateWordList}></WordListForm>
    )
}

export default WordListCreator