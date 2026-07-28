import { useEffect, useRef, useState } from 'react';
import Block from './block';
import { useCrossword } from "../../providers/CrosswordContext";

// Cells must stay square: the table's default auto-layout only ever shrinks
// column *width* to fit the container, leaving height fixed, so wide grids on
// narrow phones turned into thin squished rectangles. Sizing is computed from
// the available width instead and applied to both width and height.
const MAX_CELL = 40;
const MIN_CELL = 32; // keeps the tappable target close to CLAUDE.md's ~40-44px guidance
const WRAP_PADDING = 18; // must match .grid-wrap padding in App.css

function Grid() {
    const { grid } = useCrossword();
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(MAX_CELL);
    const numCols = grid[0]?.length || 0;

    useEffect(() => {
        const el = containerRef.current;
        if (!el || numCols === 0) return undefined;

        const compute = () => {
            const availableWidth = el.clientWidth - WRAP_PADDING * 2;
            const size = Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(availableWidth / numCols)));
            setCellSize(size);
        };

        compute();
        const observer = new ResizeObserver(compute);
        observer.observe(el);
        return () => observer.disconnect();
    }, [numCols]);

    const tableWidth = cellSize * numCols;

    return (
        <div className="grid-wrap-outer" ref={containerRef}>
            {/* Scrolls internally (never the page) once cells hit MIN_CELL and
                the grid is still wider than the available space. */}
            <div className="grid-wrap">
                <table style={{
                    borderCollapse: 'collapse',
                    direction: 'rtl',
                    margin: 'auto',
                    width: tableWidth,
                    tableLayout: 'fixed',
                }}>
                    <tbody>
                        {grid.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => {
                                    const isBlack = cell.solution === null;
                                    return (
                                        <td key={colIndex} style={{
                                            width: cellSize,
                                            height: cellSize,
                                            border: isBlack ? 'none' : '1.5px solid var(--line)',
                                            padding: 0 // Remove default padding
                                        }}>
                                            <Block
                                                col={colIndex}
                                                row={rowIndex}
                                                cellSize={cellSize}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Grid;
