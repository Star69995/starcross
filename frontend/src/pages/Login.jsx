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
            <div className="grid-row justify-center">
                <div className="col-12 auth-card-col">
                    <div className="panel shadow">
                        <div className="panel-body p-5">
                            <div className="text-center mb-4">
                                <i className="bi bi-person-circle text-size-1 text-accent"></i>
                                <h2 className="panel-title">התחברות</h2>
                            </div>

                            {error && (
                                <div className="banner banner-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="field-label">אימייל</label>
                                    <input
                                        type="email"
                                        className="field-input"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        dir="ltr"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="field-label">סיסמה</label>
                                    <input
                                        type="password"
                                        className="field-input"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="button button-primary w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loader loader-sm mr-2" role="status" aria-hidden="true"></span>
                                            מתחבר...
                                        </>
                                    ) : (
                                        'התחברות'
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center my-3">
                                <hr className="grow" />
                                <span className="px-2 text-muted small">או</span>
                                <hr className="grow" />
                            </div>

                            <button
                                type="button"
                                className="button button-outline-secondary w-100 mb-3"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                            >
                                {googleLoading ? (
                                    <>
                                        <span className="loader loader-sm mr-2" role="status" aria-hidden="true"></span>
                                        מתחבר...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-google ml-2"></i>
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