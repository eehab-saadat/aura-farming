import React, { useState, useEffect } from "react";
import {
  getCostConfiguration,
  saveCostConfiguration,
  clearCostConfiguration,
} from "../utils/costStorage";

interface CostInputFormData {
  storageCost: number;
  obsolescenceCost: number;
  lostSales: number;
  expeditedShipping: number;
  productionDelays: number;
  // Default API parameters (disabled fields)
  horizon: number;
  orderingCost: number;
  leadTime: number;
  nSimulations: number;
}

const CostInputForm: React.FC = () => {
  const [formData, setFormData] = useState<CostInputFormData>({
    storageCost: 0,
    obsolescenceCost: 0,
    lostSales: 0,
    expeditedShipping: 0,
    productionDelays: 0,
    // Default API parameters
    horizon: 90,
    orderingCost: 200.0,
    leadTime: 1,
    nSimulations: 200,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CostInputFormData, string>>
  >({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = getCostConfiguration();
    if (savedData) {
      setFormData({
        ...savedData,
        // Keep default API parameters
        horizon: 90,
        orderingCost: 200.0,
        leadTime: 1,
        nSimulations: 200,
      });
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CostInputFormData, string>> = {};

    if (formData.storageCost < 0) {
      newErrors.storageCost = "Storage cost cannot be negative";
    }

    if (formData.obsolescenceCost < 0) {
      newErrors.obsolescenceCost = "Obsolescence cost cannot be negative";
    }

    if (formData.lostSales < 0) {
      newErrors.lostSales = "Lost sales cost cannot be negative";
    }

    if (formData.expeditedShipping < 0) {
      newErrors.expeditedShipping =
        "Expedited shipping cost cannot be negative";
    }

    if (formData.productionDelays < 0) {
      newErrors.productionDelays = "Production delays cost cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Save to localStorage using utility function
      saveCostConfiguration(formData);
      console.log("Form submitted and saved:", formData);
      alert("Cost configuration saved successfully!");
    }
  };

  const handleClear = () => {
    setFormData({
      storageCost: 0,
      obsolescenceCost: 0,
      lostSales: 0,
      expeditedShipping: 0,
      productionDelays: 0,
      // Keep default API parameters
      horizon: 90,
      orderingCost: 200.0,
      leadTime: 1,
      nSimulations: 200,
    });
    setErrors({});
    // Remove from localStorage using utility function
    clearCostConfiguration();
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
        {/* Storage Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Storage Cost per Unit per Day
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.storageCost || ""}
              onChange={(e) =>
                handleInputChange(
                  "storageCost",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.storageCost ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.storageCost && (
            <p className="mt-1 text-sm text-red-600">{errors.storageCost}</p>
          )}
        </div>

        {/* Obsolescence Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Obsolescence Cost per Unit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.obsolescenceCost || ""}
              onChange={(e) =>
                handleInputChange(
                  "obsolescenceCost",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.obsolescenceCost ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.obsolescenceCost && (
            <p className="mt-1 text-sm text-red-600">
              {errors.obsolescenceCost}
            </p>
          )}
        </div>

        {/* Lost Sales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lost Sales Cost per Unit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.lostSales || ""}
              onChange={(e) =>
                handleInputChange("lostSales", parseFloat(e.target.value) || 0)
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.lostSales ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.lostSales && (
            <p className="mt-1 text-sm text-red-600">{errors.lostSales}</p>
          )}
        </div>

        {/* Expedited Shipping */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expedited Shipping Cost per Unit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.expeditedShipping || ""}
              onChange={(e) =>
                handleInputChange(
                  "expeditedShipping",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.expeditedShipping ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.expeditedShipping && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expeditedShipping}
            </p>
          )}
        </div>

        {/* Production Delays */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Production Delays Cost per Day
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.productionDelays || ""}
              onChange={(e) =>
                handleInputChange(
                  "productionDelays",
                  parseFloat(e.target.value) || 0
                )
              }
              className={`pl-7 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.productionDelays ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.productionDelays && (
            <p className="mt-1 text-sm text-red-600">
              {errors.productionDelays}
            </p>
          )}
        </div>

        {/* Default API Parameters Section */}
        <div className="md:col-span-2 mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Default API Parameters
          </h4>
          <p className="text-sm text-gray-600 mb-6">
            These are the default values used by the optimization API. They
            cannot be modified.
          </p>
        </div>

        {/* Horizon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Horizon (days)
          </label>
          <input
            type="number"
            value={formData.horizon}
            disabled
            className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Ordering Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Ordering Cost per Order
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={formData.orderingCost}
              disabled
              className="pl-7 w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Lead Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Time (days)
          </label>
          <input
            type="number"
            min="1"
            value={formData.leadTime}
            disabled
            className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Number of Simulations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Simulations
          </label>
          <input
            type="number"
            min="1"
            value={formData.nSimulations}
            disabled
            className="w-full px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
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
