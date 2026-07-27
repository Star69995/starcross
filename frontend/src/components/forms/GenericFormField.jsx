import PropTypes from 'prop-types';

const GenericFormField = ({ name, label, value='', type = 'text', onChange, children }) => {
    return (
        <div>
            {type === 'checkbox' ? (
                <div className="field-check flex flex-row items-center mb-3">
                    <input
                        className="field-check-input ml-2"
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                    />
                    <label className="field-check-label" htmlFor={name}>{label}</label>
                    {children}
                </div>
            ) : (
                <div className="mb-3">
                    <label className="field-label" htmlFor={name}>{label}</label>
                    <input
                        className="field-input"
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                    />
                        {children}
                </div>
            )}
        </div>
    );
};

GenericFormField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
};

export default GenericFormField;