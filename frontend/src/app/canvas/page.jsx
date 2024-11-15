'use client';

// pages/index.js
import { useState } from 'react';
import TableInput from '../components/TableInput';
import ChartPreview from '../components/ChartPreview';
import ChartControls from '../components/ChartControls';

// src/app/canvas/page.jsx
export default function Home() {
  const [tableData, setTableData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [columnLabels, setColumnLabels] = useState(['X-Axis', 'Y-Axis']);

  return (<>
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
            Automatic
          </button>
        </div>
      </div>
    </div>
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <TableInput 
            data={tableData} 
            setData={setTableData}
            chartType={chartType}
            columnLabels={columnLabels}
            setColumnLabels={setColumnLabels}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <ChartControls 
            chartType={chartType}
            setChartType={setChartType}
          />
          <ChartPreview 
            data={tableData}
            chartType={chartType}
            columnLabels={columnLabels}
          />
        </div>
      </div>
    </div>
  </>);
}
