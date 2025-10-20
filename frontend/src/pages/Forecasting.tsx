import React, { useState } from "react";
import ForecastChart from "../components/ForecastChart";
import TimeRangeSelector from "../components/TimeRangeSelector";

const Forecasting: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState(90);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isForecasting, setIsForecasting] = useState(false);

  // Generate forecast data in {yyyy,mm,dd,demand} format
  const generateForecastData = (days: number = 90) => {
    const data = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Generate demand with trend and confidence intervals
      const baseDemand = 110 + Math.sin(i * 0.1) * 25;
      const randomVariation = (Math.random() - 0.5) * 40;
      const demand = Math.max(0, Math.round(baseDemand + randomVariation));

      // Confidence intervals (wider for further dates)
      const uncertainty = 10 + (i / days) * 30;
      const lower = Math.max(0, Math.round(demand - uncertainty));
      const upper = Math.round(demand + uncertainty);

      data.push({
        yyyy: date.getFullYear(),
        mm: String(date.getMonth() + 1).padStart(2, "0"), // getMonth() returns 0-11, so add 1
        dd: String(date.getDate()).padStart(2, "0"),
        demand: demand,
        date: date.toISOString().split("T")[0], // Keep date string for chart compatibility
        lower: lower,
        upper: upper,
      });
    }

    return data;
  };

  const handleStartForecasting = async () => {
    setIsForecasting(true);

    try {
      // Call the predict-demand API endpoint
      const response = await fetch("http://127.0.0.1:5000/predict-demand", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      // Check if API response is successful
      if (!apiData.success) {
        throw new Error(apiData.error || "API request failed");
      }

      // Extract forecast data from API response
      const rawData = apiData.forecast || [];

      // Validate and filter data - ensure date and demand are valid
      const validData = rawData.filter((item: any) => {
        return (
          item &&
          typeof item.date === "string" &&
          item.date.trim() !== "" &&
          typeof item.demand === "number" &&
          !isNaN(item.demand) &&
          item.demand >= 0
        );
      });

      // Sort by date to ensure proper ordering
      validData.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Take only first 90 items if API returns more
      const limitedData = validData.slice(0, 90);

      // Transform API data to the required format (already in correct format)
      const transformedData = limitedData.map((item: any) => ({
        date: item.date,
        demand: Math.round(item.demand), // Ensure integer values
      }));

      setForecastData(transformedData);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      // Fallback to generated data if API fails
      const data = generateForecastData(90);
      setForecastData(data);
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Forecasting</h1>
        {/* <p className="text-gray-600">Weather and yield forecasting tools</p> */}
      </div>

      {/* Start Forecasting Button */}
      <div className="mb-8">
        <button
          onClick={handleStartForecasting}
          disabled={isForecasting}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
            isForecasting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl"
          }`}
        >
          {isForecasting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Forecast...</span>
            </div>
          ) : (
            "Start Forecasting"
          )}
        </button>
      </div>

      {/* Forecast Metrics - Show only when we have data */}
      {/* {forecastData.length > 0 && (
        <ForecastMetrics
          peakDemandDate="2025-02-15"
          peakDemandValue={245}
          averageDailyDemand={156}
          forecastAccuracyScore={94.2}
          volatilityIndex="Medium"
        />
      )} */}

      {/* Time Range Selector */}
      <TimeRangeSelector
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        {isForecasting && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-600 font-medium">
                Generating forecast...
              </p>
            </div>
          </div>
        )}
        {forecastData.length > 0 ? (
          <ForecastChart
            forecastData={forecastData.slice(0, selectedRange)} // Show only selected range
          />
        ) : !isForecasting ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Click "Start Forecasting" to generate forecast data
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Forecasting;
