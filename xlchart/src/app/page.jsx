'use client';
import React, { useState } from 'react';

export default function DataVisualizer() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [headers, setHeaders] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [chartHtml, setChartHtml] = useState('');
  const [url, setUrl] = useState('');

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
      
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setHeaders(data.headers);
      
      // Read the file content to store for later use
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        setFileData(rows);
      };
      reader.readAsText(file);

      setUploadStatus({
        type: 'success',
        message: data.message
      });
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  const generateChart = async () => {
    if (!selectedHeader || !chartType || fileData.length === 0) return;

    const headerIndex = headers.indexOf(selectedHeader);
    
    try {
      const response = await fetch('http://localhost:8080/api/chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chartType,
          column: headerIndex,
          fileData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }

      const data = await response.json();
      setChartHtml(data.html);
      const blob = new Blob([chartHtml], { type: "text/html" });
      setUrl(URL.createObjectURL(blob));
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error generating chart: ${error.message}`
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {headers.length === 0 ? (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging 
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
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                Drop your CSV file here or click to browse
              </span>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-500"
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
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadStatus.type === 'progress' ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="header-select" className="block text-sm font-medium text-gray-700">
                Select Column
              </label>
              <select
                id="header-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) => setSelectedHeader(e.target.value)}
                value={selectedHeader || ''}
              >
                <option value="">Choose a column</option>
                {headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700">
                Chart Type
              </label>
              <select
                id="chart-type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) => setChartType(e.target.value)}
                value={chartType}
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={generateChart}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Generate Chart
          </button>

          {url && (
  <iframe
    src={url}
    className="mt-6 w-full h-screen border rounded-lg" // Full width and full screen height
  />
)}

        </div>
      )}

      {uploadStatus.message && uploadStatus.type !== 'progress' && (
        <div className={`mt-4 p-4 rounded-md ${
          uploadStatus.type === 'error' 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {uploadStatus.type === 'error' ? (
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                uploadStatus.type === 'error' 
                  ? 'text-red-700' 
                  : 'text-green-700'
              }`}>
                {uploadStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}