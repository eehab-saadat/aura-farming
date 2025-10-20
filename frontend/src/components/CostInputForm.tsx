import React, { useState } from "react";
import ComponentSelector from "./ComponentSelector";

interface CostInputFormData {
  componentName: string;
  holdingCost: number;
  stockoutCost: number;
  leadTime: number;
  currentStock: number;
}

const CostInputForm: React.FC = () => {
  const [formData, setFormData] = useState<CostInputFormData>({
    componentName: "",
    holdingCost: 0,
    stockoutCost: 0,
    leadTime: 0,
    currentStock: 0,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CostInputFormData, string>>
  >({});

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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CostInputFormData, string>> = {};

    if (!formData.componentName) {
      newErrors.componentName = "Component name is required";
    }

    if (formData.holdingCost <= 0) {
      newErrors.holdingCost = "Holding cost must be greater than 0";
    }

    if (formData.stockoutCost <= 0) {
      newErrors.stockoutCost = "Stockout cost must be greater than 0";
    }

    if (formData.leadTime <= 0) {
      newErrors.leadTime = "Lead time must be greater than 0";
    }

    if (formData.currentStock < 0) {
      newErrors.currentStock = "Current stock cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Here you would typically send the data to an API
      alert("Cost configuration saved successfully!");
    }
  };

  const handleClear = () => {
    setFormData({
      componentName: "",
      holdingCost: 0,
      stockoutCost: 0,
      leadTime: 0,
      currentStock: 0,
    });
    setErrors({});
  };

  const handleInputChange = (
    field: keyof CostInputFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Cost Configuration
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Component Name - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Name
          </label>
          <ComponentSelector
            components={mockComponents}
            selectedComponent={formData.componentName}
            onSelect={(component) =>
              handleInputChange("componentName", component)
            }
          />
          {errors.componentName && (
            <p className="mt-1 text-sm text-red-600">{errors.componentName}</p>
          )}
        </div>

        {/* Holding Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Holding Cost per Unit per Day
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.holdingCost || ""}
              onChange={(e) =>
                handleInputChange(
                  "holdingCost",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.holdingCost ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.holdingCost && (
            <p className="mt-1 text-sm text-red-600">{errors.holdingCost}</p>
          )}
        </div>

        {/* Stockout Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stockout Cost per Unit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.stockoutCost || ""}
              onChange={(e) =>
                handleInputChange(
                  "stockoutCost",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.stockoutCost ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.stockoutCost && (
            <p className="mt-1 text-sm text-red-600">{errors.stockoutCost}</p>
          )}
        </div>

        {/* Lead Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Time (days)
          </label>
          <input
            type="number"
            min="1"
            value={formData.leadTime || ""}
            onChange={(e) =>
              handleInputChange("leadTime", parseInt(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.leadTime ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter lead time in days"
          />
          {errors.leadTime && (
            <p className="mt-1 text-sm text-red-600">{errors.leadTime}</p>
          )}
        </div>

        {/* Current Stock Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Stock Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.currentStock || ""}
            onChange={(e) =>
              handleInputChange("currentStock", parseInt(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.currentStock ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter current stock level"
          />
          {errors.currentStock && (
            <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>
          )}
        </div>

        {/* Buttons - Full Width */}
        <div className="md:col-span-2 flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            Save Configuration
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CostInputForm;
