'use client';
// components/ChartControls.js
// components/ChartControls.js
const ChartControls = ({ chartType, setChartType }) => {
    return (
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chart Type
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Chart</option>
          </select>
        </div>
      </div>
    );
  };
  
  export default ChartControls;
  