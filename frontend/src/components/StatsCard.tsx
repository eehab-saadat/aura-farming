import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
}) => {
  // Determine if change is positive or negative for color styling
  const isPositiveChange =
    change && (change.startsWith("+") || change.startsWith("↑"));
  const isNegativeChange =
    change && (change.startsWith("-") || change.startsWith("↓"));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p
              className={`text-sm font-medium ${
                isPositiveChange
                  ? "text-green-600"
                  : isNegativeChange
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        {icon && <div className="ml-4">{icon}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
