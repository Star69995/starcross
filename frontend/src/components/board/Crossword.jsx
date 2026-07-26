import Grid from './Grid';
import DefinitionsArea from './DefinitionsArea';
import { useCrossword } from '../../providers/CrosswordContext.jsx';
import CurrentDef from './CurrentDef.jsx';

const Crossword = () => {
    const { grid, definitions } = useCrossword();

    return (
        <div className="container-fluid py-3 py-md-4">
            <div className="row justify-content-center align-items-start">
                {/* Grid area */}
                <div className="col-12 col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center">
                    <div>
                        <CurrentDef />
                        <Grid crossword={grid} />
                    </div>
                </div>

                {/* Definitions area */}
                <div className="col-12 col-lg-5">
                    <DefinitionsArea definitions={definitions} />
                </div>
            </div>
        </div>
    );
};

export default Crossword;