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
                            {row.map((cell, colIndex) => (
                                <td key={colIndex} style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1.5px solid var(--line)', // Add border to each cell
                                    padding: 0 // Remove default padding
                                }}>
                                    <Block
                                        col={colIndex}
                                        row={rowIndex}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Grid;