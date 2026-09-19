import Definition from "./Definition";
import { useCrossword } from "../../providers/CrosswordContext";

function DefinitionsArea() {
    const { definitionsUsed } = useCrossword();

    if (!definitionsUsed?.across || !definitionsUsed?.down) {
        return (
            <div className="mt-6 space-y-2">
                <h2>הגדרות:</h2>
            </div>
        );
    }

    return (
        <div className="mt-1 d-flex flex-column gap-2 py-2 py-md-3 defs-panel">
            <h2 className="text-center">הגדרות:</h2>

            <div className="row">
                <div className="col-12 col-lg-6 defs-column">
                    <h3>מאוזן:</h3>
                    <ul className="list-unstyled" style={{ textAlign: "right" }}>
                        {definitionsUsed.across.map((def) => (
                            <Definition
                                key={def.number}
                                definition={`${def.number}. ${def.text}`}
                            />
                        ))}
                    </ul>
                </div>

                <div className="col-12 col-lg-6 defs-column mt-3 mt-lg-0">
                    <h3>מאונך:</h3>
                    <ul className="list-unstyled" style={{ textAlign: "right" }}>
                        {definitionsUsed.down.map((def) => (
                            <Definition
                                key={def.number}
                                definition={`${def.number}. ${def.text}`}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default DefinitionsArea;