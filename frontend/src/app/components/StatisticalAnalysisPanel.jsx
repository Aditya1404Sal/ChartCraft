'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, BarChart3, Binary, Network } from 'lucide-react';

const StatisticalAnalysisPanel = ({ onMethodSelect }) => {
  const analysisTypes = {
    univariate: {
      title: "Univariate Analysis",
      description: "Analyzes a single variable to summarize its characteristics",
      icon: BarChart3,
      categories: {
        descriptive: {
          name: "Descriptive Statistics",
          methods: [
            { id: "mean", name: "Mean", description: "Average of all values" },
            { id: "median", name: "Median", description: "Middle value when sorted" },
            { id: "mode", name: "Mode", description: "Most frequent value" },
            { id: "variance", name: "Variance", description: "Spread of values from mean" },
            { id: "std", name: "Standard Deviation", description: "Square root of variance" },
          ]
        },
        distribution: {
          name: "Shape and Distribution",
          methods: [
            { id: "skewness", name: "Skewness", description: "Measures distribution asymmetry" },
            { id: "kurtosis", name: "Kurtosis", description: "Measures distribution tailedness" },
          ]
        },
        visualization: {
          name: "Visualization",
          methods: [
            { id: "histogram", name: "Histogram", description: "Frequency distribution visualization" },
            { id: "boxplot", name: "Box Plot", description: "Five-number summary with outliers" },
          ]
        }
      }
    },
    bivariate: {
      title: "Bivariate Analysis",
      description: "Examines relationships between two variables",
      icon: Binary,
      categories: {
        correlation: {
          name: "Correlation Analysis",
          methods: [
            { id: "pearson", name: "Pearson Correlation", description: "Linear correlation coefficient" },
            { id: "spearman", name: "Spearman Correlation", description: "Rank correlation coefficient" },          ]
        },
        regression: {
          name: "Regression Analysis",
          methods: [
            { id: "linear_regression", name: "Simple Linear Regression", description: "Model linear relationships" },
          ]
        },
        categorical: {
          name: "Categorical Analysis",
          methods: [
            { id: "chi_square", name: "Chi-Square Test", description: "Test categorical independence" },
          ]
        },
        comparison: {
          name: "Group Comparison",
          methods: [
            { id: "ttest", name: "T-Test", description: "Compare means of two groups" },
          ]
        }
      }
    },
  };

  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);

  const toggleAnalysis = (analysisKey) => {
    setExpandedAnalysis(expandedAnalysis === analysisKey ? null : analysisKey);
  };

  const toggleCategory = (analysisKey, categoryKey) => {
    const key = `${analysisKey}-${categoryKey}`;
    setExpandedCategory(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMethodSelect = (analysisKey, categoryKey, method) => {
    setSelectedMethod(method.id);
    onMethodSelect && onMethodSelect({
      analysisType: analysisKey,
      category: categoryKey,
      method: method
    });
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      {Object.entries(analysisTypes).map(([analysisKey, analysis]) => {
        const AnalysisIcon = analysis.icon;
        return (
          <div key={analysisKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Analysis Type Header */}
            <div 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleAnalysis(analysisKey)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AnalysisIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {analysis.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{analysis.description}</p>
                    </div>
                  </div>
                  {expandedAnalysis === analysisKey ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
            </div>
            
            {/* Categories and Methods */}
            {expandedAnalysis === analysisKey && (
              <div className="border-t border-gray-200 p-4">
                {Object.entries(analysis.categories).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="mb-4">
                    <div
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleCategory(analysisKey, categoryKey)}
                    >
                      <h3 className="font-medium text-gray-700">{category.name}</h3>
                      {expandedCategory[`${analysisKey}-${categoryKey}`] ? 
                        <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      }
                    </div>
                    
                    {expandedCategory[`${analysisKey}-${categoryKey}`] && (
                      <div className="mt-2 space-y-2 pl-4">
                        {category.methods.map((method) => (
                          <div
                            key={method.id}
                            onClick={() => handleMethodSelect(analysisKey, categoryKey, method)}
                            className={`p-2 rounded-md cursor-pointer transition-colors ${
                              selectedMethod === method.id
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Calculator className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-gray-700">{method.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 ml-6">
                              {method.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatisticalAnalysisPanel;