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
  Legend 
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

  const generateColors = (count) => {
      return Array(count).fill(0).map(() => 
          `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
      );
  };

  // Group data by X-axis values
  const groupedData = data.reduce((acc, row) => {
      const xValue = row[0];
      if (!acc[xValue]) {
          acc[xValue] = [];
      }
      // Collect all Y values (columns after the first one)
      for (let i = 1; i < row.length; i++) {
          if (row[i] !== undefined) {
              if (!acc[xValue][i-1]) acc[xValue][i-1] = [];
              acc[xValue][i-1].push(row[i]);
          }
      }
      return acc;
  }, {});

  const options = {
    scales: {
        x: {
            title: {
                display: true,
                text: columnLabels[0] || 'X-Axis'
            }
        },
        y: {
            title: {
                display: true,
                text: columnLabels[1] || 'Y-Axis'
            }
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    }
};


const pieOptions = {
  plugins: {
      legend: {
          display: true,
          position: 'right',
          title: {
              display: true,
              text: columnLabels[1] || 'Values'
          }
      },
      title: {
          display: true,
          text: columnLabels[0] || 'Categories',
          position: 'bottom'
      }
  }
};

const chartData = {
  labels: Object.keys(groupedData),
  datasets: Object.values(groupedData)[0]?.map((_, colIndex) => ({
    label: columnLabels[colIndex + 1] || `Series ${colIndex + 1}`,
      data: Object.values(groupedData).map(yValues => yValues[colIndex]?.[0] || 0),
      backgroundColor: chartType === 'pie' 
          ? generateColors(Object.keys(groupedData).length)
          : `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
      borderColor: chartType === 'line' 
          ? `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`
          : undefined
  })) || []
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
    
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={pieOptions}/>;
      case 'scatter':
        return <Scatter ref={chartRef} data={chartData} options={options} />;
      default:
        return null;
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
