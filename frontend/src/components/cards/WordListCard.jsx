import { useAuth } from '../../providers/AuthContext'
import { toggleLikeWordList, deleteWordList } from '../../services/api'
import PropTypes from 'prop-types';
import ContentCard from './ContentCard'
import { useNavigate } from 'react-router-dom'
import { toast } from "react-toastify";

const WordListCard = ({ wordList, onDelete }) => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleLike = async (id) => {
        if (!user) {
            toast.info("כדי לעשות לייק על רשימת מילים צריך להתחבר תחילה")
            return false; 
        }
        try {
            await toggleLikeWordList(id)
            return true; 
        } catch (error) {
            console.error('Error liking word list:', error)
            toast.error('שגיאה בעדכון לייק');
            return false;
        }
    }

    const handleDelete = async (id) => {
            try {
                await deleteWordList(id)
                if (onDelete) onDelete(id)  // <<< Call parent callback
                toast.success('נמחק בהצלחה');
            } catch (error) {
                console.error('Error deleting crossword:', error)
                toast.error('שגיאה במחיקה');
            }
        }

    const handleEdit = () => {
        navigate(`/edit-wordlist/${wordList._id}/`)
    }

    const canEdit = user?._id === wordList.creator._id

    return (
        <ContentCard
            id={wordList._id}
            title={wordList.title}
            description={wordList.description}
            creator={wordList.creator?.userName}
            createdAt={new Date(wordList.createdAt).toLocaleDateString('he-IL')}
            stats={[
                { icon: "bi-list-ul", label: `${wordList.words.length || 0} מילים` }
            ]}
            badge={wordList.isPublic}
            liked={wordList.likes.includes(user?._id)}
            onLike={handleLike} // implement in parent or with hooks!
            likesCount={wordList.likes.length || 0}
            // likeLoading={loading}
            canEdit={canEdit}
            canDelete={canEdit}
            onEdit={handleEdit}    // implement in parent
            onDelete={handleDelete}
            viewUrl={`/wordlist/${wordList._id}`}
            viewText="צפה"
        />
    )
}
WordListCard.propTypes = {
    wordList: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
};
export default WordListCard