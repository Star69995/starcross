import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const GenericFormField = forwardRef(({ name, label, value='', type = 'text', onChange, children, error }, ref) => {
    return (
        <div>
            {type === 'checkbox' ? (
                <div className="form-check d-flex flex-row align-items-center mb-3">
                    <input
                        ref={ref}
                        className="form-check-input ms-2"
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor={name}>{label}</label>
                    {children}
                </div>
            ) : (
                <div className="mb-3">
                    <label className="form-label" htmlFor={name}>{label}</label>
                    <input
                        ref={ref}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${name}-error` : undefined}
                    />
                    {error && <div className="invalid-feedback" id={`${name}-error`}>{error}</div>}
                    {children}
                </div>
            )}
        </div>
    );
});

GenericFormField.displayName = 'GenericFormField';

GenericFormField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    error: PropTypes.string,
};

export default GenericFormField;