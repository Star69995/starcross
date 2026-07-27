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
                        <div className="field-check flex flex-row items-center">
                            <input
                                type="checkbox"
                                className="field-check-input ml-2"
                                id={field.name}
                                name={field.name}
                                checked={!!formData[field.name]}
                                onChange={handleInput}
                            />
                            <label
                                className="field-check-label"
                                htmlFor={field.name}
                                style={{ fontWeight: "normal" }}
                            >
                                {field.label}
                            </label>
                        </div>
                    ) : field.type === "textarea" ? (
                        <>
                            <label htmlFor={field.name} className="field-label">
                                {field.label}
                            </label>
                            <textarea
                                className="field-input"
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
                            <label htmlFor={field.name} className="field-label">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                className="field-input"
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleInput}
                                required={field.required}
                            />
                        </>
                    )}
                </div>
            ))}

            {/* מילים וכל דבר נוסף */}
            {children}

            {error && (
                <div className="banner banner-danger mt-2" role="alert">
                    {error}
                </div>
            )}

            <div className="flex gap-2 mt-3">
                <button
                    type="submit"
                    className="button button-primary inline-flex items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="loader loader-sm" role="status"></span>
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
                    <button type="button" className="button button-secondary inline-flex items-center" onClick={onCancel}>
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