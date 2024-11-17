// src/app/components/ChartPreview.jsx
'use client';
// components/ChartPreview.js
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import * as htmlToImage from 'html-to-image';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


const ChartPreview = ({ data, chartType, columnLabels }) => {
  const chartRef = useRef(null);
  const chartData = {
    labels: data.map((row) => row[0]),
    datasets: [
      {
        label: columnLabels[1] || 'Data',
        data: data.map((row) => row[1]),
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: columnLabels[0] || 'X-Axis',
        },
      },
      y: {
        title: {
          display: true,
          text: columnLabels[1] || 'Y-Axis',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };
  
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: columnLabels[1] || 'Values',
        },
      },
      title: {
        display: true,
        text: columnLabels[0] || 'Categories',
        position: 'bottom',
      },
    },
  };
  

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={pieOptions} />;
      case 'scatter':
        return <Scatter ref={chartRef} data={chartData} options={options} />;
      // Placeholder for unsupported chart types
      case 'Pair Plot':
      case 'Clustered Heatmap':
      case '3D Scatter Plot':
      case 'Parallel Coordinates':
        return (
          <div className="text-center text-gray-500">
            This chart type is not yet supported.
          </div>
        );
      default:
        return null;
    }
  };

  const downloadChart = async () => {
    try {
      const element = chartRef.current;
      if (!element) return;
      // For PNG format
      const dataUrl = await htmlToImage.toPng(element.canvas);
      const link = document.createElement('a');
      link.download = `chart.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  return (
    <div>
      <div ref={chartRef} className="mb-4">
        {renderChart()}
      </div>
      <button
        onClick={downloadChart}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Download as PNG
      </button>
    </div>
  );
};

export default ChartPreview;
