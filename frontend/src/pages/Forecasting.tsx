import React, { useState } from "react";
import ComponentSelector from "../components/ComponentSelector";
import ForecastChart from "../components/ForecastChart";
import ForecastMetrics from "../components/ForecastMetrics";
import TimeRangeSelector from "../components/TimeRangeSelector";

const Forecasting: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedRange, setSelectedRange] = useState(90);

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

  // Generate mock historical data (90 days back from today)
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate demand with some randomness and trend
      const baseDemand = 100 + Math.sin(i * 0.1) * 20;
      const randomVariation = (Math.random() - 0.5) * 30;
      const demand = Math.max(0, Math.round(baseDemand + randomVariation));

      data.push({
        date: date.toISOString().split("T")[0],
        demand: demand,
      });
    }

    return data;
  };

  // Generate mock forecast data (N days forward from today)
  const generateForecastData = (days: number = 90) => {
    const data = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Generate forecast with trend and confidence intervals
      const baseDemand = 110 + Math.sin(i * 0.1) * 25;
      const randomVariation = (Math.random() - 0.5) * 40;
      const demand = Math.max(0, Math.round(baseDemand + randomVariation));

      // Confidence intervals (wider for further dates)
      const uncertainty = 10 + (i / days) * 30;
      const lower = Math.max(0, Math.round(demand - uncertainty));
      const upper = Math.round(demand + uncertainty);

      data.push({
        date: date.toISOString().split("T")[0],
        demand: demand,
        lower: lower,
        upper: upper,
      });
    }

    return data;
  };

  const historicalData = generateHistoricalData();
  const forecastData = generateForecastData(selectedRange);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Forecasting</h1>
        <p className="text-gray-600">Weather and yield forecasting tools</p>
      </div>

      {/* Forecast Metrics */}
      <ForecastMetrics
        peakDemandDate="2025-02-15"
        peakDemandValue={245}
        averageDailyDemand={156}
        forecastAccuracyScore={94.2}
        volatilityIndex="Medium"
      />

      {/* Component Selector - Top Left */}
      <div className="mb-6 max-w-xs">
        <ComponentSelector
          components={mockComponents}
          selectedComponent={selectedComponent}
          onSelect={setSelectedComponent}
        />
      </div>

      {/* Selected Component Display */}
      {selectedComponent && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-xs mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Selected Component
          </h3>
          <p className="text-lg font-semibold text-primary">
            {selectedComponent}
          </p>
        </div>
      )}

      {/* Time Range Selector */}
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ForecastChart
          historicalData={historicalData}
          forecastData={forecastData}
        />
      </div>
    </div>
  );
};

export default Forecasting;
