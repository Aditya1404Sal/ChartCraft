'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Legend,
  Cell
} from 'recharts';
import Plot from 'react-plotly.js';


const ChartConfigPanel = ({
  isOpen,
  setIsOpen,
  selectedMethod,
  columnLabels,
  onPreviewChart,
  selectedAnalysis,
  data // Array of data objects
}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartType, setChartType] = useState('');
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    setSelectedColumns([]);
    setChartType('');
    setResults(null);
    setChartData(null);
  }, [selectedMethod]);

  const calculateResults = () => {
    if (selectedAnalysis === "univariate") {
      console.log('Calculating results with:', {
        selectedAnalysis,
        selectedColumns,
        data,
        selectedMethod
      });
      if (!selectedColumns.length || !data || !selectedMethod) return;

      const column = selectedColumns[0];
      console.log('Selected column:', column);
      console.log('Available columns:', columnLabels);
      console.log('Raw data sample:', data.slice(0, 3));

      // Find the index of the selected column in columnLabels
      const columnIndex = columnLabels.findIndex(
        label => label.trim() === column.trim()
      );

      console.log('Column index:', columnIndex);

      if (columnIndex === -1) {
        console.error('Column not found in labels');
        return;
      }

      const values = data
        .map(row => {
          const value = parseFloat(row[columnIndex]);
          return value;
        })
        .filter(val => !isNaN(val) && val !== null && val !== undefined);

      console.log('Final processed values:', values);

      switch (selectedMethod.id) {
        case 'mean': {
          const sorted = [...values].sort((a, b) => a - b);
          const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
          setResults({ value: mean, label: 'Mean' });

          // Create histogram data for visualization
          const histogramData = createHistogramData(sorted);
          setChartData(histogramData);
          setChartType('bar');
          break;
        }
        case 'median': {
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
          setResults({ value: median.toFixed(2), label: 'Median' });

          // Create box plot data using Plotly format
          const boxPlotData = createBoxPlotData(sorted);
          setChartData(boxPlotData);
          setChartType('boxplot');
          break;
        }
        case 'boxplot' : {
          const sorted = [...values].sort((a, b) => a - b);
          const boxPlotData = createBoxPlotData(sorted);
          setChartData(boxPlotData);
          setChartType('boxplot');
          break;
        }
        case 'histogram' : {
          const sorted = [...values].sort((a, b) => a - b);
          const histogramData = createHistogramData(sorted);
          setChartData(histogramData);
          setChartType('bar');
          break;
        }
        case 'mode': {
          const frequency = {};
          values.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
          });
          const mode = Object.entries(frequency)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
          setResults({ value: parseFloat(mode).toFixed(2), label: 'Mode' });

          // Create frequency distribution
          const freqData = Object.entries(frequency).map(([value, freq]) => ({
            value: parseFloat(value).toFixed(2),
            frequency: freq
          }));
          break;
        }
        case 'variance': {
          const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
          const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
          setResults({ value: variance.toFixed(2), label: 'Variance' });

          // Create variance visualization
          const varianceData = values.map((val, idx) => ({
            index: idx,
            value: val,
            deviation: Math.pow(val - mean, 2)
          }));
          setChartData(varianceData);
          setChartType('line');
          break;
        }
        case 'std': {
          const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
          const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          setResults({ value: std.toFixed(2), label: 'Standard Deviation' });

          // Create standard deviation visualization
          const stdData = createStdDeviationData(values, mean, std);
          setChartData(stdData);
          setChartType('line');
          break;
        }
        case 'skewness': {
          const n = values.length;
          const mean = values.reduce((acc, val) => acc + val, 0) / n;
          const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);

          // Calculate skewness using the third standardized moment
          const skewness = values.reduce((acc, val) =>
            acc + Math.pow((val - mean) / std, 3), 0) / n;

          // Calculate standard error of skewness
          const seSkewness = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));

          // Calculate z-score for significance test
          const zScore = skewness / seSkewness;
          const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

          setResults({
            value: skewness.toFixed(4),
            label: 'Skewness',
            interpretation: `p-value: ${pValue.toFixed(4)} (${Math.abs(skewness) > 2 * seSkewness ? 'Significant' : 'Not significant'})
                            \n${skewness < -0.5 ? 'Negatively skewed' : skewness > 0.5 ? 'Positively skewed' : 'Approximately symmetric'}`
          });

          // Create visualization showing distribution with skewness
          const histogramData = createSkewnessHistogram(values, mean, std, skewness);
          setChartData(histogramData);
          setChartType('skewness');
          break;
        }

        case 'kurtosis': {
          const n = values.length;
          const mean = values.reduce((acc, val) => acc + val, 0) / n;
          const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n);

          // Calculate kurtosis using the fourth standardized moment - 3 (excess kurtosis)
          const kurtosis = values.reduce((acc, val) =>
            acc + Math.pow((val - mean) / std, 4), 0) / n - 3;

          // Calculate standard error of kurtosis
          const seKurtosis = Math.sqrt((24 * n * (n - 1) * (n - 1)) /
            ((n - 3) * (n - 2) * (n + 3) * (n + 5)));

          // Calculate z-score for significance test
          const zScore = kurtosis / seKurtosis;
          const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

          setResults({
            value: kurtosis.toFixed(4),
            label: 'Excess Kurtosis',
            interpretation: `p-value: ${pValue.toFixed(4)} (${Math.abs(kurtosis) > 2 * seKurtosis ? 'Significant' : 'Not significant'})
                            \n${kurtosis < -0.5 ? 'Platykurtic (light-tailed)' :
                kurtosis > 0.5 ? 'Leptokurtic (heavy-tailed)' :
                  'Mesokurtic (normal-tailed)'}`
          });

          // Create visualization showing distribution with kurtosis
          const histogramData = createKurtosisHistogram(values, mean, std, kurtosis);
          setChartData(histogramData);
          setChartType('kurtosis');
          break;
        }
        // Add remaining skewness test, kurtosis test, normality test (working model because current version doesn't work)
      }
    } else if (selectedAnalysis === "bivariate") {
      console.log('Calculating results with:', {
        selectedAnalysis,
        selectedColumns,
        data,
        selectedMethod
      });
      if (!selectedColumns.length || !data || !selectedMethod) return;

      const column1 = selectedColumns[0];
      const column2 = selectedColumns[1];
      console.log('Selected column 1:', column1);
      console.log('Selected column 2:', column2);
      console.log('Available columns:', columnLabels);
      console.log('Raw data sample:', data.slice(0, 3));

      // Find the index of the selected column in columnLabels
      const columnIndex1 = columnLabels.findIndex(
        label => label.trim() === column1.trim()
      );

      const columnIndex2 = columnLabels.findIndex(
        label => label.trim() === column2.trim()
      )

      console.log('Column index 1:', columnIndex1);
      console.log('Column index 2:', columnIndex2);


      if (columnIndex1 === -1 || columnIndex2 === -1) {
        console.error('Column not found in labels');
        return;
      }

      const values1 = data
        .map(row => {
          const value = parseFloat(row[columnIndex1]);
          return value;
        })
        .filter(val => !isNaN(val) && val !== null && val !== undefined);

      const values2 = data
        .map(row => {
          const value = parseFloat(row[columnIndex2]);
          return value;
        })
        .filter(val => !isNaN(val) && val !== null && val !== undefined);


      console.log('Final processed values:');
      console.log(values1);
      console.log(values2);

      switch (selectedMethod.id) {
        case 'pearson': {
          const { coefficient, pValue } = calculatePearsonCorrelation(values1, values2);
          setResults({
            value: coefficient.toFixed(4),
            label: 'Pearson Correlation',
            interpretation: `p-value: ${pValue.toFixed(4)} (${pValue < 0.05 ? 'Significant' : 'Not significant'})`
          });

          const scatterData = createScatterData(values1, values2);
          setChartData(scatterData);
          setChartType('scatter');
          break;
        }
        case 'spearman': {
          const { coefficient, pValue } = calculateSpearmanCorrelation(values1, values2);
          setResults({
            value: coefficient.toFixed(4),
            label: 'Spearman Correlation',
            interpretation: `p-value: ${pValue.toFixed(4)} (${pValue < 0.05 ? 'Significant' : 'Not significant'})`
          });

          const scatterData = createScatterData(values1, values2);
          setChartData(scatterData);
          setChartType('scatter');
          break;
        }
        case 'linear_regression': {
          const { slope, intercept, rSquared } = calculateLinearRegression(values1, values2);
          setResults({
            value: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
            label: 'Linear Regression',
            interpretation: `R² = ${rSquared.toFixed(4)}`
          });

          const regressionData = createRegressionData(values1, values2, slope, intercept);
          setChartData(regressionData);
          setChartType('regression');
          break;
        }
        case 'chi_square': {
          const { statistic, pValue } = calculateChiSquare(values1, values2);
          setResults({
            value: statistic.toFixed(4),
            label: 'Chi-Square Statistic',
            interpretation: `p-value: ${pValue.toFixed(4)} (${pValue < 0.05 ? 'Significant' : 'Not significant'})`
          });

          const visualData = transformData(values1,values2);
          setChartData(visualData);
          setChartType('chi_square');
          break;
        }
        case 'ttest': {
          const { statistic, pValue } = calculateTTest(values1, values2);
          setResults({
            value: statistic.toFixed(4),
            label: 'T-Statistic',
            interpretation: `p-value: ${pValue.toFixed(4)} (${pValue < 0.05 ? 'Significant' : 'Not significant'})`
          });

          const boxPlotData = createDualBoxPlotData(values1, values2,selectedColumns);
          setChartData(boxPlotData);
          setChartType('dualBoxPlot');
          break;
        }
      }
      // get the column 1 and column 2 data here and then have a switch statement going through the different methods and do needed statistical grapphing
    }
  };

  //chi-square visual-transformer
  const transformData = (values1, values2) => {
    // Get unique categories
    const categories = Array.from(new Set([...values1, ...values2])).sort();
    
    // Calculate observed frequencies
    const observed1 = categories.map(cat => values1.filter(v => v === cat).length);
    const observed2 = categories.map(cat => values2.filter(v => v === cat).length);
    
    // Calculate expected frequencies
    const n1 = values1.length;
    const n2 = values2.length;
    const expected = categories.map(cat => {
      const totalInCategory = observed1[categories.indexOf(cat)] + observed2[categories.indexOf(cat)];
      return {
        group1: (totalInCategory * n1) / (n1 + n2),
        group2: (totalInCategory * n2) / (n1 + n2)
      };
    });

    // Calculate chi-square contributions
    const contributions = categories.map((cat, i) => {
      const contrib1 = Math.pow(observed1[i] - expected[i].group1, 2) / expected[i].group1;
      const contrib2 = Math.pow(observed2[i] - expected[i].group2, 2) / expected[i].group2;
      return contrib1 + contrib2;
    });

    // Prepare data for visualization
    return {
      frequencies: categories.map((cat, i) => ({
        category: cat.toString(),
        'Observed Group 1': observed1[i],
        'Expected Group 1': expected[i].group1,
        'Observed Group 2': observed2[i],
        'Expected Group 2': expected[i].group2,
      })),
      contributions: categories.map((cat, i) => ({
        category: cat.toString(),
        contribution: contributions[i],
      }))
    };
  };

  const createBoxPlotData = (sorted) => {
    return [{
      y: sorted,
      type: 'box',
      name: 'Distribution',
      boxpoints: 'outliers',
      marker: {
        color: '#8884d8'
      }
    }];
  };

  const createDualBoxPlotData = (values1, values2, labels) => {
    return [
      {
        y: values1,
        type: 'box',
        name: labels[0] || 'Group 1',
        boxpoints: 'outliers',
        marker: {
          color: '#8884d8'
        }
      },
      {
        y: values2,
        type: 'box',
        name: labels[1] || 'Group 2',
        boxpoints: 'outliers',
        marker: {
          color: '#82ca9d'
        }
      }
    ];
  };

  // Chi-square test calculation
const calculateChiSquare = (values1, values2) => {
  // Create frequency tables
  const freqTable1 = {};
  const freqTable2 = {};
  const uniqueValues = new Set([...values1, ...values2]);

  uniqueValues.forEach(value => {
    freqTable1[value] = values1.filter(v => v === value).length;
    freqTable2[value] = values2.filter(v => v === value).length;
  });

  // Calculate expected frequencies
  const n1 = values1.length;
  const n2 = values2.length;
  const chiSquare = Array.from(uniqueValues).reduce((acc, value) => {
    const o1 = freqTable1[value] || 0;
    const o2 = freqTable2[value] || 0;
    const e1 = (n1 * (o1 + o2)) / (n1 + n2);
    const e2 = (n2 * (o1 + o2)) / (n1 + n2);
    
    return acc + ((o1 - e1) ** 2) / e1 + ((o2 - e2) ** 2) / e2;
  }, 0);

  // Calculate degrees of freedom
  const df = uniqueValues.size - 1;
  
  // Calculate p-value using chi-square distribution approximation
  const pValue = 1 - chiSquareCDF2(chiSquare, df);

  return { statistic: chiSquare, pValue };
};

// T-test calculation (independent two-sample t-test)
const calculateTTest = (values1, values2) => {
  // Calculate means
  const mean1 = values1.reduce((acc, val) => acc + val, 0) / values1.length;
  const mean2 = values2.reduce((acc, val) => acc + val, 0) / values2.length;

  // Calculate variances
  const variance1 = values1.reduce((acc, val) => acc + (val - mean1) ** 2, 0) / (values1.length - 1);
  const variance2 = values2.reduce((acc, val) => acc + (val - mean2) ** 2, 0) / (values2.length - 1);

  // Pooled standard error
  const pooledSE = Math.sqrt(variance1 / values1.length + variance2 / values2.length);

  // Calculate t-statistic
  const tStatistic = (mean1 - mean2) / pooledSE;

  // Calculate degrees of freedom (Welch–Satterthwaite equation)
  const df = ((variance1 / values1.length + variance2 / values2.length) ** 2) /
    (((variance1 / values1.length) ** 2) / (values1.length - 1) +
     ((variance2 / values2.length) ** 2) / (values2.length - 1));

  // Calculate p-value using t-distribution approximation
  const pValue = 2 * (1 - studentTCDF(Math.abs(tStatistic), df));

  return { statistic: tStatistic, pValue };
};

// Helper function: Chi-square CDF approximation
const chiSquareCDF2 = (x, df) => {
  const gamma = (z) => {
    if (z === 1) return 1;
    if (z === 0.5) return Math.sqrt(Math.PI);
    return (z - 1) * gamma(z - 1);
  };

  const lowerGamma = (s, x) => {
    const steps = 100;
    const h = x / steps;
    let sum = 0;
    
    for (let i = 0; i < steps; i++) {
      const t = i * h;
      sum += h * (t ** (s - 1) * Math.exp(-t));
    }
    
    return sum;
  };

  return lowerGamma(df / 2, x / 2) / gamma(df / 2);
};

// Helper function: Student's t-distribution CDF approximation
const studentTCDF = (t, df) => {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(df / 2, 0.5, x);
};

// Helper function: Incomplete beta function approximation
const incompleteBeta = (a, b, x) => {
  const betaFunction = (a, b) => {
    return Math.exp(
      logGamma(a) + logGamma(b) - logGamma(a + b)
    );
  };

  const logGamma = (z) => {
    const c = [
      76.18009172947146,
      -86.50532032941677,
      24.01409824083091,
      -1.231739572450155,
      0.1208650973866179e-2,
      -0.5395239384953e-5
    ];
    let sum = 1.000000000190015;
    for (let i = 0; i < 6; i++) {
      sum += c[i] / (z + i + 1);
    }
    return (
      (Math.log(2.5066282746310005 * sum) - 5.0) +
      (z + 0.5) * Math.log(z + 4.5) -
      (z + 4.5)
    );
  };

  const series = (a, b, x) => {
    let term = 1;
    let sum = 1;
    for (let n = 0; n < 200; n++) {
      term *= (a + n) * x / (b + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return sum;
  };

  if (x === 0) return 0;
  if (x === 1) return 1;

  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );

  return x < (a + 1) / (a + b + 2)
    ? bt * series(a, a + b, x) / a
    : 1 - bt * series(b, a + b, 1 - x) / b;
};

// Visualization helper for Chi-square test
const createContingencyTable = (values1, values2) => {
  const uniqueValues = Array.from(new Set([...values1, ...values2])).sort((a, b) => a - b);
  
  return uniqueValues.map(val1 => ({
    name: val1.toString(),
    ...Object.fromEntries(
      uniqueValues.map(val2 => [
        val2.toString(),
        values1.filter(v1 => v1 === val1).length +
        values2.filter(v2 => v2 === val2).length
      ])
    )
  }));
};

  // Helper functions for data processing
  const createHistogramData = (values) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.ceil(Math.sqrt(values.length));
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
      bins[binIndex]++;
    });

    return bins.map((count, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      frequency: count
    }));
  };

  const createStdDeviationData = (values, mean, std) => {
    return values.map((val, idx) => ({
      index: idx,
      value: val,
      mean: mean,
      upperBound: mean + std,
      lowerBound: mean - std
    }));
  };

  const calculatePearsonCorrelation = (x, y) => {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    
    const covXY = x.reduce((acc, xi, i) => acc + (xi - meanX) * (y[i] - meanY), 0) / n;
    const varX = x.reduce((acc, xi) => acc + Math.pow(xi - meanX, 2), 0) / n;
    const varY = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0) / n;
    
    const coefficient = covXY / Math.sqrt(varX * varY);
    const zScore = Math.sqrt(n - 3) * 0.5 * Math.log((1 + coefficient) / (1 - coefficient));
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    return { coefficient, pValue };
  };

  const calculateSpearmanCorrelation = (x, y) => {
    const n = x.length;
    
    // Convert to ranks
    const xRanks = getRanks(x);
    const yRanks = getRanks(y);
    
    return calculatePearsonCorrelation(xRanks, yRanks);
  };

  const getRanks = (arr) => {
    const sorted = arr.map((v, i) => ({ value: v, index: i }))
      .sort((a, b) => a.value - b.value);
    
    const ranks = new Array(arr.length);
    for (let i = 0; i < sorted.length; i++) {
      ranks[sorted[i].index] = i + 1;
    }
    
    return ranks;
  };

  const calculateLinearRegression = (x, y) => {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calculate R-squared
    const yPred = x.map(xi => slope * xi + intercept);
    const ssRes = y.reduce((acc, yi, i) => acc + Math.pow(yi - yPred[i], 2), 0);
    const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    
    return { slope, intercept, rSquared };
  };

  const normalCDF = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  // Helper functions for creating chart data
  const createScatterData = (x, y) => {
    return x.map((xi, i) => ({
      x: xi,
      y: y[i]
    }));
  };

  const createRegressionData = (x, y, slope, intercept) => {
    const scatterData = createScatterData(x, y);
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    
    // Add regression line points
    const regressionLine = [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
    
    return { scatter: scatterData, line: regressionLine };
  };

  const createSkewnessHistogram = (values, mean, std, skewness) => {
    const histData = createHistogramData(values);

    // Add theoretical normal curve for comparison
    const x = Array.from({ length: 100 }, (_, i) =>
      mean - 3 * std + (6 * std * i) / 99
    );
    const normalCurve = x.map(xi => ({
      x: xi,
      y: (1 / (std * Math.sqrt(2 * Math.PI))) *
        Math.exp(-Math.pow(xi - mean, 2) / (2 * std * std))
    }));

    return {
      histogram: histData,
      normal: normalCurve,
      skewness
    };
  };

  const createKurtosisHistogram = (values, mean, std, kurtosis) => {
    const histData = createHistogramData(values);

    // Add theoretical normal curve for comparison
    const x = Array.from({ length: 100 }, (_, i) =>
      mean - 3 * std + (6 * std * i) / 99
    );
    const normalCurve = x.map(xi => ({
      x: xi,
      y: (1 / (std * Math.sqrt(2 * Math.PI))) *
        Math.exp(-Math.pow(xi - mean, 2) / (2 * std * std))
    }));

    return {
      histogram: histData,
      normal: normalCurve,
      kurtosis
    };
  };

  const renderChart = () => {
    if (!chartData || !chartType) return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8884d8" />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
              {chartData[0]?.mean && (
                <>
                  <Line type="monotone" dataKey="mean" stroke="#82ca9d" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="upperBound" stroke="#ff7300" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="lowerBound" stroke="#ff7300" strokeDasharray="3 3" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'boxplot':
        return (
          <div style={{ width: '100%', height: '300px' }}>
            <Plot
              data={chartData}
              layout={{
                margin: { t: 10, r: 10, l: 40, b: 40 },
                showlegend: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                yaxis: {
                  zeroline: false,
                  gridcolor: 'rgba(0,0,0,0.1)'
                }
              }}
              config={{ responsive: true }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        );

      case 'dualBoxPlot':
        return (
          <div style={{ width: '100%', height: '300px' }}>
            <Plot
              data={chartData}
              layout={{
                margin: { t: 10, r: 10, l: 40, b: 40 },
                showlegend: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                yaxis: {
                  zeroline: false,
                  gridcolor: 'rgba(0,0,0,0.1)'
                }
              }}
              config={{ responsive: true }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" />
              <YAxis dataKey="y" type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'regression':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" />
              <YAxis dataKey="y" type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={chartData.scatter} fill="#8884d8" />
              <Line
                data={chartData.line}
                type="linear"
                dataKey="y"
                stroke="#ff7300"
                dot={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'skewness':
      case 'kurtosis':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="frequency"
                data={chartData.histogram}
                fill="#8884d8"
                opacity={0.7}
              />
              <Line
                type="monotone"
                data={chartData.normal}
                dataKey="y"
                stroke="#ff7300"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'normality':
        return (
          <div className="grid grid-cols-2 gap-4 h-[300px]">
            {/* Q-Q Plot */}
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="theoretical" name="Theoretical Quantiles" />
                <YAxis type="number" dataKey="observed" name="Sample Quantiles" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={chartData} fill="#8884d8" />
                <Line
                  type="monotone"
                  data={[
                    { theoretical: -3, observed: -3 },
                    { theoretical: 3, observed: 3 }
                  ]}
                  dataKey="observed"
                  stroke="#ff7300"
                  dot={false}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Histogram with Normal Curve */}
            <ResponsiveContainer>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="frequency"
                  data={chartData.histogram}
                  fill="#8884d8"
                  opacity={0.7}
                />
                <Line
                  type="monotone"
                  data={chartData.normal}
                  dataKey="y"
                  stroke="#ff7300"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

        case 'chi_square': {
          return (
            <div className="space-y-6">
              {/* Frequencies Comparison */}
              <div className="h-[400px]">
                <h3 className="text-center text-sm font-medium mb-2">
                  Observed vs Expected Frequencies
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.frequencies}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Observed Group 1" fill="#8884d8" />
                    <Bar dataKey="Expected Group 1" fill="#8884d8" fillOpacity={0.4} />
                    <Bar dataKey="Observed Group 2" fill="#82ca9d" />
                    <Bar dataKey="Expected Group 2" fill="#82ca9d" fillOpacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
    
              {/* Chi-square Contributions */}
              <div className="h-[300px]">
                <h3 className="text-center text-sm font-medium mb-2">
                  Chi-square Statistic Contributions by Category
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.contributions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`Contribution: ${value.toFixed(3)}`, '']}
                    />
                    <Bar dataKey="contribution" fill="#ff7300">
                      {chartData.contributions.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.contribution > 3.841 ? '#ff4444' : '#ff7300'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gray-400 hover:bg-gray-500 text-white shadow-lg rounded-l-lg p-2 z-10 transition-colors"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-1/2' : 'w-0'
          } overflow-y-auto`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Analysis Configuration</h2>

          {selectedMethod ? (
            <div className="space-y-6">
              {/* Method Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">{selectedMethod.name}</h3>
                    <p className="text-sm text-blue-700 mt-1">{selectedMethod.description}</p>
                  </div>
                </div>
              </div>

              {/* Column Selection */}
              <div className="space-y-4">
                <h3 className="font-medium">Select Data Column</h3>
                <select
                  value={selectedColumns[0] || ''}
                  onChange={(e) => {
                    setSelectedColumns([e.target.value]);
                    setResults(null);
                    setChartData(null);
                  }}
                  className="w-full p-2 border rounded-md bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a column</option>
                  {columnLabels.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
                {selectedAnalysis == "bivariate" && (
                  <select
                    value={selectedColumns[1] || ''}
                    onChange={(e) => {
                      const updatedColumns = [...selectedColumns];
                      updatedColumns[1] = e.target.value;
                      setSelectedColumns(updatedColumns);
                      setResults(null);
                      setChartData(null);
                    }}
                    className="w-full p-2 border rounded-md bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select another column</option>
                    {columnLabels.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                )
                }
              </div>

              {/* Calculate Button */}
              <button
                className={`w-full py-2 px-4 rounded-md transition-colors ${selectedColumns.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                disabled={selectedColumns.length === 0}
                onClick={calculateResults}
              >
                Calculate {selectedMethod.name}
              </button>

              {/* Results Display */}
              {results && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Results</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{results.label}:</span>
                    <span className="font-semibold">{results.value}</span>
                  </div>
                  {results.interpretation && (
                    <p className="text-sm text-gray-600 mt-2">
                      {results.interpretation}
                    </p>
                  )}
                </div>
              )}

              {/* Chart Display */}
              {chartData && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Visualization</h3>
                  {renderChart()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              Select a statistical method to begin analysis
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChartConfigPanel;