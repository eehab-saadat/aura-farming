import React from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface ForecastChartProps {
  historicalData: { date: string; demand: number }[];
  forecastData: {
    date: string;
    demand: number;
    lower: number;
    upper: number;
  }[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({
  historicalData,
  forecastData,
}) => {
  // Combine historical and forecast data for the chart
  const chartData = [
    ...historicalData.map((item) => ({
      ...item,
      type: "historical",
      lower: null,
      upper: null,
    })),
    ...forecastData.map((item) => ({
      ...item,
      type: "forecast",
    })),
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Date: ${label}`}</p>
          {data.type === "historical" ? (
            <p className="text-sm text-blue-600">{`Historical Demand: ${data.demand}`}</p>
          ) : (
            <>
              <p className="text-sm text-cyan-600">{`Forecast Demand: ${data.demand}`}</p>
              <p className="text-sm text-gray-500">{`Confidence: ${data.lower} - ${data.upper}`}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Demand Forecast
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Confidence interval area for forecast data */}
          <Area
            dataKey="upper"
            stackId="1"
            stroke="none"
            fill="#06b6d4"
            fillOpacity={0.1}
            connectNulls={false}
          />
          <Area
            dataKey="lower"
            stackId="1"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            connectNulls={false}
          />

          {/* Historical demand line */}
          <Line
            type="monotone"
            dataKey="demand"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Historical Demand"
            connectNulls={false}
          />

          {/* Forecast demand line */}
          <Line
            type="monotone"
            dataKey="demand"
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast Demand"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
