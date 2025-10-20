import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface DemandData {
  date: string;
  value: number;
}

interface ComponentCardProps {
  componentName: string;
  status: "healthy" | "warning" | "critical";
  demandData: DemandData[];
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  componentName,
  status,
  demandData,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return {
          border: "border-success",
          badge: "bg-success text-white",
          text: "Healthy",
        };
      case "warning":
        return {
          border: "border-warning",
          badge: "bg-warning text-black",
          text: "Warning",
        };
      case "critical":
        return {
          border: "border-error",
          badge: "bg-error text-white",
          text: "Critical",
        };
      default:
        return {
          border: "border-gray-300",
          badge: "bg-gray-500 text-white",
          text: "Unknown",
        };
    }
  };

  const statusStyle = getStatusColor();

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 ${statusStyle.border} p-4 hover:shadow-md transition-shadow duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{componentName}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.badge}`}
        >
          {statusStyle.text}
        </span>
      </div>

      {/* Sparkline Chart */}
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={demandData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1E40AF"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* View Details Button */}
      <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200">
        View Details
      </button>
    </div>
  );
};

export default ComponentCard;
