import { Link } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const FEATURES = [
    {
        icon: 'bi-pencil-square',
        title: 'יצירת תשבצים',
        text: 'בונים תשבץ משלכם צעד־צעד מרשימת מילים, מוסיפים רמזים, ובוחרים אם לשמור אותו כפרטי או לשתף עם כולם.',
    },
    {
        icon: 'bi-puzzle',
        title: 'פתרון אינטראקטיבי',
        text: 'לוח פתירה נוח עם מקלדת עברית מובנית ומעבר בין רמזים, וההתקדמות נשמרת אוטומטית כדי לחזור בדיוק מאיפה שעצרתם.',
    },
    {
        icon: 'bi-card-list',
        title: 'רשימות מילים',
        text: 'מגוון רשימות מילים מוכנות בעברית — חלופות, מקצועות, פירות וירקות ועוד — לשימוש חופשי בבניית תשבצים.',
    },
    {
        icon: 'bi-star-fill',
        title: 'מועדפים ולייקים',
        text: 'מסמנים תשבצים ורשימות כמועדפים כדי לחזור אליהם בקלות, ומשאירים לייק לתוכן שאהבתם.',
    },
    {
        icon: 'bi-globe',
        title: 'תוכן ציבורי ואישי',
        text: 'גולשים בתשבצים וברשימות המילים הציבוריים של כל המשתמשים, לצד התוכן האישי שיצרתם בעצמכם.',
    },
    {
        icon: 'bi-shield-lock',
        title: 'התחברות מאובטחת',
        text: 'נרשמים ומתחברים בכמה שניות עם אימייל וסיסמה או עם חשבון גוגל.',
    },
];

const STEPS = [
    {
        title: 'נרשמים או מתחברים',
        text: 'יוצרים חשבון תוך שניות עם אימייל או גוגל — או פשוט גולשים כאורחים.',
    },
    {
        title: 'בוחרים או יוצרים תשבץ',
        text: 'מדפדפים בתשבצים הציבוריים, או בונים תשבץ חדש משלכם מרשימת מילים.',
    },
    {
        title: 'פותרים ושומרים התקדמות',
        text: 'פותרים בלוח האינטראקטיבי — ההתקדמות נשמרת אוטומטית כדי להמשיך בכל זמן.',
    },
    {
        title: 'מסמנים ומשתפים',
        text: 'מסמנים כמועדף, נותנים לייק, ושולחים לינק לחברים כדי לפתור יחד.',
    },
];

const About = () => {
    const { canInstall, promptInstall } = useInstallPrompt();

    return (
        <div className="container py-5">
            <div className="about-hero text-center mb-5">
                <i className="bi bi-puzzle-fill about-hero-icon"></i>
                <h1 className="display-4 mt-3 mb-2">משבצת</h1>
                <p className="lead text-center mb-0">
                    פלטפורמת תשבצים בעברית ליצירה, פתרון ושיתוף — בחינם, בלי הרשמה מסובכת וללא צורך בהתקנה.
                </p>
            </div>

            <h2 className="text-center mb-4">מה אפשר לעשות באתר</h2>
            <div className="row g-4 mb-5">
                {FEATURES.map(feature => (
                    <div className="col-md-6 col-lg-4" key={feature.title}>
                        <div className="card content-card h-100 shadow-sm">
                            <div className="card-body">
                                <span className="content-card-icon mb-3">
                                    <i className={`bi ${feature.icon}`}></i>
                                </span>
                                <h3 className="card-title h5">{feature.title}</h3>
                                <p className="text-muted mb-0">{feature.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-center mb-4">איך זה עובד</h2>
            <div className="row g-4 mb-5">
                {STEPS.map((step, index) => (
                    <div className="col-md-6 col-lg-3" key={step.title}>
                        <div className="about-step text-center h-100">
                            <div className="about-step-circle">{index + 1}</div>
                            <h3 className="h6 mt-3">{step.title}</h3>
                            <p className="text-muted small mb-0">{step.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                <Link to="/" className="btn btn-primary btn-lg">
                    מעבר לתשבצים<i className="bi bi-arrow-left me-2"></i>
                </Link>
                <Link to="/wordlists" className="btn btn-primary btn-lg">
                    מעבר לרשימות מילים<i className="bi bi-arrow-left me-2"></i>
                </Link>
            </div>

            {canInstall && (
                <div className="row justify-content-center mb-5">
                    <div className="col-md-8 col-lg-6">
                        <div className="card content-card h-100 shadow-sm">
                            <div className="card-body d-flex flex-column align-items-center text-center">
                                <span className="content-card-icon mb-3">
                                    <i className="bi bi-download"></i>
                                </span>
                                <h3 className="card-title h5">התקנת האפליקציה</h3>
                                <p className="text-muted mb-3">
                                    אפשר להתקין את משבצת על המכשיר שלכם לגישה מהירה, בדיוק כמו אפליקציה רגילה.
                                </p>
                                <button type="button" className="btn btn-primary" onClick={promptInstall}>
                                    <i className="bi bi-download ms-2"></i>
                                    התקנה
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="about-portfolio-card text-center">
                <i className="bi bi-person-workspace about-portfolio-icon"></i>
                <h3 className="mt-3 mb-2">האתר הזה נבנה על ידי סטאר</h3>
                <p className="text-center mb-3">רוצים לראות עוד פרויקטים שבניתי? מוזמנים לבקר בתיק העבודות שלי.</p>
                <a
                    href="https://star69995.github.io/star-site/"
                    className="btn btn-light"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="bi bi-person-workspace ms-2"></i>לתיק העבודות שלי
                </a>
            </div>
        </div>
    );
};

export default About;
