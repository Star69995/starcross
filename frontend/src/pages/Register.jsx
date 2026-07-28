import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import GenericFormField from '../components/forms/GenericFormField'
import { toast } from "react-toastify";

const PASSWORD_REQUIREMENTS = [
    { key: 'length', label: 'לפחות 8 תווים', test: (pw) => pw.length >= 8 },
    { key: 'lower', label: 'אות קטנה אחת (a-z)', test: (pw) => /[a-z]/.test(pw) },
    { key: 'upper', label: 'אות גדולה אחת (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { key: 'digits', label: '4 ספרות לפחות', test: (pw) => (pw.match(/\d/g) || []).length >= 4 },
    { key: 'special', label: 'תו מיוחד אחד (!@#$%^&*-_())', test: (pw) => /[!@#$%^&*\-_()]/.test(pw) },
]

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const { register, loginWithGoogle } = useAuth()
    const navigate = useNavigate()

    const userNameRef = useRef(null)
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const confirmPasswordRef = useRef(null)
    const fieldRefs = { userName: userNameRef, email: emailRef, password: passwordRef, confirmPassword: confirmPasswordRef }

    const passwordChecks = PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.test(formData.password),
    }))
    const metCount = passwordChecks.filter((check) => check.met).length
    const passwordValid = metCount === passwordChecks.length
    const passwordsMatch = formData.password === formData.confirmPassword

    const validateFields = () => {
        const errors = {}
        if (!formData.userName.trim()) {
            errors.userName = 'שדה חובה'
        }
        if (!formData.email.trim()) {
            errors.email = 'שדה חובה'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'כתובת אימייל אינה תקינה'
        }
        if (!formData.password) {
            errors.password = 'שדה חובה'
        } else if (!passwordValid) {
            errors.password = 'הסיסמה לא עומדת בכל הדרישות המפורטות מתחת לשדה'
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'שדה חובה'
        } else if (!passwordsMatch) {
            errors.confirmPassword = 'הסיסמאות אינן תואמות'
        }
        return errors
    }

    const focusFirstInvalidField = (errors) => {
        const firstInvalidField = ['userName', 'email', 'password', 'confirmPassword'].find((field) => errors[field])
        fieldRefs[firstInvalidField]?.current?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const errors = validateFields()
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) {
            setError('נא למלא את כל השדות המסומנים')
            focusFirstInvalidField(errors)
            return
        }

        setLoading(true)

        try {
            await register({
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
            })
            navigate('/')
            toast.success('הרשמה בוצעה בהצלחה')
        } catch (error) {
            let errorMessage = 'שגיאה בהרשמה. נסה שוב.'
            let invalidField = null
            if (error.message.includes('User already registered')) {
                errorMessage = 'משתמש כבר קיים';
                invalidField = 'email'
            } else if (error.message.includes('"userName" is not allowed to be empty')) {
                errorMessage = 'שם המשתמש לא יכול להיות ריק';
                invalidField = 'userName'
            } else if (error.message.includes('"email" must be a valid email')) {
                errorMessage = 'כתובת אימייל אינה תקינה';
                invalidField = 'email'
            } else if (error.message.includes('"password" is not allowed to be empty')) {
                errorMessage = 'יש להזין סיסמה';
                invalidField = 'password'
            } else if (error.message.includes('"password" length must be at least 6 characters long')) {
                errorMessage = 'הסיסמה חייבת להכיל לפחות 6 תווים';
                invalidField = 'password'
            }
            // show error message from backend
            setError(errorMessage);
            toast.error(`שגיאה בהרשמה: ${errorMessage}`);
            if (invalidField) {
                setFieldErrors((prev) => ({ ...prev, [invalidField]: errorMessage }))
                fieldRefs[invalidField]?.current?.focus()
            }
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
    }

    const handleGoogleRegister = async () => {
        setGoogleLoading(true)
        setError('')
        try {
            await loginWithGoogle()
            navigate('/')
            toast.success('הרשמה בוצעה בהצלחה')
        } catch (error) {
            setError(error.message || 'שגיאה בהרשמה עם גוגל. נסה שוב.')
        } finally {
            setGoogleLoading(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 auth-card-col">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
                                <h2 className="card-title">הרשמה</h2>
                                <p className="text-muted">יצירת חשבון חדש</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <GenericFormField ref={userNameRef} name="userName" label="שם משתמש" value={formData.userName} type="text" onChange={handleChange} error={fieldErrors.userName} />

                                <GenericFormField ref={emailRef} name="email" label="אימייל" value={formData.email} type="email" onChange={handleChange} error={fieldErrors.email} />

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password">סיסמה</label>
                                    <div className="password-field-wrap">
                                        <input
                                            ref={passwordRef}
                                            className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            aria-describedby={formData.password ? 'password-requirements' : undefined}
                                            aria-invalid={!!fieldErrors.password}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                                            aria-pressed={showPassword}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                                        </button>
                                    </div>

                                    {fieldErrors.password && !formData.password && (
                                        <div className="invalid-feedback d-block">{fieldErrors.password}</div>
                                    )}

                                    {formData.password && (
                                        <div className={`password-requirements-box ${passwordValid ? 'is-complete' : ''}`} id="password-requirements">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="password-requirements-title">חוזק הסיסמה</span>
                                                <span className="password-requirements-count">{metCount}/{passwordChecks.length}</span>
                                            </div>
                                            <div className="solve-progress-bar mb-2">
                                                <div
                                                    className="solve-progress-fill"
                                                    style={{
                                                        width: `${(metCount / passwordChecks.length) * 100}%`,
                                                        background: passwordValid ? 'var(--success)' : 'var(--accent-light)',
                                                    }}
                                                ></div>
                                            </div>
                                            <ul className="password-requirements-list list-unstyled mb-0">
                                                {passwordChecks.map((check) => (
                                                    <li
                                                        key={check.key}
                                                        className={`password-requirement d-flex align-items-center gap-2 ${check.met ? 'is-met' : ''}`}
                                                    >
                                                        <i className={`bi ${check.met ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true"></i>
                                                        <span>{check.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <span className="visually-hidden" aria-live="polite">
                                                {passwordValid
                                                    ? 'כל דרישות הסיסמה הושלמו'
                                                    : `הושלמו ${metCount} מתוך ${passwordChecks.length} דרישות סיסמה`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label" htmlFor="confirmPassword">אישור סיסמה</label>
                                    <div className="password-field-wrap">
                                        <input
                                            ref={confirmPasswordRef}
                                            className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            aria-invalid={!!fieldErrors.confirmPassword}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            aria-label={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                                            aria-pressed={showConfirmPassword}
                                        >
                                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && !formData.confirmPassword && (
                                        <div className="invalid-feedback d-block">{fieldErrors.confirmPassword}</div>
                                    )}
                                    {formData.confirmPassword && (
                                        <div
                                            className={`password-match-hint d-flex align-items-center gap-2 mt-2 ${passwordsMatch ? 'is-match' : 'is-mismatch'}`}
                                            aria-live="polite"
                                        >
                                            <i className={`bi ${passwordsMatch ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} aria-hidden="true"></i>
                                            <span>{passwordsMatch ? 'הסיסמאות תואמות' : 'הסיסמאות אינן תואמות'}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            נרשם...
                                        </>
                                    ) : (
                                        'הרשמה'
                                    )}
                                </button>
                            </form>

                            <div className="d-flex align-items-center my-3">
                                <hr className="flex-grow-1" />
                                <span className="px-2 text-muted small">או</span>
                                <hr className="flex-grow-1" />
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100 mb-3"
                                onClick={handleGoogleRegister}
                                disabled={googleLoading}
                            >
                                {googleLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        נרשם...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-google ms-2"></i>
                                        הרשמה עם גוגל
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="mb-0">יש לך כבר חשבון? <Link to="/login" className="text-decoration-none">התחברות</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
