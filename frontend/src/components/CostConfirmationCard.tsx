import React from "react";

interface CostData {
  componentName: string;
  holdingCost: number;
  stockoutCost: number;
  leadTime: number;
  currentStock: number;
}

interface CostConfirmationCardProps {
  extractedData: CostData;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

const CostConfirmationCard: React.FC<CostConfirmationCardProps> = ({
  extractedData,
  onConfirm,
  onEdit,
  onCancel,
}) => {
  const isDataComplete = () => {
    return (
      extractedData.componentName &&
      extractedData.holdingCost > 0 &&
      extractedData.stockoutCost > 0 &&
      extractedData.leadTime > 0 &&
      extractedData.currentStock >= 0
    );
  };

  const handleConfirm = () => {
    console.log("Cost data confirmed:", extractedData);
    onConfirm();
  };

  const dataFields = [
    {
      label: "Component Name",
      value: extractedData.componentName,
      icon: "🏷️",
      color: "text-blue-600",
    },
    {
      label: "Holding Cost per Unit per Day",
      value: `$${extractedData.holdingCost.toFixed(2)}`,
      icon: "💰",
      color: "text-green-600",
    },
    {
      label: "Stockout Cost per Unit",
      value: `$${extractedData.stockoutCost.toFixed(2)}`,
      icon: "⚠️",
      color: "text-red-600",
    },
    {
      label: "Lead Time",
      value: `${extractedData.leadTime} days`,
      icon: "⏱️",
      color: "text-purple-600",
    },
    {
      label: "Current Stock Level",
      value: `${extractedData.currentStock} units`,
      icon: "📦",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Confirm Cost Configuration
        </h3>
        <p className="text-gray-600">
          Please review the extracted information and confirm or edit as needed.
        </p>
      </div>

      {!isDataComplete() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 text-lg mr-2">⚠️</span>
            <p className="text-sm text-yellow-800">
              Some data appears to be incomplete or invalid. Please review and
              edit if necessary.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {dataFields.map((field, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{field.icon}</span>
              <h4 className="text-sm font-medium text-gray-700">
                {field.label}
              </h4>
            </div>
            <p className={`text-lg font-bold ${field.color}`}>
              {field.value || "Not specified"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isDataComplete()}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Confirm & Save
        </button>
      </div>
    </div>
  );
};

export default CostConfirmationCard;
