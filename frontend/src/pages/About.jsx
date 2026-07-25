const sections = [
    {
        icon: 'bi-book',
        title: 'תיאור כללי',
        body: (
            <>
                <p>
                    Star Crossword היא פלטפורמה ליצירה, פתרון ושיתוף של תשבצים בעברית, הבנויה כ־
                    <b> אפליקציית React</b> שמתחברת ישירות ל־<b>Firebase</b> (Firestore + Authentication)
                    — ללא שרת מותאם אישית משלה.
                </p>
                <ul className="list-unstyled d-flex flex-column gap-2">
                    <li><i className="bi bi-pencil-square text-primary ms-2"></i>יצירת תשבצים ורשימות מילים חדשים על ידי כל משתמש רשום</li>
                    <li><i className="bi bi-puzzle text-primary ms-2"></i>פתרון תשבצים בזמן אמת עם ממשק גרפי ולוח אינטראקטיבי</li>
                    <li><i className="bi bi-star-fill text-primary ms-2"></i>סימון תשבצים או רשימות מילים כמועדפים ולייק</li>
                    <li><i className="bi bi-globe text-primary ms-2"></i>גלישה בתוכן ציבורי, וכן בתוכן האישי והמועדפים שלך</li>
                    <li><i className="bi bi-key text-primary ms-2"></i>הרשמה והתחברות מאובטחות דרך Firebase Authentication (אימייל+סיסמה או גוגל)</li>
                </ul>
            </>
        ),
    },
    {
        icon: 'bi-cloud',
        title: 'Firebase (במקום שרת)',
        body: (
            <>
                <p>נבנה עם:</p>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
                    <li><i className="bi bi-database text-primary ms-2"></i>Cloud Firestore — בסיס הנתונים לתשבצים, רשימות מילים ופרופילי משתמשים</li>
                    <li><i className="bi bi-key text-primary ms-2"></i>Firebase Authentication — ניהול משתמשים והתחברות (אימייל/סיסמה, גוגל)</li>
                    <li><i className="bi bi-hdd-network text-primary ms-2"></i>Firebase Hosting — הגשת האתר</li>
                    <li><i className="bi bi-file-earmark-lock text-primary ms-2"></i>Firestore Security Rules — אכיפת הרשאות (עריכה/מחיקה ליוצר בלבד, לייקים למשתמשים מחוברים, נראות ציבורית/פרטית)</li>
                </ul>
                <div className="card bg-body-tertiary">
                    <div className="card-body">
                        <b><i className="bi bi-collection text-primary ms-2"></i>אוספים עיקריים ב-Firestore:</b>
                        <ul className="list-unstyled mt-2 mb-0">
                            <li>פרופילי משתמשים ← users</li>
                            <li>תשבצים ← crosswords</li>
                            <li>רשימות מילים ← wordLists</li>
                        </ul>
                    </div>
                </div>
            </>
        ),
    },
    {
        icon: 'bi-palette',
        title: 'צד לקוח (Frontend)',
        body: (
            <>
                <p>נבנה עם:</p>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-3">
                    <li><i className="bi bi-code-slash text-primary ms-2"></i>React (Vite)</li>
                    <li><i className="bi bi-bootstrap text-primary ms-2"></i>Bootstrap 5</li>
                    <li><i className="bi bi-bootstrap-fill text-primary ms-2"></i>Bootstrap Icons</li>
                </ul>
                <p><b>פיצ&apos;רים עיקריים בצד לקוח:</b></p>
                <ul className="list-unstyled d-flex flex-column gap-2">
                    <li><i className="bi bi-phone text-primary ms-2"></i>עיצוב רספונסיבי למחשב, טאבלט וטלפון</li>
                    <li><i className="bi bi-key text-primary ms-2"></i>התחברות + הרשמה עם ולידציית טפסים (Joi)</li>
                    <li><i className="bi bi-arrow-repeat text-primary ms-2"></i>CRUD מלא לתשבצים ורשימות מילים</li>
                    <li><i className="bi bi-star-fill text-primary ms-2"></i>מועדפים ולייקים נשמרים ב-Firestore</li>
                    <li><i className="bi bi-file-earmark-text text-primary ms-2"></i>דף אודות מפורט</li>
                    <li><i className="bi bi-search text-primary ms-2"></i>שדה חיפוש ותצוגות סינון</li>
                    <li><i className="bi bi-shield-lock text-primary ms-2"></i>הרשאות מותנות למשתמש מחובר (יצירה, עריכה ומחיקה של תוכן אישי)</li>
                </ul>
            </>
        ),
    },
];

const About = () => {
    return (
        <div className="container py-5" style={{ direction: 'rtl', textAlign: 'right' }}>
            <div className="row mb-4">
                <div className="col">
                    <h1 className="text-primary">
                        <i className="bi bi-star-fill ms-2"></i>סטאר תשבצים
                    </h1>
                    <p className="lead">
                        פלטפורמת תשבצים אינטרנטית המאפשרת יצירה, פתרון ושיתוף של תשבצים –
                        עם מערכת ניהול משתמשים, תמיכה בעברית (RTL), ועיצוב רספונסיבי
                        למחשב, טאבלט ומובייל.
                    </p>
                </div>
            </div>

            <div className="row g-4">
                {sections.map(section => (
                    <div className="col-12" key={section.title}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title mb-3">
                                    <i className={`bi ${section.icon} text-primary ms-2`}></i>
                                    {section.title}
                                </h3>
                                {section.body}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default About;
