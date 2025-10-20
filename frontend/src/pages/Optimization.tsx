import React, { useState } from "react";
import OptimizationConfig from "../components/OptimizationConfig";
import OptimalStockCard from "../components/OptimalStockCard";
import InventorySimulationChart from "../components/InventorySimulationChart";
import CostComparisonChart from "../components/CostComparisonChart";
import SensitivityPanel from "../components/SensitivityPanel";
import type { OptimizationParams } from "../types/optimization";

const calculateOptimizationScore = (
  results: Partial<OptimizationResult>
): number => {
  // Method 1: Service vs Cost Balance Score
  // Higher fill rate and lower costs = higher score
  const serviceScore = results.fill_rate! * 100; // 0-100
  const costEfficiency = Math.max(0, 100 - results.total_cost! / 1000); // Penalize high costs
  const inventoryEfficiency = Math.max(0, 100 - results.mean_inventory! / 5); // Penalize high inventory

  // Weighted combination: 50% service, 30% cost efficiency, 20% inventory efficiency
  const compositeScore =
    serviceScore * 0.5 + costEfficiency * 0.3 + inventoryEfficiency * 0.2;

  return Math.round(Math.max(0, Math.min(100, compositeScore)));
};

interface OptimizationResult {
  policy: [number, number]; // [R, Q] - reorder point and order quantity
  total_holding_cost: number;
  total_stockout_cost: number;
  total_ordering_cost: number;
  total_cost: number;
  stockout_rate: number;
  fill_rate: number;
  num_orders: number;
  mean_inventory: number;
  // Additional computed fields for UI
  costSavings?: number;
  savingsPercentage?: number;
  efficiencyScore?: number;
  forecastPeriod?: number;
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

    // Generate mock results based on optimizer output structure
    const mockResults: OptimizationResult = {
      policy: [
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 100) + 50,
      ],
      total_holding_cost: Math.floor(Math.random() * 20000) + 10000,
      total_stockout_cost: Math.floor(Math.random() * 5000) + 1000,
      total_ordering_cost: Math.floor(Math.random() * 3000) + 500,
      total_cost: Math.floor(Math.random() * 50000) + 25000,
      stockout_rate: Math.random() * 0.1, // 0-10%
      fill_rate: 0.9 + Math.random() * 0.1, // 90-100%
      num_orders: Math.floor(Math.random() * 20) + 5,
      mean_inventory: Math.floor(Math.random() * 200) + 100,
      // Computed fields for UI
      costSavings: Math.floor(Math.random() * 15000) + 5000,
      savingsPercentage: Math.floor(Math.random() * 20) + 10,
      efficiencyScore: 0, // Will be calculated below
      forecastPeriod: currentConfig.optimizationHorizon,
    };

    // Calculate optimization score after mockResults is created
    mockResults.efficiencyScore = calculateOptimizationScore(mockResults);

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
              optimalStock={results.mean_inventory}
              reorderPoint={results.policy[0]}
              orderQuantity={results.policy[1]}
              costSavings={results.costSavings || 0}
              savingsPercentage={results.savingsPercentage || 0}
              efficiencyScore={results.efficiencyScore || 0}
              forecastPeriod={results.forecastPeriod || 90}
            />

            {/* Inventory Simulation Chart */}
            <InventorySimulationChart
              reorderPoint={results.policy[0]}
              safetyStock={Math.floor(results.mean_inventory * 0.5)}
              days={results.forecastPeriod || 90}
            />

            {/* Cost Comparison Chart */}
            <CostComparisonChart />

            {/* Sensitivity Analysis Panel */}
            <SensitivityPanel
              baseOptimalStock={results.mean_inventory}
              baseReorderPoint={results.policy[0]}
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
                      ${results.total_cost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Fill Rate
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {(results.fill_rate * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Stockout Rate
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {(results.stockout_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Holding Cost
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${results.total_holding_cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Stockout Cost
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${results.total_stockout_cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Ordering Cost
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${results.total_ordering_cost.toLocaleString()}
                      </span>
                    </div>
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
