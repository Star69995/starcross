import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Dashed-border "create new" tile shown inline in a content grid (crosswords/word
// lists browse pages) so creating new content is one click away from browsing it,
// instead of buried in the navbar/account dropdown only.
const CreateCard = ({ to, title, subtitle, buttonText, icon = 'bi-plus-lg' }) => (
    <div className="card content-card create-card h-100">
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
            <span className="create-card-icon">
                <i className={`bi ${icon}`}></i>
            </span>
            <h5 className="card-title mb-1">{title}</h5>
            <p className="card-text text-muted small mb-3">{subtitle}</p>
            <Link to={to} className="btn btn-outline-secondary btn-sm">
                {buttonText}
            </Link>
        </div>
    </div>
);

CreateCard.propTypes = {
    to: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    buttonText: PropTypes.string.isRequired,
    icon: PropTypes.string,
};

export default CreateCard;
