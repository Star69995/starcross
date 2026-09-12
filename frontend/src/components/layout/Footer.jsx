function Footer() {
    return (
        <footer className="footer bg-dark text-light py-3">
            <div className="container">
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                    <img
                        src="/logo.svg"
                        alt="לוגו תשבצי דיגיטל"
                        style={{ width: "26px", height: "26px" }}
                    />
                    <h6 className="mb-0">משבצת</h6>
                    <span className="opacity-50 d-none d-sm-inline">•</span>
                    <small className="mb-0">© 2026 כל הזכויות שמורות</small>
                </div>
            </div>
        </footer>
    );
}

export default Footer;