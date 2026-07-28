import { useEffect } from 'react';
import { CrosswordProvider, useCrossword } from '../providers/CrosswordContext';
import Grid from '../components/board/Grid';
import HebrewKeyboard from '../components/board/HebrewKeyboard';

const TEST_GRID = [[
    { solution: 'ל', value: '', definitions: [{ definition: 'test', isVertical: false }], isHighlighted: false, definitionNumber: 1 },
    { solution: 'ש', value: '', definitions: [{ definition: 'test', isVertical: false }], isHighlighted: false, definitionNumber: null },
    { solution: 'ו', value: '', definitions: [{ definition: 'test', isVertical: false }], isHighlighted: false, definitionNumber: null },
    { solution: 'ן', value: '', definitions: [{ definition: 'test', isVertical: false }], isHighlighted: false, definitionNumber: null },
]];

const WORD_POSITIONS = [{ definition: 'test', row: 0, col: 0, isVertical: false, definitionNumber: 1 }];

const DEFS_USED = { across: [{ number: 1, text: 'test', isAnswered: false }], down: [] };

function Inner() {
    const { setGridData } = useCrossword();
    useEffect(() => {
        setGridData({ grid: TEST_GRID, definitionsUsed: DEFS_USED, wordPositions: WORD_POSITIONS });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div>
            <Grid />
            <HebrewKeyboard />
        </div>
    );
}

export default function DebugSolverTest() {
    return <CrosswordProvider><Inner /></CrosswordProvider>;
}
