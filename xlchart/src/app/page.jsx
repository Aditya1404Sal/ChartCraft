'use client';
'use client';
import React, { useState, useCallback } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setUploadStatus({ type: '', message: '' });
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload only CSV or Excel files.'
      });
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setUploadStatus({ type: '', message: '' });
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload only CSV or Excel files.'
      });
    }
  };

  const isValidFileType = (file) => {
    const validTypes = ['.csv', '.xlsx', '.xls'];
    return file && validTypes.some(type => 
      file.name.toLowerCase().endsWith(type)
    );
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
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setUploadStatus({
            type: 'success',
            message: `File uploaded successfully: ${result.message}`
          });
        } else {
          setUploadStatus({
            type: 'error',
            message: 'Error uploading file.'
          });
        }
      };

      xhr.onerror = () => {
        setUploadStatus({
          type: 'error',
          message: 'Network error occurred.'
        });
      };

      xhr.open('POST', 'http://localhost:8080/api/upload');
      xhr.send(formData);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
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
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            {/* Upload Icon */}
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-gray-600">
              Drop your file here or click to browse
            </span>
            <span className="text-xs text-gray-500">
              Supports CSV and Excel files
            </span>
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              {/* File Icon */}
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
              {/* X Icon */}
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

      {uploadStatus.type === 'progress' && (
        <div className="mt-4 space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-500">
            {uploadProgress}% uploaded
          </p>
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
                // Error Icon
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                // Success Icon
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