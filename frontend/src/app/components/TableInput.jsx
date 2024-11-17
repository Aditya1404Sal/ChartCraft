'use client';
// components/TableInput.js
import { useState, useEffect } from 'react';

const TableInput = ({ data, setData, chartType, columnLabels = [], setColumnLabels }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [columnTypes, setColumnTypes] = useState(['number', 'number']);

  const determineColumnTypes = (data) => {
    if (!data || !data[0]) return [];
    
    return data[0].map((_, colIndex) => {
        // Check first two rows to determine type
        const firstTwoValues = data.slice(0, 2).map(row => row[colIndex]);
        
        // If any value is NaN when converted to number, treat as text
        const isNumeric = firstTwoValues.every(value => 
            !isNaN(value) && value !== '' && value !== null
        );
        
        return isNumeric ? 'number' : 'text';
    });
};

  // Initialize columnLabels if empty
  useEffect(() => {
    if (data && data.length > 0) {
        setRows(data.length);
        setCols(data[0].length);
        const columnTypes = determineColumnTypes(data);
        setColumnTypes(columnTypes);
        // Only set initial labels if none exist
        if (!columnLabels.length) {
            const initialLabels = Array(data[0].length).fill(0)
                .map((_, i) => `Column ${i + 1}`);
            setColumnLabels(initialLabels);
        }
    } else {
        // Fall back to default initialization
        const initialData = Array(rows).fill().map(() => Array(cols).fill(''));
        setData(initialData);
        if (!columnLabels.length) {
            const initialLabels = Array(cols).fill(0)
                .map((_, i) => `Column ${i + 1}`);
            setColumnLabels(initialLabels);
        }
    }
}, [data]);

  const handleLabelChange = (colIndex, newLabel) => {
    const newLabels = [...columnLabels];
    newLabels[colIndex] = newLabel;
    setColumnLabels(newLabels);
  };

  const handleTypeChange = (colIndex, newType) => {
    const newTypes = [...columnTypes];
    newTypes[colIndex] = newType;
    setColumnTypes(newTypes);
  };

  const deleteRow = (rowIndex) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
    setRows(rows - 1);
  };

  const deleteColumn = (colIndex) => {
    const newData = data.map(row => row.filter((_, index) => index !== colIndex));
    setData(newData);
    setCols(cols - 1);
    setColumnLabels(columnLabels.filter((_, index) => index !== colIndex));
    setColumnTypes(columnTypes.filter((_, index) => index !== colIndex));
  };

  const addColumn = () => {
    setCols(cols + 1);
    setColumnLabels([...columnLabels, `Y-Axis ${cols - 1}`]);
    setColumnTypes([...columnTypes, 'number']);
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = columnTypes[colIndex] === 'number' 
      ? (parseFloat(value) || 0) 
      : value;
    setData(newData);
  };

  return (
    <div>
      <div className="relative">
        <div className="w-[100%]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 w-12"></th>
                {[...Array(cols)].map((_, colIndex) => (
                  <th key={colIndex} className="border p-2 bg-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={columnLabels[colIndex]}
                        onChange={(e) => handleLabelChange(colIndex, e.target.value)}
                        className="w-2/3 p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <select
                        value={columnTypes[colIndex]}
                        onChange={(e) => handleTypeChange(colIndex, e.target.value)}
                        className="w-1/3 p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="number">Int</option>
                        <option value="text">Text</option>
                      </select>
                      {colIndex === cols - 1 && (
                      <button
                        onClick={() => deleteColumn(colIndex)}
                        className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Add delete button as the first cell in each row */}
                  <td className="border p-2 w-12">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </td>
                  {[...Array(cols)].map((_, colIndex) => (
                    <td key={colIndex} className="border p-2">
                      <input
                        type={columnTypes[colIndex]}
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
      </div>
      <div className="mt-4 space-x-4">
        <button 
          onClick={() => setRows(rows + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Row
        </button>
        <button 
          onClick={addColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Col
        </button>
      </div>
    </div>
  );
};
export default TableInput;