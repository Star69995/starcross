import Block from './block';
import { useCrossword } from "../../providers/CrosswordContext";

function Grid() {
    const { grid } = useCrossword();

    return (
        <div className="grid-wrap">
            <table style={{
                borderCollapse: 'collapse',
                direction: 'rtl',
                margin: 'auto'
            }}>
                <tbody>
                    {grid.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => {
                                const isBlack = cell.solution === null;
                                return (
                                    <td key={colIndex} style={{
                                        width: '40px',
                                        height: '40px',
                                        border: isBlack ? 'none' : '1.5px solid var(--line)',
                                        padding: 0 // Remove default padding
                                    }}>
                                        <Block
                                            col={colIndex}
                                            row={rowIndex}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Grid;