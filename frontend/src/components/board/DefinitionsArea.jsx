import { useState } from "react";
import Definition from "./Definition";
import { useCrossword } from "../../providers/CrosswordContext";

function DefinitionsArea() {
    const { definitionsUsed } = useCrossword();
    // Only affects narrow screens - see .defs-tabs/.defs-column in App.css. On
    // wide screens both columns show side by side regardless of this state.
    const [activeTab, setActiveTab] = useState("across");

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

            <div className="defs-tabs">
                <button
                    type="button"
                    className={`defs-tab ${activeTab === "across" ? "active" : ""}`}
                    onClick={() => setActiveTab("across")}
                >
                    מאוזן
                </button>
                <button
                    type="button"
                    className={`defs-tab ${activeTab === "down" ? "active" : ""}`}
                    onClick={() => setActiveTab("down")}
                >
                    מאונך
                </button>
            </div>

            <div className="row">
                <div className={`col-6 defs-column ${activeTab === "across" ? "active" : ""}`}>
                    <h3 className="d-none d-lg-block">מאוזן:</h3>
                    <ul className="list-unstyled" style={{ textAlign: "right" }}>
                        {definitionsUsed.across.map((def) => (
                            <Definition
                                key={def.number}
                                definition={`${def.number}. ${def.text}`}
                            />
                        ))}
                    </ul>
                </div>

                <div className={`col-6 defs-column ${activeTab === "down" ? "active" : ""}`}>
                    <h3 className="d-none d-lg-block">מאונך:</h3>
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