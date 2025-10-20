import React, { useState, useEffect } from "react";

interface SensitivityPanelProps {
  baseOptimalStock: number;
  baseReorderPoint: number;
  onSensitivityChange?: (sensitivity: SensitivityParams) => void;
}

interface SensitivityParams {
  demandUncertainty: number;
  leadTimeVariability: number;
  adjustedOptimalStock: number;
  adjustedReorderPoint: number;
  stockChange: number;
  reorderChange: number;
  impactLevel: "robust" | "moderate" | "sensitive";
}

const SensitivityPanel: React.FC<SensitivityPanelProps> = ({
  baseOptimalStock,
  baseReorderPoint,
  onSensitivityChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demandUncertainty, setDemandUncertainty] = useState(15);
  const [leadTimeVariability, setLeadTimeVariability] = useState(2);

  // Calculate sensitivity impacts
  const calculateSensitivity = (
    demandUncertainty: number,
    leadTimeVariability: number
  ): SensitivityParams => {
    // Simple sensitivity calculations for demo
    const demandFactor = 1 + demandUncertainty / 100;
    const leadTimeFactor = 1 + leadTimeVariability / 10;

    // Safety stock increases with uncertainty
    const safetyStockMultiplier = demandFactor * leadTimeFactor;
    const adjustedOptimalStock = Math.round(
      baseOptimalStock * safetyStockMultiplier
    );
    const adjustedReorderPoint = Math.round(
      baseReorderPoint * safetyStockMultiplier
    );

    const stockChange = adjustedOptimalStock - baseOptimalStock;
    const reorderChange = adjustedReorderPoint - baseReorderPoint;

    // Determine impact level based on total change
    const totalChangePercent = Math.abs(stockChange) / baseOptimalStock;
    let impactLevel: "robust" | "moderate" | "sensitive";
    if (totalChangePercent < 0.1) impactLevel = "robust";
    else if (totalChangePercent < 0.25) impactLevel = "moderate";
    else impactLevel = "sensitive";

    return {
      demandUncertainty,
      leadTimeVariability,
      adjustedOptimalStock,
      adjustedReorderPoint,
      stockChange,
      reorderChange,
      impactLevel,
    };
  };

  const [sensitivity, setSensitivity] = useState<SensitivityParams>(() =>
    calculateSensitivity(demandUncertainty, leadTimeVariability)
  );

  useEffect(() => {
    const newSensitivity = calculateSensitivity(
      demandUncertainty,
      leadTimeVariability
    );
    setSensitivity(newSensitivity);
    onSensitivityChange?.(newSensitivity);
  }, [
    demandUncertainty,
    leadTimeVariability,
    baseOptimalStock,
    baseReorderPoint,
    onSensitivityChange,
  ]);

  const handleReset = () => {
    setDemandUncertainty(15);
    setLeadTimeVariability(2);
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "robust":
        return "text-green-600 bg-green-50 border-green-200";
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "sensitive":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getImpactIcon = (level: string) => {
    switch (level) {
      case "robust":
        return "🟢";
      case "moderate":
        return "🟡";
      case "sensitive":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                sensitivity.impactLevel === "robust"
                  ? "bg-green-500"
                  : sensitivity.impactLevel === "moderate"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sensitivity Analysis
            </h3>
            <span className="text-sm text-gray-500">
              Test parameter variations
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(
                sensitivity.impactLevel
              )}`}
            >
              {getImpactIcon(sensitivity.impactLevel)}{" "}
              {sensitivity.impactLevel.charAt(0).toUpperCase() +
                sensitivity.impactLevel.slice(1)}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Demand Uncertainty Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Demand Uncertainty
                </label>
                <span className="text-sm text-gray-600 font-medium">
                  ±{demandUncertainty}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={demandUncertainty}
                onChange={(e) => setDemandUncertainty(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>±0%</span>
                <span>±50%</span>
              </div>
            </div>

            {/* Lead Time Variability Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Lead Time Variability
                </label>
                <span className="text-sm text-gray-600 font-medium">
                  ±{leadTimeVariability} days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={leadTimeVariability}
                onChange={(e) =>
                  setLeadTimeVariability(parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>±0 days</span>
                <span>±7 days</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Adjusted Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sensitivity.adjustedOptimalStock.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Optimal Stock Level
                  {sensitivity.stockChange !== 0 && (
                    <span
                      className={`ml-2 ${
                        sensitivity.stockChange > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ({sensitivity.stockChange > 0 ? "+" : ""}
                      {sensitivity.stockChange} units)
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {sensitivity.adjustedReorderPoint.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Reorder Point
                  {sensitivity.reorderChange !== 0 && (
                    <span
                      className={`ml-2 ${
                        sensitivity.reorderChange > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ({sensitivity.reorderChange > 0 ? "+" : ""}
                      {sensitivity.reorderChange} units)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Sensitivity Impact
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {sensitivity.impactLevel === "robust" &&
                    "Recommendations are stable under parameter variations."}
                  {sensitivity.impactLevel === "moderate" &&
                    "Moderate sensitivity to parameter changes."}
                  {sensitivity.impactLevel === "sensitive" &&
                    "High sensitivity - consider additional safety buffers."}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensitivityPanel;
