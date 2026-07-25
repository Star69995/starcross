import Block from './block';
import { useCrossword } from "../../providers/CrosswordContext";

function Grid() {
    const { grid } = useCrossword();

    return (
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
                                border: '2px solid black', // Add border to each cell
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
    );
}

export default Grid;