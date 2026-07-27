function Footer() {
    return (
        <footer className="footer bg-dark text-light py-2"> 
            <div className="container">
                <div className="grid-row justify-center items-center">
                    {/* לוגו וזכויות יוצרים */}
                    <div className="col-4-md text-center mb-2">
                        <div className="flex items-center justify-center mb-1">
                            <img
                                src="/logo.svg"
                                alt="לוגו תשבצי דיגיטל"
                                style={{ width: "30px", height: "30px" }} 
                            />
                            <h6 className="mb-0 mr-2">משבצת</h6>
                        </div>
                        <small className="mb-0">© 2026 כל הזכויות שמורות</small> 
                    </div>

                    {/* יצירת קשר */}
                    <div className="col-4-md text-center mb-2"> 
                        <h6 className="mb-1">יצירת קשר</h6> 
                        <div>
                            <i className="bi bi-envelope ml-2"></i>
                            <a href="mailto:star69995@gmail.com" className="text-light text-decoration-none">
                                <small>star69995@gmail.com</small> 
                            </a>
                        </div>
                    </div>

                    {/* קישור גיטהאב */}
                    <div className="col-4-md text-center mb-2" style={{direction: "ltr"}}> 
                        <h6 className="mb-1">קוד המקור</h6> 
                        <a href="https://github.com/Star69995/starcross" className="text-light text-decoration-none" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-github mr-2"></i>
                            <small>GitHub</small> 
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;