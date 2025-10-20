import React, { useState } from "react";
import OptimizationConfig from "../components/OptimizationConfig";
import OptimalStockCard from "../components/OptimalStockCard";
import InventorySimulationChart from "../components/InventorySimulationChart";
import CostComparisonChart from "../components/CostComparisonChart";
import SensitivityPanel from "../components/SensitivityPanel";
import type { OptimizationParams } from "../types/optimization";

interface OptimizationResult {
  totalCost: number;
  recommendedStock: { [component: string]: number };
  costSavings: number;
  riskReduction: number;
  optimalStockLevel: number;
  reorderPoint: number;
  orderQuantity: number;
  savingsPercentage: number;
  efficiencyScore: number;
  forecastPeriod: number;
}

const Optimization: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [currentConfig, setCurrentConfig] = useState<OptimizationParams | null>(
    null
  );

  const optimizationSteps = [
    "Loading forecast data...",
    "Calculating cost functions...",
    "Solving optimization problem...",
    "Generating recommendations...",
  ];

  const handleConfigChange = (config: OptimizationParams) => {
    console.log("Optimization config changed:", config);
    setCurrentConfig(config);
    // Reset results when config changes
    setResults(null);
  };

  const runOptimization = async () => {
    if (!currentConfig || currentConfig.selectedComponents.length === 0) {
      alert("Please select at least one component to optimize.");
      return;
    }

    setIsOptimizing(true);
    setCurrentStep(0);
    setResults(null);

    // Simulate optimization steps
    for (let i = 0; i < optimizationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 750));
    }

    // Generate mock results
    const totalRecommendedStock = Object.values(
      currentConfig.selectedComponents.reduce((acc, component) => {
        acc[component] = Math.floor(Math.random() * 100) + 20;
        return acc;
      }, {} as { [component: string]: number })
    ).reduce((sum, stock) => sum + stock, 0);

    const mockResults: OptimizationResult = {
      totalCost: Math.floor(Math.random() * 50000) + 25000,
      recommendedStock: currentConfig.selectedComponents.reduce(
        (acc, component) => {
          acc[component] = Math.floor(Math.random() * 100) + 20;
          return acc;
        },
        {} as { [component: string]: number }
      ),
      costSavings: Math.floor(Math.random() * 15000) + 5000,
      riskReduction: Math.floor(Math.random() * 40) + 10,
      optimalStockLevel: totalRecommendedStock,
      reorderPoint: Math.floor(totalRecommendedStock * 0.6),
      orderQuantity: Math.floor(totalRecommendedStock * 0.4),
      savingsPercentage: Math.floor(Math.random() * 20) + 10,
      efficiencyScore: Math.floor(Math.random() * 30) + 70,
      forecastPeriod: currentConfig.optimizationHorizon,
    };

    setResults(mockResults);
    setIsOptimizing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Panel - Configuration */}
      <div className="p-8 bg-gray-50 border-b border-gray-200">
        <OptimizationConfig onConfigChange={handleConfigChange} />
      </div>

      {/* Bottom Panel - Results (Full Width) */}
      <div className="flex-1 p-8">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Optimization</h1>
          <p className="text-gray-600">Resource optimization and planning tools</p>
        </div> */}

        {/* Run Optimization Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={runOptimization}
            disabled={
              isOptimizing ||
              !currentConfig ||
              currentConfig.selectedComponents.length === 0
            }
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
              isOptimizing ||
              !currentConfig ||
              currentConfig.selectedComponents.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl"
            }`}
          >
            {isOptimizing ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Running Optimization...</span>
              </div>
            ) : (
              "Run Optimization"
            )}
          </button>
        </div>

        {/* Progress Indicator */}
        {isOptimizing && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Optimization Progress
                </h3>
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {optimizationSteps.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      ((currentStep + 1) / optimizationSteps.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Current Step */}
              <div className="flex items-center space-x-3">
                <div className="animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <p className="text-gray-700 font-medium">
                  {optimizationSteps[currentStep]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && !isOptimizing && (
          <div className="space-y-8">
            {/* Optimal Stock Card - Hero Display */}
            <OptimalStockCard
              optimalStock={results.optimalStockLevel}
              reorderPoint={results.reorderPoint}
              orderQuantity={results.orderQuantity}
              costSavings={results.costSavings}
              savingsPercentage={results.savingsPercentage}
              efficiencyScore={results.efficiencyScore}
              forecastPeriod={results.forecastPeriod}
            />

            {/* Inventory Simulation Chart */}
            <InventorySimulationChart
              reorderPoint={results.reorderPoint}
              safetyStock={Math.floor(results.optimalStockLevel * 0.5)}
              days={results.forecastPeriod}
            />

            {/* Cost Comparison Chart */}
            <CostComparisonChart />

            {/* Sensitivity Analysis Panel */}
            <SensitivityPanel
              baseOptimalStock={results.optimalStockLevel}
              baseReorderPoint={results.reorderPoint}
            />

            {/* Detailed Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Detailed Optimization Results
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Total Cost
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${results.totalCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Cost Savings
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ${results.costSavings.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Risk Reduction
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {results.riskReduction}%
                    </span>
                  </div>
                </div>

                {/* Recommended Stock Levels */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Recommended Stock Levels
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(results.recommendedStock).map(
                      ([component, stock]) => (
                        <div
                          key={component}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {component}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {stock} units
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Optimization completed successfully. These recommendations are
                  based on your configured parameters and historical data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!results && !isOptimizing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Optimization Results
            </h3>
            <p className="text-gray-600">
              Configure your optimization parameters in the left panel and click
              "Run Optimization" to see results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimization;
