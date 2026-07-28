import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../services/api'
import { toast } from "react-toastify";
import Joi from 'joi'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    const emailSchema = Joi.string().email({ tlds: false }).required().messages({
        'string.empty': 'נא להזין כתובת אימייל',
        'string.email': 'נא להזין כתובת אימייל תקינה'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error: validationError } = emailSchema.validate(email)
        if (validationError) {
            setError(validationError.details[0].message)
            setLoading(false)
            return
        }

        try {
            await resetPassword(email)
            setSent(true)
            toast.success('נשלח מייל לאיפוס סיסמה')
        } catch (error) {
            let serverMessage = error.message

            if (serverMessage?.includes('User not found')) {
                serverMessage = 'לא נמצא משתמש עם כתובת אימייל זו'
            } else if (serverMessage?.includes('"email" must be a valid email')) {
                serverMessage = 'כתובת אימייל לא תקינה'
            }

            setError(serverMessage || 'שגיאה בשליחת מייל לאיפוס סיסמה. נסה שוב.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 auth-card-col">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <i className="bi bi-key fs-1 text-primary"></i>
                                <h2 className="card-title">שכחתי סיסמה</h2>
                            </div>

                            {sent ? (
                                <div className="alert alert-success" role="alert">
                                    נשלח מייל עם קישור לאיפוס סיסמה לכתובת {email}. יש לבדוק את תיבת הדואר (כולל תיקיית ספאם).
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted text-center mb-4">
                                        הזן את כתובת האימייל שלך ונשלח אליך קישור לאיפוס הסיסמה
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="form-label">אימייל</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                dir="ltr"
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
                                                    שולח...
                                                </>
                                            ) : (
                                                'שליחת קישור לאיפוס סיסמה'
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}

                            <div className="text-center">
                                <p className="mb-0">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="bi bi-arrow-right ms-1"></i>
                                        חזרה להתחברות
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
