import React, { useState } from "react";
import MultiComponentSelector from "./MultiComponentSelector";
import type { OptimizationParams } from "../types/optimization";

interface OptimizationConfigProps {
  onConfigChange: (config: OptimizationParams) => void;
}

const OptimizationConfig: React.FC<OptimizationConfigProps> = ({
  onConfigChange,
}) => {
  const [config, setConfig] = useState<OptimizationParams>({
    selectedComponents: [],
    optimizationHorizon: 60,
    maxWarehouseCapacity: undefined,
    budgetLimit: undefined,
    minSafetyStock: 10,
  });

  const mockComponents = [
    "Widget A",
    "Bearing B",
    "Sensor C",
    "Motor D",
    "Valve E",
    "Pump F",
    "Controller G",
    "Switch H",
    "Cable I",
    "Connector J",
  ];

  const handleConfigChange = (field: keyof OptimizationParams, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative inline-block ml-2">
      <svg
        className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Optimization Configuration
        </h2>
        <p className="text-gray-600">
          Configure parameters for inventory optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Component Selection */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700">
              Select Component(s)
            </label>
            <Tooltip text="Choose which components to include in the optimization. Multiple selection allowed." />
          </div>
          <MultiComponentSelector
            components={mockComponents}
            selectedComponents={config.selectedComponents}
            onSelect={(components) =>
              handleConfigChange("selectedComponents", components)
            }
            placeholder="Select components to optimize..."
          />
        </div>

        {/* Optimization Horizon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700">
                Optimization Horizon
              </label>
              <Tooltip text="Time period (in days) over which to optimize inventory levels. Range: 30-120 days." />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {config.optimizationHorizon} days
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="120"
            step="5"
            value={config.optimizationHorizon}
            onChange={(e) =>
              handleConfigChange(
                "optimizationHorizon",
                parseInt(e.target.value)
              )
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>30 days</span>
            <span>120 days</span>
          </div>
        </div>

        {/* Maximum Warehouse Capacity */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700">
              Maximum Warehouse Capacity
            </label>
            <Tooltip text="Optional: Maximum total units that can be stored in the warehouse. Leave empty for unlimited capacity." />
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={config.maxWarehouseCapacity || ""}
              onChange={(e) =>
                handleConfigChange(
                  "maxWarehouseCapacity",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Unlimited"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">units</span>
            </div>
          </div>
        </div>

        {/* Budget Limit */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700">
              Budget Limit
            </label>
            <Tooltip text="Optional: Maximum budget available for purchasing inventory. Leave empty for unlimited budget." />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="0"
              step="100"
              value={config.budgetLimit || ""}
              onChange={(e) =>
                handleConfigChange(
                  "budgetLimit",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Unlimited"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Minimum Safety Stock */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700">
              Minimum Safety Stock
            </label>
            <Tooltip text="Minimum inventory level to maintain as a buffer against stockouts and demand variability." />
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={config.minSafetyStock}
              onChange={(e) =>
                handleConfigChange(
                  "minSafetyStock",
                  parseInt(e.target.value) || 0
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationConfig;
