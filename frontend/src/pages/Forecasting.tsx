import React, { useState } from "react";
import ForecastChart from "../components/ForecastChart";
import TimeRangeSelector from "../components/TimeRangeSelector";

const Forecasting: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState(90);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isForecasting, setIsForecasting] = useState(false);

  // Test data for API response simulation
  const testForecastData = [
    { date: "2018-01-01", demand: 16430 },
    { date: "2018-01-02", demand: 19240 },
    { date: "2018-01-03", demand: 19395 },
    { date: "2018-01-04", demand: 20896 },
    { date: "2018-01-05", demand: 21967 },
    { date: "2018-01-06", demand: 23497 },
    { date: "2018-01-07", demand: 25510 },
    { date: "2018-01-08", demand: 16512 },
    { date: "2018-01-09", demand: 19423 },
    { date: "2018-01-10", demand: 19482 },
    { date: "2018-01-11", demand: 21026 },
    { date: "2018-01-12", demand: 22070 },
    { date: "2018-01-13", demand: 23098 },
    { date: "2018-01-14", demand: 25336 },
    { date: "2018-01-15", demand: 16224 },
    { date: "2018-01-16", demand: 19490 },
    { date: "2018-01-17", demand: 19401 },
    { date: "2018-01-18", demand: 21110 },
    { date: "2018-01-19", demand: 22287 },
    { date: "2018-01-20", demand: 23249 },
    { date: "2018-01-21", demand: 24737 },
    { date: "2018-01-22", demand: 16010 },
    { date: "2018-01-23", demand: 19020 },
    { date: "2018-01-24", demand: 19339 },
    { date: "2018-01-25", demand: 21028 },
    { date: "2018-01-26", demand: 21969 },
    { date: "2018-01-27", demand: 22854 },
    { date: "2018-01-28", demand: 24189 },
    { date: "2018-01-29", demand: 15768 },
    { date: "2018-01-30", demand: 18826 },
    { date: "2018-01-31", demand: 19636 },
    { date: "2018-02-01", demand: 22732 },
    { date: "2018-02-02", demand: 24140 },
    { date: "2018-02-03", demand: 25258 },
    { date: "2018-02-04", demand: 26284 },
    { date: "2018-02-05", demand: 17632 },
    { date: "2018-02-06", demand: 21105 },
    { date: "2018-02-07", demand: 21526 },
    { date: "2018-02-08", demand: 23261 },
    { date: "2018-02-09", demand: 24180 },
    { date: "2018-02-10", demand: 25551 },
    { date: "2018-02-11", demand: 27000 },
    { date: "2018-02-12", demand: 17458 },
    { date: "2018-02-13", demand: 21107 },
    { date: "2018-02-14", demand: 21434 },
    { date: "2018-02-15", demand: 23034 },
    { date: "2018-02-16", demand: 24163 },
    { date: "2018-02-17", demand: 25364 },
    { date: "2018-02-18", demand: 27241 },
    { date: "2018-02-19", demand: 17279 },
    { date: "2018-02-20", demand: 21088 },
    { date: "2018-02-21", demand: 21568 },
    { date: "2018-02-22", demand: 23196 },
    { date: "2018-02-23", demand: 24105 },
    { date: "2018-02-24", demand: 25307 },
    { date: "2018-02-25", demand: 27076 },
    { date: "2018-02-26", demand: 17097 },
    { date: "2018-02-27", demand: 20920 },
    { date: "2018-02-28", demand: 21425 },
    { date: "2018-03-01", demand: 27060 },
    { date: "2018-03-02", demand: 28529 },
    { date: "2018-03-03", demand: 29603 },
    { date: "2018-03-04", demand: 31680 },
    { date: "2018-03-05", demand: 20090 },
    { date: "2018-03-06", demand: 24925 },
    { date: "2018-03-07", demand: 25138 },
    { date: "2018-03-08", demand: 27201 },
    { date: "2018-03-09", demand: 28305 },
    { date: "2018-03-10", demand: 29930 },
    { date: "2018-03-11", demand: 32066 },
    { date: "2018-03-12", demand: 20806 },
    { date: "2018-03-13", demand: 24977 },
    { date: "2018-03-14", demand: 25004 },
    { date: "2018-03-15", demand: 26958 },
    { date: "2018-03-16", demand: 28410 },
    { date: "2018-03-17", demand: 30330 },
    { date: "2018-03-18", demand: 31916 },
    { date: "2018-03-19", demand: 20533 },
    { date: "2018-03-20", demand: 25155 },
    { date: "2018-03-21", demand: 25167 },
    { date: "2018-03-22", demand: 26901 },
    { date: "2018-03-23", demand: 28468 },
    { date: "2018-03-24", demand: 30606 },
    { date: "2018-03-25", demand: 32262 },
    { date: "2018-03-26", demand: 21166 },
    { date: "2018-03-27", demand: 25196 },
    { date: "2018-03-28", demand: 25089 },
    { date: "2018-03-29", demand: 26898 },
    { date: "2018-03-30", demand: 28746 },
    { date: "2018-03-31", demand: 31058 },
  ];

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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/forecast', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     // Add any required parameters for the forecast API
      //   }),
      // });
      // const apiData = await response.json();

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use test data for now (replace with apiData when API is ready)
      const rawData = testForecastData; // apiData when using real API

      // Take only first 90 items if API returns more
      const limitedData = rawData.slice(0, 90);

      // Transform API data to the required format
      const transformedData = limitedData.map((item: any) => {
        return {
          date: item.date,
          demand: item.demand,
        };
      });

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {forecastData.length > 0 ? (
          <ForecastChart
            forecastData={forecastData.slice(0, selectedRange)} // Show only selected range
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Click "Start Forecasting" to generate forecast data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
