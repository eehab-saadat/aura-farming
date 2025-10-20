import React, { useState, useEffect } from "react";

interface OptimalStockCardProps {
  optimalStock: number;
  reorderPoint: number;
  orderQuantity: number;
  costSavings: number;
  savingsPercentage: number;
  efficiencyScore: number; // 0-100
  forecastPeriod: number;
}

const OptimalStockCard: React.FC<OptimalStockCardProps> = ({
  optimalStock,
  reorderPoint,
  orderQuantity,
  costSavings,
  savingsPercentage,
  efficiencyScore,
  forecastPeriod,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated count-up effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = optimalStock / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= optimalStock) {
        setDisplayValue(optimalStock);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [optimalStock]);

  // Progress circle calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (efficiencyScore / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 opacity-90">
            Optimal Stock Level
          </h2>
          <div className="text-6xl font-black mb-2 tabular-nums">
            {displayValue.toLocaleString()}
            <span className="text-3xl ml-2 opacity-80">units</span>
          </div>
          <p className="text-lg opacity-80">
            Based on {forecastPeriod}-day forecast
          </p>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {reorderPoint.toLocaleString()}
            </div>
            <div className="text-sm opacity-80">Reorder Point</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {orderQuantity.toLocaleString()}
            </div>
            <div className="text-sm opacity-80">Order Quantity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              ${costSavings.toLocaleString()}
            </div>
            <div className="text-sm opacity-80">Cost Savings</div>
            <div className="text-xs opacity-60">
              ({savingsPercentage}% vs current)
            </div>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="flex items-center justify-center space-x-6">
          <div className="relative">
            <svg
              className="w-24 h-24 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{efficiencyScore}%</div>
                <div className="text-xs opacity-80">Efficiency</div>
              </div>
            </div>
          </div>

          <div className="text-left">
            <h3 className="text-lg font-semibold mb-1">Optimization Score</h3>
            <p className="text-sm opacity-80">
              {efficiencyScore >= 90
                ? "Excellent optimization achieved"
                : efficiencyScore >= 75
                ? "Good optimization with room for improvement"
                : "Moderate optimization - consider adjusting parameters"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimalStockCard;
