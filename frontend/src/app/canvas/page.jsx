// src/app/canvas/page.jsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, RefreshCw } from 'lucide-react';
import StatisticalAnalysisPanel from '../components/StatisticalAnalysisPanel';
import TableInput from '../components/TableInput';
import ChartPreview from '../components/ChartPreview';
import DataPreview from '../components/DataPreview';
import ChartConfigPanel from '../components/ChartConfigPanel';

const Home = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isChartPanelOpen, setIsChartPanelOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [columnLabels, setColumnLabels] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = ({ analysisType, category, method }) => {
    setSelectedMethod(method);
    setIsChartPanelOpen(true);
    setIsPanelOpen(false);
    setSelectedAnalysis(analysisType);
    // You can add specific chart mappings based on the selected method
    // For example:
    const chartMappings = {
      histogram: 'Histogram',
      boxplot: 'Box Plot',
      scatter: 'Scatter Plot',
      heatmap: 'Heatmap'
    };
    setSelectedChart(chartMappings[method.id] || null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowPreview(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePreviewChart = (config) => {
    setSelectedChart(config.chartType);
    setSelectedColumns(config.columns);
    // You can add additional logic here to update your chart preview
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setShowPreview(true);
    }
  };

  const resetDataset = () => {
    setFile(null);
    setSelectedColumns([]);
    setTableData([]);
    setColumnLabels([]);
    setShowPreview(false);
    setSelectedMethod(null);
    setSelectedAnalysis(null);
    setSelectedChart(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Panel */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${
          isPanelOpen ? 'w-80' : 'w-0'
        } overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Statistical Analysis</h2>
          <StatisticalAnalysisPanel onMethodSelect={handleMethodSelect} />
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-gray-400 hover:bg-gray-500 text-white shadow-lg rounded-r-lg p-2 z-10 transition-colors"
      >
        {isPanelOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isPanelOpen ? 'ml-80' : 'ml-0'} ${isChartPanelOpen ? 'mr-[50%]' : 'mr-0'}`}>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-8 rounded-lg shadow-md mb-8">
            <h1 className="text-3xl font-bold">StatCraft</h1>
            <p className="text-blue-100 mt-2">Advanced Statistical Analysis Platform</p>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <Upload className="w-12 h-12 text-blue-500" />
                  <span className="text-lg font-medium text-gray-600">
                    Drop your CSV file here or click to browse
                  </span>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Select File
                  </button>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={resetDataset}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Dataset</span>
                  </button>
                </div>

                {selectedMethod && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2">Selected Analysis</h3>
                    <div className="text-sm text-gray-600">
                      <p>Method: {selectedMethod.name}</p>
                      <p className="mt-1">{selectedMethod.description}</p>
                    </div>
                  </div>
                )}

                {/* Table Input Component */}
                {selectedColumns.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <TableInput
                      data={tableData}
                      setData={setTableData}
                      columnLabels={columnLabels}
                      setColumnLabels={setColumnLabels}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Data Preview Modal */}
      {showPreview && file && (
        <DataPreview
          file={file}
          onConfirm={(columns, data) => {
            setSelectedColumns(columns);
            setTableData(data);
            setColumnLabels(columns);
            setShowPreview(false);
          }}
        />
      )}

      <ChartConfigPanel
        isOpen={isChartPanelOpen}
        setIsOpen={setIsChartPanelOpen}
        selectedMethod={selectedMethod}
        columnLabels={columnLabels}
        onPreviewChart={handlePreviewChart}
        selectedAnalysis={selectedAnalysis}
        data={tableData}
      />

      
      
    </div>
  );
};

export default Home;