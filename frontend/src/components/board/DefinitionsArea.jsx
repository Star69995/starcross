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
        <div className="mt-1 d-flex flex-column gap-2 p-3">
            <h2 className="text-center">הגדרות:</h2>

            <div
                style={{ display: "flex", justifyContent: "space-evenly" }}>
                <div>
                    <h3>מאוזן:</h3>
                    <ul style={{ textAlign: "right", listStyle: 'none' }}>
                        {definitionsUsed.across.map((def) => (
                            <Definition
                                key={def.number}
                                definition={`${def.number}. ${def.text}`}
                            />
                        ))}
                    </ul>
                </div>

                <div>
                    <h3>מאונך:</h3>
                    <ul style={{ textAlign: "right", listStyle: 'none' }}>
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