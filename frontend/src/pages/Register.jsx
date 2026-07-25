import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import GenericFormField from '../components/forms/GenericFormField'
import { toast } from "react-toastify";

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        isContentCreator: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { register } = useAuth()
    const navigate = useNavigate()

    // regex: at least 1 uppercase, 1 lowercase, 4 numbers, 1 special, min 8 chars
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){4,})(?=.*[!@#$%^&*\-_()]).{8,}$/

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('הסיסמאות אינן תואמות')
            setLoading(false)
            return
        }

        if (!passwordRegex.test(formData.password)) {
            setError(
                'הסיסמה חייבת להכיל לפחות אות גדולה, אות קטנה, 4 ספרות, סימן מיוחד (!@#$%^&*-_()), ומינימום 8 תווים'
            )
            setLoading(false)
            return
        }

        try {
            await register({
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                isContentCreator: formData.isContentCreator
            })
            navigate('/')
            toast.success('הרשמה בוצעה בהצלחה')
        } catch (error) {
            let errorMessage = 'שגיאה בהרשמה. נסה שוב.'
            if (error.message.includes('User already registered')) {
                errorMessage = 'משתמש כבר קיים';
            } else if (error.message.includes('"userName" is not allowed to be empty')) {
                errorMessage = 'שם המשתמש לא יכול להיות ריק';
            } else if (error.message.includes('"email" must be a valid email')) {
                errorMessage = 'כתובת אימייל אינה תקינה';
            } else if (error.message.includes('"password" is not allowed to be empty')) {
                errorMessage = 'יש להזין סיסמה';
            } else if (error.message.includes('"password" length must be at least 6 characters long')) {
                errorMessage = 'הסיסמה חייבת להכיל לפחות 6 תווים';
            }
            // show error message from backend
            setError(errorMessage);
            toast.error(`שגיאה בהרשמה: ${errorMessage}`);
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
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
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

                                <GenericFormField name="userName" label="שם משתמש" value={formData.userName} type="text" onChange={handleChange} />

                                <GenericFormField name="email" label="אימייל" value={formData.email} type="email" onChange={handleChange} />

                                <GenericFormField
                                    name="password"
                                    label="סיסמה"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6" >
                                    <div className="form-text">לפחות 6 תווים</div>
                                </GenericFormField>



                                <GenericFormField
                                    name="confirmPassword"
                                    label="אישור סיסמה"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                                <GenericFormField name="isContentCreator" label="יוצר תוכן" value={formData.isContentCreator} type="checkbox" onChange={handleChange} />

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