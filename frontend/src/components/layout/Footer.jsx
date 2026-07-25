function Footer() {
    return (
        <footer className="footer bg-dark text-light py-2"> 
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    {/* לוגו וזכויות יוצרים */}
                    <div className="col-md-4 text-center mb-2"> 
                        <div className="d-flex align-items-center justify-content-center mb-1"> 
                            <img
                                src="/logo.svg"
                                alt="לוגו תשבצי דיגיטל"
                                style={{ width: "30px", height: "30px" }} 
                            />
                            <h6 className="mb-0 me-2">סטאר תשבצים</h6> 
                        </div>
                        <small className="mb-0">© 2026 כל הזכויות שמורות</small> 
                    </div>

                    {/* יצירת קשר */}
                    <div className="col-md-4 text-center mb-2"> 
                        <h6 className="mb-1">יצירת קשר</h6> 
                        <div>
                            <i className="fas fa-envelope me-2"></i>
                            <a href="mailto:star69995@gmail.com" className="text-light text-decoration-none">
                                <small>star69995@gmail.com</small> 
                            </a>
                        </div>
                    </div>

                    {/* קישור גיטהאב */}
                    <div className="col-md-4 text-center mb-2" style={{direction: "ltr"}}> 
                        <h6 className="mb-1">קוד המקור</h6> 
                        <a href="https://github.com/Star69995/star-crossword" className="text-light text-decoration-none" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-github me-2"></i>
                            <small>GitHub</small> 
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;