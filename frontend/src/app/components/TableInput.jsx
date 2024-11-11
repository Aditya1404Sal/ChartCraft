'use client';
// components/TableInput.js
import { useState, useEffect } from 'react';

const TableInput = ({ data, setData, chartType, onAxisLabelsChange }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
  const [xDataType, setXDataType] = useState('number');
  const [yDataType, setYDataType] = useState('number');

  const getColumnNames = () => {
    return chartType === 'pie' ? ['Labels', 'Values'] : ['X-Axis', 'Y-Axis'];
  };

  useEffect(() => {
    onAxisLabelsChange(xAxisLabel, yAxisLabel);
  }, [xAxisLabel, yAxisLabel, onAxisLabelsChange]);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    
    // Handle different data types
    if (colIndex === 0) {
      // X-axis data
      newData[rowIndex][colIndex] = xDataType === 'number' ? (parseFloat(value) || 0) : value;
    } else {
      // Y-axis data
      newData[rowIndex][colIndex] = yDataType === 'number' ? (parseFloat(value) || 0) : value;
    }
    
    setData(newData);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <input
            type="text"
            placeholder="X-Axis Label"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={xDataType}
            onChange={(e) => setXDataType(e.target.value)}
            className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Number</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Y-Axis Label"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={yDataType}
            onChange={(e) => setYDataType(e.target.value)}
            className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Number</option>
            <option value="text">Text</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[...Array(cols)].map((_, colIndex) => (
                <th key={colIndex} className="border p-2 bg-gray-100">
                  {getColumnNames()[colIndex] || `Column ${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(cols)].map((_, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    <input
                      type={colIndex === 0 ? xDataType : yDataType}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={data[rowIndex]?.[colIndex] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => setRows(rows + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Row
        </button>
      </div>
    </div>
  );
};

export default TableInput;
