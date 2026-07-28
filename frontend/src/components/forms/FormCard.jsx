import { useState } from "react";
import PropTypes from 'prop-types';


const FormCard = ({
    fields,
    onSubmit,
    initialValues = {},
    error,
    loading,
    children,
    submitLabel = "שמור",
    cancelLabel = "ביטול",
    onCancel,
}) => {
    const [formData, setFormData] = useState(initialValues);

    const handleInput = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field) => (
                <div className="mb-3" key={field.name}>
                    {field.type === "checkbox" ? (
                        <div className="form-check d-flex align-items-center gap-2 ps-0">
                            <input
                                type="checkbox"
                                className="form-check-input flex-shrink-0 float-none m-0"
                                id={field.name}
                                name={field.name}
                                checked={!!formData[field.name]}
                                onChange={handleInput}
                            />
                            <label
                                className="form-check-label d-flex align-items-center gap-2 flex-grow-1"
                                htmlFor={field.name}
                                style={{ fontWeight: "normal" }}
                            >
                                <i className={`bi ${formData[field.name] ? "bi-globe2" : "bi-lock-fill"}`} />
                                {field.label}
                            </label>
                            <span className={`badge ${formData[field.name] ? "bg-success" : "bg-secondary"}`}>
                                {formData[field.name] ? "ציבורית" : "פרטית"}
                            </span>
                        </div>
                    ) : field.type === "textarea" ? (
                        <>
                            <label htmlFor={field.name} className="form-label">
                                {field.label}
                            </label>
                            <textarea
                                className="form-control"
                                id={field.name}
                                name={field.name}
                                rows={field.rows || 3}
                                value={formData[field.name] || ""}
                                onChange={handleInput}
                                required={field.required}
                            />
                        </>
                    ) : (
                        <>
                            <label htmlFor={field.name} className="form-label">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                className="form-control"
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleInput}
                                required={field.required}
                                min={field.min}
                                max={field.max}
                                placeholder={field.placeholder}
                            />
                            {field.helpText && (
                                <div className="form-text">{field.helpText}</div>
                            )}
                        </>
                    )}
                </div>
            ))}

            {/* מילים וכל דבר נוסף */}
            {children}

            {error && (
                <div className="alert alert-danger mt-2" role="alert">
                    {error}
                </div>
            )}

            <div className="d-flex gap-2 mt-3">
                <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            שומר...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-plus-circle" />
                            {submitLabel}
                        </>
                    )}
                </button>
                {onCancel && (
                    <button type="button" className="btn btn-secondary d-inline-flex align-items-center" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                )}
            </div>
        </form>
    );
};
FormCard.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    fields: PropTypes.array.isRequired,
    initialValues: PropTypes.object,
    error: PropTypes.string,
    loading: PropTypes.bool,
    children: PropTypes.node,
    submitLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    onCancel: PropTypes.func,
};

export default FormCard