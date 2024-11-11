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

const ChartPreview = ({ data, chartType, xAxisLabel, yAxisLabel }) => {
    const chartRef = useRef(null);

    const generateColors = (count) => {
        return Array(count).fill(0).map(() => 
          `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
        );
      };

      
  
    const options = {
      scales: {
        x: {
          title: {
            display: true,
            text: xAxisLabel || 'X-Axis'
          }
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel || 'Y-Axis'
          }
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
                    text: yAxisLabel || 'Values'
                }
            },
            title: {
                display: true,
                text: xAxisLabel || 'Categories',
                position: 'bottom',
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    };
  
    const chartData = {
        labels: data.map(row => row[0]),
        datasets: [{
          label: yAxisLabel || 'Values',
          data: data.map(row => row[1]),
          backgroundColor: chartType === 'pie' 
            ? generateColors(data.length)  // Different color for each pie slice
            : `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        }]
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
