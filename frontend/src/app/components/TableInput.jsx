'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, X } from 'lucide-react';
import { cleanNumericData } from './data-cleaning-utils';

const TableInput = ({ data, setData, chartType, columnLabels = [], setColumnLabels }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [columnTypes, setColumnTypes] = useState(['number', 'number']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const determineColumnTypes = (data) => {
    if (!data || !data[0]) return [];
    return data[0].map((_, colIndex) => {
      const firstTwoValues = data.slice(0, 2).map(row => row[colIndex]);
      const isNumeric = firstTwoValues.every(value => 
        !isNaN(value) && value !== '' && value !== null
      );
      return isNumeric ? 'number' : 'text';
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data.length);
      setCols(data[0].length);
      const columnTypes = determineColumnTypes(data);
      setColumnTypes(columnTypes);
      if (!columnLabels.length) {
        const initialLabels = Array(data[0].length).fill(0)
          .map((_, i) => `Column ${i + 1}`);
        setColumnLabels(initialLabels);
      }
    } else {
      const initialData = Array(rows).fill().map(() => Array(cols).fill(''));
      setData(initialData);
      if (!columnLabels.length) {
        const initialLabels = Array(cols).fill(0)
          .map((_, i) => `Column ${i + 1}`);
        setColumnLabels(initialLabels);
      }
    }
  }, []);

  const handleLabelChange = (colIndex, newLabel) => {
    const newLabels = [...columnLabels];
    newLabels[colIndex] = newLabel;
    setColumnLabels(newLabels);
  };

  // Initiate Data cleaning
  const handleTypeChange = (colIndex, newType) => {
    const newTypes = [...columnTypes];
    newTypes[colIndex] = newType;
    setColumnTypes(newTypes);
  
    // Update the data to match the new type
    const newData = data.map(row => {
      const newRow = [...row];
      newRow[colIndex] = cleanNumericData(row[colIndex], newType);
      return newRow;
    });
    setData(newData);
  };
  
  // Also update the handleCellChange function to use the cleaning utility
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = columnTypes[colIndex] === 'text' 
      ? value 
      : cleanNumericData(value, columnTypes[colIndex]);
    setData(newData);
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
    const newCols = cols + 1;
    setCols(newCols);
    setColumnLabels([...columnLabels, `Column ${newCols}`]);
    setColumnTypes([...columnTypes, 'number']);
    const newData = data.map(row => [...row, '']);
    setData(newData);
  };

  const addRow = () => {
    const newRows = rows + 1;
    setRows(newRows);
    const newData = [...data, Array(cols).fill('')];
    setData(newData);
  };

  const PreviewTable = () => (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 w-12"></th>
              {columnLabels.map((label, index) => (
                <th key={index} className="border p-2 bg-gray-100">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border p-2 w-12 text-center">{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white"></div>
      </div>
    </div>
  );

  const FullTable = () => (
    <div className="max-h-[60vh] overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
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
                    <option value="number">Numerical</option>
                    <option value="numbercomma">Numerical with ( , )</option>
                    <option value="numbercurrency">Numerical with ( $ )</option>
                    <option value="numbercombocomacurrency">Numerical with ( , ) and ( $ )</option>
                    <option value="numberpercentage">Numerical with ( % )</option>
                    <option value="numberdenomination">Numerical with ( $100 B or M )</option>
                    <option value="text">Text</option>
                  </select>
                  <button
                    onClick={() => deleteColumn(colIndex)}
                    className="w-half p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border p-2 w-12">
                <button
                  onClick={() => deleteRow(rowIndex)}
                  className="w-half p-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
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
  );

  return (
    <div className="space-y-4">
      <PreviewTable />
      
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Trigger asChild>
          <button className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 hover:text-blue-800">
            <span>Inspect data</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg animate-content-show">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">
                Data Editor
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full h-6 w-6 inline-flex items-center justify-center text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            
            <FullTable />
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={addRow}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Row
              </button>
              <button 
                onClick={addColumn}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Column
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default TableInput;