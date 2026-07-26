import { useCrossword } from '../../providers/CrosswordContext';
function CurrentDef() {
    const { selectedDefinition } = useCrossword();

    const def = selectedDefinition?.definition || 'כאן תופיעה ההגדרה המסומנת';
    return (
        <div
            className="w-100 mb-2 p-2 border border-info shadow-lg bg-info-subtle text-center">
            <span>{def}</span>
        </div>
    );
}

export default CurrentDef;