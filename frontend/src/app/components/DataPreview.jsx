// src/app/components/DataPreview.jsx
'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// components/DataPreview.jsx
const DataPreview = ({ file, onConfirm }) => {
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        preview: 15, // Show first 15 rows
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[80vh] overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([
                            ...selectedColumns,
                            header,
                          ]);
                        } else {
                          setSelectedColumns(
                            selectedColumns.filter((col) => col !== header)
                          );
                        }
                      }}
                      className="w-4 h-4 rounded-md" // Add some size adjustments
                    />
                    <span className="ml-2">{header}</span>
                  </label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
              <tr key={idx}>
                {headers.map((header) => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleConfirm}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataPreview;
