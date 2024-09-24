'use client';
import React, { useState } from 'react';

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`File uploaded successfully: ${result.message}`);
      } else {
        setUploadStatus('Error uploading file.');
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload CSV or Excel File</h2>
      <form onSubmit={handleFileUpload} className="space-y-4">
        <div>
          <label htmlFor="file-input" className="block font-medium text-gray-700 mb-1">
            Choose a file:
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
        >
          Upload
        </button>
      </form>
      {uploadStatus && <p className="mt-4 text-gray-600">{uploadStatus}</p>}
    </div>
  );
}

export default FileUpload;