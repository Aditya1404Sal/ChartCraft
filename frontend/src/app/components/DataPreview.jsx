'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Settings, X } from 'lucide-react';

const DataPreview = ({ file, onConfirm }) => {
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [range, setRange] = useState(50);

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setPreviewData(results.data);
          setHeaders(results.meta.fields);
        },
      });
    }
  }, [file]);

  const handleConfirm = () => {
    const selectedData = previewData.map((row) =>
      selectedColumns.map((header) => row[header])
    );
    onConfirm(selectedColumns, selectedData);
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Modal Content */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gray-50 p-4 border-b rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings size={16} />
                Show rows:
              </label>
              <input
                type="number"
                min="0"
                max={previewData.length}
                value={range}
                onChange={(e) => setRange(Math.min(Math.max(1, e.target.value), previewData.length))}
                className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </button>
          </div>
          <button
            onClick={() => onConfirm([], [])}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-50">
                {headers.map((header) => (
                  <th key={header} className="p-2 border text-left">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(header)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns([...selectedColumns, header]);
                          } else {
                            setSelectedColumns(
                              selectedColumns.filter((col) => col !== header)
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">{header}</span>
                    </label>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, range).map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  {headers.map((header) => (
                    <td key={`${idx}-${header}`} className="p-2 border">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;