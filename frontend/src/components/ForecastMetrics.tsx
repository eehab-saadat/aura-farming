import React from "react";

interface ForecastMetricsProps {
  peakDemandDate: string;
  peakDemandValue: number;
  averageDailyDemand: number;
  forecastAccuracyScore: number;
  volatilityIndex: string;
}

const ForecastMetrics: React.FC<ForecastMetricsProps> = ({
  peakDemandDate,
  peakDemandValue,
  averageDailyDemand,
  forecastAccuracyScore,
  volatilityIndex,
}) => {
  const metrics = [
    {
      title: "Peak Demand Date",
      value: peakDemandDate,
      icon: (
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📅</span>
        </div>
      ),
    },
    {
      title: "Peak Demand Value",
      value: `${peakDemandValue} units`,
      icon: (
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
      ),
    },
    {
      title: "Average Daily Demand",
      value: `${averageDailyDemand} units`,
      icon: (
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
      ),
    },
    // {
    //   title: "Forecast Accuracy Score",
    //   value: `${forecastAccuracyScore}%`,
    //   icon: (
    //     <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
    //       <span className="text-2xl">🎯</span>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Volatility Index",
    //   value: volatilityIndex,
    //   icon: (
    //     <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
    //       <span className="text-2xl">⚡</span>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
            <div className="ml-4">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForecastMetrics;
