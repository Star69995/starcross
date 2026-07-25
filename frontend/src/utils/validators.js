export function isValidDefinitionsArray(data) {
    return (
        Array.isArray(data) &&
        data.every(
            item =>
                typeof item === "object" &&
                item !== null &&
                "definition" in item &&
                "solution" in item &&
                typeof item.definition === "string" &&
                typeof item.solution === "string"
        )
    );
}
