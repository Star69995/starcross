import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { toast } from "react-toastify";
import Joi from 'joi'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [googleLoading, setGoogleLoading] = useState(false)

    const loginSchema = Joi.object({
        email: Joi.string().email({ tlds: false }).required().messages({
            'string.empty': 'נא להזין כתובת אימייל',
            'string.email': 'נא להזין כתובת אימייל תקינה'
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'נא להזין סיסמה',
            'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים'
        }),
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Joi client-side validation
        const { error: validationError } = loginSchema.validate(formData, { abortEarly: true })
        if (validationError) {
            setError(validationError.details[0].message) // shows first error in Hebrew
            setLoading(false)
            return
        }

        try {
            await login(formData.email, formData.password)
            navigate('/')
            toast.success('התחברת בהצלחה')
        } catch (error) {
            // Get server message if sent
            let serverMessage = error?.response?.data || error.message

            if (serverMessage?.includes('User not found')) {
                serverMessage = 'משתמש לא נמצא'
            } else if (serverMessage?.includes('Incorrect password')) {
                serverMessage = 'סיסמה שגויה'
            } else if (serverMessage?.includes('"email" must be a valid email')) {
                serverMessage = 'כתובת אימייל לא תקינה'
            }
            else if (serverMessage?.includes("Invalid email or password")) {
                serverMessage = 'המייל או הסיסמה לא נכונים'
            }

            // Optional: you can even re-run Joi validation if your backend uses Joi
            setError(serverMessage || 'שגיאה בהתחברות. יש לבדוק את הפרטים ולנסות שוב.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError('')
        try {
            await loginWithGoogle()
            navigate('/')
            toast.success('התחברת בהצלחה')
        } catch (error) {
            setError(error.message || 'שגיאה בהתחברות עם גוגל. נסה שוב.')
        } finally {
            setGoogleLoading(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-circle fs-1 text-primary"></i>
                                <h2 className="card-title">התחברות</h2>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">אימייל</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        dir="ltr"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">סיסמה</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            מתחבר...
                                        </>
                                    ) : (
                                        'התחברות'
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
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                            >
                                {googleLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        מתחבר...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-google ms-2"></i>
                                        התחברות עם גוגל
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="mb-0">אין חשבון? <Link to="/register" className="text-decoration-none">הרשמה</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login