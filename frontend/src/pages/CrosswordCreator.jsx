import CrosswordForm from '../components/forms/crosswords/CrosswordForm'
import { createCrossword } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const CrosswordCreator = () => {
    const navigate = useNavigate(); 

    const handleCreateCrossword = async (data) => {
        try {
            await createCrossword(data);
            navigate("/my-crosswords");
            toast.success('נשמר בהצלחה');
        } catch (error) {
            console.log('error: ', error);
            toast.error('שגיאה בשמירה');
        } 
    }

    return (
        <CrosswordForm onSubmit={handleCreateCrossword} />
    )
}

export default CrosswordCreator