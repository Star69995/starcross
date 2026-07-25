import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FormCard from "../FormCard";
import WordListTextArea from "./WordListTextArea";
import WordsPreview from "./WordsPreview";

const WordListForm = ({ initialData, onSubmit }) => {
    const navigate = useNavigate();
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize fields from initialData for edit, or blank for create
    const [fieldsState, setFieldsState] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        isPublic: initialData?.isPublic || false,
    });

    // For editing, support prefilled words
    const [wordsText, setWordsText] = useState(
        initialData && initialData.words
            ? initialData.words
                .map((w) =>
                    [w.solution, w.definition].filter(Boolean).join("|")
                )
                .join("\n")
            : ""
    );

    useEffect(() => {
        if (initialData) {
            setFieldsState({
                title: initialData.title || "",
                description: initialData.description || "",
                isPublic: initialData.isPublic || false,
            });
            setWordsText(
                initialData.words
                    ? initialData.words
                        .map((w) =>
                            [w.solution, w.definition].filter(Boolean).join("|")
                        )
                        .join("\n")
                    : ""
            );
        }
    }, [initialData]);

    const fields = [
        {
            name: "title",
            label: "שם הרשימה",
            type: "text",
            required: true,
        },
        {
            name: "description",
            label: "תיאור",
            type: "textarea",
            rows: 3,
            required: true,
        },
        {
            name: "isPublic",
            label: "רשימה ציבורית (אחרים יוכלו לראות ולהשתמש ברשימה)",
            type: "checkbox",
            required: false,
        },
    ];

    const parseWordsFromText = (text) => {
        const lines = text.split("\n").filter((line) => line.trim());
        return lines
            .map((line) => {
                const parts = line.split("|").map((part) => part.trim());
                return {
                    solution: parts[0] || "",
                    definition: parts[1] || "",
                };
            })
            .filter((item) => item.solution);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setWordsText(event.target.result);
            };
            reader.readAsText(file, "UTF-8");
        }
    };

    const handleExport = () => {
        const words = parseWordsFromText(wordsText);
        const exportText = words
            .map((word) => `${word.solution}|${word.definition}`)
            .join("\n");
        const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "רשימת-מילים.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const validateWords = (wordsText) => {
        const lines = wordsText.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
            return "יש להוסיף לפחות שתי מילים";
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Count how many pipes exist
            const pipeCount = (line.match(/\|/g) || []).length;

            // Must contain exactly 1 pipe (word + definition)
            if (pipeCount !== 1) {
                return `שגיאה בשורה ${i + 1}: פורמט תקין הוא 'מילה|הגדרה' (נמצא ${pipeCount} |)`;
            }

            const parts = line.split("|").map((p) => p.trim());

            // First part (solution/word) required
            if (!parts[0]) {
                return `שגיאה בשורה ${i + 1}: שדה 'מילה' חובה לפני ה-|`;
            }

            // Second part (definition) required
            if (!parts[1]) {
                return `שגיאה בשורה ${i + 1}: חייבת להיות גם הגדרה אחרי ה-|`;
            }

            // Validate only Hebrew in the solution
            const hebrewRegex = /^[\u0590-\u05FF\s-]+$/;
            if (!hebrewRegex.test(parts[0])) {
                return `שגיאה בשורה ${i + 1}: הפתרון חייב להיות בעברית בלבד`;
            }
        }

        return null; 
    };

    const handleFormSubmit = async (formData) => {
        const isEdit = !!initialData; 

        // Validate "meta fields"
        if (!formData.title.trim()) {
            setFormError("יש להכניס שם לרשימה");
            return;
        }
        if (!formData.description.trim()) {
            setFormError("התיאור הוא שדה חובה");
            return;
        }

        // Validate words section
        const error = validateWords(wordsText);
        if (error) {
            setFormError(error);
            return;
        }
        setFormError("");

        const words = parseWordsFromText(wordsText);

        setLoading(true);
        try {
            let payload = { ...formData };
            if (
                !isEdit ||
                wordsText !==
                ([])
                    .map((w) => [w.solution, w.definition].filter(Boolean).join("|"))
                    .join("\n")
            ) {
                payload.words = words;
            }

            await onSubmit(payload);
        } catch (error) {
            console.error("error: ", error);
            setFormError(isEdit ? "שגיאה בעדכון רשימת המילים" : "שגיאה ביצירת רשימת המילים");
        } finally {
            setLoading(false);
        }
    };

    const wordsArr = parseWordsFromText(wordsText);
    const isEdit = !!initialData;

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h2 className="card-title mb-0">
                                {isEdit ? "עריכת רשימת מילים" : "יצירת רשימת מילים חדשה"}
                            </h2>
                        </div>
                        <div className="card-body">
                            <FormCard
                                fields={fields}
                                initialValues={fieldsState}
                                onSubmit={handleFormSubmit}
                                error={formError}
                                loading={loading}
                                submitLabel={isEdit ? "עדכן רשימה" : "צור רשימה"}
                                cancelLabel={"ביטול"}
                                onCancel={() => navigate("/my-wordlists")}
                            >
                                <WordListTextArea
                                    wordsText={wordsText}
                                    setWordsText={setWordsText}
                                    parseWordsFromText={parseWordsFromText}
                                    handleImport={handleImport}
                                    handleExport={handleExport}
                                />
                            </FormCard>
                        </div>
                    </div>
                    <WordsPreview words={wordsArr} />
                </div>
            </div>
        </div>
    );
};

WordListForm.propTypes = {
    initialData: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        isPublic: PropTypes.bool,
        words: PropTypes.arrayOf(
            PropTypes.shape({
                solution: PropTypes.string,
                definition: PropTypes.string,
            })
        ),
    }),
    onSubmit: PropTypes.func,
};

export default WordListForm;