import React, { useState, useEffect } from "react";
import {
  getCostConfiguration,
  type CostConfiguration,
} from "../utils/costStorage";

interface OptimizationResult {
  mean_inventory: number;
  reorder_point: number;
  order_quantity: number;
  total_cost: number;
  fill_rate: number;
  stockout_rate: number;
  num_orders: number;
  total_holding_cost: number;
  total_stockout_cost: number;
  total_ordering_cost: number;
  message: string;
}

const Optimization: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [costConfig, setCostConfig] = useState<CostConfiguration | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load cost configuration on component mount
  useEffect(() => {
    const config = getCostConfiguration();
    setCostConfig(config);
  }, []);

  const speakExplanation = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const optimizationSteps = [
    "Loading forecast data...",
    "Calculating cost functions...",
    "Solving optimization problem...",
    "Generating recommendations...",
  ];

  const runOptimization = async () => {
    if (!costConfig) {
      alert(
        "Please configure cost parameters first in the Cost Configuration page."
      );
      return;
    }

    setIsOptimizing(true);
    setCurrentStep(0);
    setResults(null);

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 3) {
            return prev;
          } else {
            return prev + 1;
          }
        });
      }, 1000);

      // Call the optimization API with cost parameters
      const response = await fetch("http://127.0.0.1:5000/optimize-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          horizon: 90,
          holding_cost: costConfig.storageCost,
          stockout_penalty: costConfig.lostSales,
          ordering_cost: costConfig.expeditedShipping,
          lead_time: 1,
          n_simulations: 200,
        }),
      });

      console.log(response);

      clearInterval(progressInterval);
      // setCurrentStep(optimizationSteps.length - 1); // Set to last step

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiResult = await response.json();

      if (!apiResult.success) {
        throw new Error(apiResult.error || "Optimization failed");
      }

      // Extract data from the API response
      const optimalPolicy = apiResult.optimal_policy || {};
      const costSummary = apiResult.cost_summary || {};
      const performanceMetrics = apiResult.performance_metrics || {};

      setResults({
        mean_inventory: Math.round(performanceMetrics.mean_inventory || 0),
        reorder_point: Math.round(optimalPolicy.reorder_point || 0),
        order_quantity: Math.round(optimalPolicy.order_quantity || 0),
        total_cost: Math.round(costSummary.total_cost || 0),
        fill_rate: performanceMetrics.fill_rate || 0,
        stockout_rate: performanceMetrics.stockout_rate || 0,
        num_orders: performanceMetrics.num_orders || 0,
        total_holding_cost: Math.round(costSummary.holding_cost || 0),
        total_stockout_cost: Math.round(costSummary.stockout_cost || 0),
        total_ordering_cost: Math.round(costSummary.ordering_cost || 0),
        message: apiResult.message || "Optimization completed successfully",
      });

      // Set the explanation from the API response
      setExplanation(apiResult.explanation || "No explanation available.");
    } catch (error) {
      console.error("Optimization failed:", error);
      alert(
        `Optimization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsOptimizing(false);
      // Keep the progress bar at the final step instead of resetting to 0
      // setCurrentStep(optimizationSteps.length - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Bottom Panel - Results (Full Width) */}
      <div className="flex-1 p-8">
        {/* Cost Configuration Status */}
        <div className="mb-6 flex justify-center">
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              costConfig
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {costConfig
              ? "✓ Cost configuration loaded"
              : "⚠ Please configure costs first"}
          </div>
        </div>
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Optimization</h1>
          <p className="text-gray-600">Resource optimization and planning tools</p>
        </div> */}

        {/* Run Optimization Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={runOptimization}
            disabled={isOptimizing || !costConfig}
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
              isOptimizing || !costConfig
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
            {/* Stock Number Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Recommended Stock Level
              </h3>
              <div className="text-6xl font-bold text-primary mb-2">
                {results.reorder_point}
              </div>
              <p className="text-gray-600">units (Reorder Point)</p>
              {/* <p className="text-sm text-gray-500 mt-2">{results.message}</p> */}
            </div>

            {/* Optimization Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Policy Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Inventory Policy
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reorder Point:</span>
                    <span className="font-semibold">
                      {results.reorder_point} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Quantity:</span>
                    <span className="font-semibold">
                      {results.order_quantity} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Inventory:</span>
                    <span className="font-semibold">
                      {results.mean_inventory} units
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fill Rate:</span>
                    <span className="font-semibold text-green-600">
                      {(results.fill_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stockout Rate:</span>
                    <span className="font-semibold text-red-600">
                      {(results.stockout_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Orders:</span>
                    <span className="font-semibold">{results.num_orders}</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Cost Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holding Cost:</span>
                    <span className="font-semibold">
                      ${results.total_holding_cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stockout Cost:</span>
                    <span className="font-semibold">
                      ${results.total_stockout_cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ordering Cost:</span>
                    <span className="font-semibold">
                      ${results.total_ordering_cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">Total Cost:</span>
                      <span className="text-primary">
                        ${results.total_cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Explanation Section */}
        {results && !isOptimizing && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audio Explanation
              </h3>
              <p className="text-gray-600 mb-4">
                Get a detailed explanation of the optimization results
              </p>
              <button
                onClick={speakExplanation}
                disabled={!explanation}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl ${
                  !explanation
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isSpeaking
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSpeaking ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Stop Audio</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <span>Explain in Audio</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!results && !isOptimizing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stock Optimization
            </h3>
            <p className="text-gray-600">
              Configure your optimization parameters and click "Run
              Optimization" to get the recommended stock level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimization;
