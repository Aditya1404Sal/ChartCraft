// src/app/canvas/page.jsx
'use client';

// pages/index.js
import { useState } from 'react';
import TableInput from '../components/TableInput';
import ChartPreview from '../components/ChartPreview';
import DataPreview from '../components/DataPreview';
// src/app/canvas/page.jsx
export default function Home() {
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [columnLabels, setColumnLabels] = useState([]);

  const AnalysisTypes = [
    {
      type: 'Univariate',
      description:
        'Analysis of a single variable, focusing on distribution and central tendencies.',
      charts: ['Histogram', 'Bar Chart', 'Pie Chart', 'Box Plot'],
    },
    {
      type: 'Bivariate',
      description:
        'Analysis of relationships between two variables, examining correlations and patterns.',
      charts: [
        'Scatter Plot',
        'Grouped Box Plot',
        'Grouped Bar Plot',
        'Heatmap',
      ],
    },
    {
      type: 'Multivariate',
      description:
        'Analysis of relationships among three or more variables, exploring complex interactions.',
      charts: [
        'Pair Plot',
        'Clustered Heatmap',
        '3D Scatter Plot',
        'Parallel Coordinates',
      ],
    },
  ];

  const handleAnalysisSelect = (type, chart) => {
    setSelectedAnalysis(type);
    setSelectedChart(chart);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setShowPreview(true);
  };

  const handleColumnSelection = (columns, data) => {
    setSelectedColumns(columns);
    setTableData(data); // Make sure to initialize tableData state
    setShowPreview(false);
    setColumnLabels(columns); // Set columnLabels from selected columns
  };

  const AnalysisCard = ({ type, description, charts, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="rounded-lg border p-4 mb-4">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer"
        >
          <h2 className="text-xl font-bold">{type}</h2>
          <p className="text-gray-600 rounded-lg border p-2 mt-2">
            {description}
          </p>
        </div>
        {isExpanded && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {charts.map((chart) => (
              <button
                key={chart}
                onClick={() => onSelect(type, chart)}
                className={`p-2 border rounded ${
                  selectedChart === chart ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'
                }`}
              >
                {chart}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          ChartCraft
        </h1>
        <p className="mt-2 text-xl text-blue-100">
          Transform your data into stunning visualizations
        </p>
      </div>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-white text-indigo-600 px-6 py-2 rounded-md font-semibold hover:bg-indigo-50 transition-colors"
      >
        Auto
      </button>
    </div>
  </div>
</div>
      {/* Analysis Type Selection */}
      {AnalysisTypes.map((analysis) => (
        <AnalysisCard
          key={analysis.type}
          {...analysis}
          onSelect={handleAnalysisSelect}
        />
      ))}

      {/* File Upload Section */}
      {/* File Upload Section - Enhanced Styling */}
      {selectedChart && (
        <div className="mt-4 flex justify-center">
          <label 
            htmlFor="fileInput" 
            className="bg-gray-200 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 transition-colors"
          >
            Select CSV File
          </label>
          <input 
            type="file" 
            id="fileInput" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" // Hide the default file input
          />
        </div>
      )}

      {/* Data Preview Modal */}
      {showPreview && file && (
        <DataPreview
          file={file}
          onConfirm={handleColumnSelection}
        />
      )}

      {/* Table Input and Chart Preview would go here */}
      {selectedColumns.length > 0 && (
        <div>
          <TableInput
            data={tableData}
            setData={setTableData}
            columnLabels={columnLabels}
            setColumnLabels={setColumnLabels}
          />
          <ChartPreview
            data={tableData}
            chartType={selectedChart} // Changed from type to chartType
            columnLabels={columnLabels}
          />
        </div>
      )}
    </div>
  );
}
