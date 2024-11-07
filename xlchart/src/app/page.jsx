'use client';
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function DataVisualizer() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [headers, setHeaders] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [selectedXHeader, setSelectedXHeader] = useState(null);
  const [selectedYHeader, setSelectedYHeader] = useState(null);
  const [selectedFilterHeader, setSelectedFilterHeader] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartHtml, setChartHtml] = useState('');
  const [uniqueFilterValues, setUniqueFilterValues] = useState([]);
  const [filterSearchValue, setFilterSearchValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (uploadStatus.type === 'success' || uploadStatus.type === 'error') {
      const timer = setTimeout(() => {
        setUploadStatus({ type: '', message: '' });
      }, 3000); // Disappear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  useEffect(() => {
    if (selectedFilterHeader && fileData.length > 0) {
      const filterColumnIndex = headers.indexOf(selectedFilterHeader);
      const unique = [...new Set(fileData.map(row => row[filterColumnIndex]?.trim()))].filter(Boolean);
      setUniqueFilterValues(unique);
    }
  }, [selectedFilterHeader, fileData, headers]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setUploadStatus({ type: '', message: '' });
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload only CSV files.'
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setUploadStatus({ type: '', message: '' });
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload only CSV files.'
      });
    }
  };

  const isValidFileType = (file) => {
    return file && file.name.toLowerCase().endsWith('.csv');
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload.'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus({ type: 'progress', message: 'Uploading...' });

      // Change the endpoint to match your server URL and path
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Response from server:', data);

      // Make sure 'headers' are part of the response
      if (!data.headers) {
        throw new Error('No headers returned from server');
      }

      setHeaders(data.headers);

      // Read the file content as well for later chart use
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const result = Papa.parse(text, {
          header: false,
          skipEmptyLines: true
        });
        setFileData(result.data);
      };
      reader.readAsText(file);

      setUploadStatus({
        type: 'success',
        message: 'File uploaded and processed successfully'
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  const generateChart = async () => {
    if (
      !selectedXHeader ||
      !selectedYHeader ||
      !selectedFilterHeader ||
      !filterValue ||
      !chartType ||
      fileData.length === 0
    )
      return;

    const xColumnIndex = headers.indexOf(selectedXHeader);
    const yColumnIndex = headers.indexOf(selectedYHeader);
    const filterColumnIndex = headers.indexOf(selectedFilterHeader);

    const filteredData = fileData.filter((row) => {
      return row[filterColumnIndex]?.trim() === filterValue;
    });

    try {
      const response = await fetch('http://localhost:8080/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chartType,
          xColumn: xColumnIndex,
          yColumn: yColumnIndex,
          filterColumn: filterColumnIndex,
          filterValue,
          fileData: [headers, ...filteredData]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chart');
      }

      const data = await response.json();
      setChartHtml(data.html);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error generating chart: ${error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-center">
            ChartCraft
          </h1>
          <p className="mt-2 text-xl text-center text-blue-100">
            Transform your data into stunning visualizations
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your Data</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-lg font-medium text-gray-600">
                  Drop your CSV file here or click to browse
                </span>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-md font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploadStatus.type === 'progress'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              {uploadStatus.type === 'progress' ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          {/* Upload Status Message */}
          {uploadStatus.message && uploadStatus.type !== 'progress' && (
            <div className={`mt-4 p-4 rounded-md ${uploadStatus.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
              }`}>
              <div className="flex items-center space-x-2">
                {uploadStatus.type === 'error' ? (
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm font-medium">{uploadStatus.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart Generation Section */}
        {headers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate Your Chart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Chart Type
                </label>
                <select
                  id="chart-type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={(e) => setChartType(e.target.value)}
                  value={chartType}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Chart</option>
                </select>
              </div>

              <div>
                <label htmlFor="x-column" className="block text-sm font-medium text-gray-700 mb-1">
                  X-Axis Column
                </label>
                <select
                  id="x-column"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={(e) => setSelectedXHeader(e.target.value)}
                  value={selectedXHeader}
                >
                  <option value="" disabled>Select an X-axis column</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="y-column" className="block text-sm font-medium text-gray-700 mb-1">
                  Y-Axis Column
                </label>
                <select
                  id="y-column"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={(e) => setSelectedYHeader(e.target.value)}
                  value={selectedYHeader}
                >
                  <option value="" disabled>Select a Y-axis column</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-column" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Column
                </label>
                <select
                  id="filter-column"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={(e) => setSelectedFilterHeader(e.target.value)}
                  value={selectedFilterHeader}
                >
                  <option value="" disabled>Select a filter column</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label htmlFor="filter-value" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Value
                </label>
                <input
                  type="text"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Search filter value..."
                  value={filterValue || filterSearchValue}
                  onChange={(e) => {
                    setFilterSearchValue(e.target.value);
                    setFilterValue('');
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                  <div
                    className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto"
                    onBlur={() => setIsDropdownOpen(false)}
                  >
                    {uniqueFilterValues
                      .filter(value => value.toLowerCase().includes(filterSearchValue.toLowerCase()))
                      .map((value, index) => (
                        <div
                          key={index}
                          className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                          onClick={() => {
                            setFilterValue(value);
                            setFilterSearchValue('');
                            setIsDropdownOpen(false);
                          }}
                        >
                          {value}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={generateChart}
              className="w-full mt-4 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors text-lg font-semibold"
            >
              Generate Chart
            </button>

            {chartHtml && (
              <div className="mt-6 border-4 border-indigo-200 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={chartHtml}
                  className="w-full h-[600px]"
                  title="Generated Chart"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}