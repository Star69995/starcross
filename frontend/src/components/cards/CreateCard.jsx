import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Dashed-border "create new" tile shown inline in a content grid (crosswords/word
// lists browse pages) so creating new content is one click away from browsing it,
// instead of buried in the navbar/account dropdown only.
const CreateCard = ({ to, title, subtitle, buttonText, icon = 'bi-plus-lg' }) => (
    <div className="panel content-card create-card h-100">
        <div className="panel-body flex flex-col items-center justify-center text-center">
            <span className="create-card-icon">
                <i className={`bi ${icon}`}></i>
            </span>
            <h5 className="panel-title mb-1">{title}</h5>
            <p className="panel-text text-muted small mb-3">{subtitle}</p>
            <Link to={to} className="button button-outline-secondary button-sm">
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
