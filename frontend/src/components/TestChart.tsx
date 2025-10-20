import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for the last 7 days
const mockData = [
  { date: "2025-10-14", demand: 85 },
  { date: "2025-10-15", demand: 92 },
  { date: "2025-10-16", demand: 78 },
  { date: "2025-10-17", demand: 105 },
  { date: "2025-10-18", demand: 98 },
  { date: "2025-10-19", demand: 112 },
  { date: "2025-10-20", demand: 89 },
];

const TestChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Demand Trend (Last 7 Days)
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#1E40AF"
              strokeWidth={3}
              dot={{ fill: "#1E40AF", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#1E40AF",
                strokeWidth: 2,
                fill: "#ffffff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TestChart;
