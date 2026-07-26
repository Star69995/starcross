import PropTypes from 'prop-types';
import Grid from './Grid';
import DefinitionsArea from './DefinitionsArea';
import CurrentDef from './CurrentDef.jsx';

const Crossword = ({ showClueList = true }) => {
    return (
        <div className="container-fluid py-3 py-md-4">
            <div className="row justify-content-center align-items-start">
                {/* Grid area */}
                <div className="col-12 col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center">
                    <div>
                        <CurrentDef />
                        <Grid />
                    </div>
                </div>

                {/* Definitions area - hidden on mobile only while showClueList is
                    false (the toggle lives in the solve toolbar, mobile-only) */}
                <div className={`col-12 col-lg-5 ${showClueList ? '' : 'd-none d-lg-block'}`}>
                    <DefinitionsArea />
                </div>
            </div>
        </div>
    );
};

Crossword.propTypes = {
    showClueList: PropTypes.bool,
};

export default Crossword;