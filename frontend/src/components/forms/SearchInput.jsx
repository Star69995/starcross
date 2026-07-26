import PropTypes from 'prop-types'

const SearchInput = ({ value, onChange, placeholder, className = '' }) => (
    <div className={`search-bar d-flex align-items-center gap-2 ${className}`}>
        <i className="bi bi-search"></i>
        <input
            type="text"
            className="search-bar-input"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
)

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
}

export default SearchInput
