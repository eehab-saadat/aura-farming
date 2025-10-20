import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CostData {
  policy: string;
  holdingCosts: number;
  stockoutCosts: number;
  total: number;
}

interface CostComparisonChartProps {
  currentHoldingCosts?: number;
  currentStockoutCosts?: number;
  optimizedHoldingCosts?: number;
  optimizedStockoutCosts?: number;
}

const CostComparisonChart: React.FC<CostComparisonChartProps> = ({
  currentHoldingCosts = 8500,
  currentStockoutCosts = 12300,
  optimizedHoldingCosts = 10200,
  optimizedStockoutCosts = 6280,
}) => {
  const currentTotal = currentHoldingCosts + currentStockoutCosts;
  const optimizedTotal = optimizedHoldingCosts + optimizedStockoutCosts;
  const savings = currentTotal - optimizedTotal;
  const savingsPercentage = Math.round((savings / currentTotal) * 100);

  const data: CostData[] = [
    {
      policy: "Current Policy",
      holdingCosts: currentHoldingCosts,
      stockoutCosts: currentStockoutCosts,
      total: currentTotal,
    },
    {
      policy: "Optimized Policy",
      holdingCosts: optimizedHoldingCosts,
      stockoutCosts: optimizedStockoutCosts,
      total: optimizedTotal,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              Holding Costs: ${data.holdingCosts.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>
              Stockout Costs: ${data.stockoutCosts.toLocaleString()}
            </p>
            <hr className="my-2" />
            <p className="text-sm font-medium">
              Total: ${data.total.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label to show totals on top of bars
  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#374151"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
      >
        ${value.toLocaleString()}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cost Comparison
        </h3>
        <p className="text-gray-600 text-sm">
          Annual cost breakdown: Current vs Optimized inventory policies
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 40,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="policy"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 12 }}
              label={{ value: "Cost ($)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            {/* Holding Costs - Bottom of stack */}
            <Bar
              dataKey="holdingCosts"
              stackId="costs"
              fill="#3b82f6"
              name="Holding Costs"
              radius={[0, 0, 0, 0]}
            />

            {/* Stockout Costs - Top of stack */}
            <Bar
              dataKey="stockoutCosts"
              stackId="costs"
              fill="#ef4444"
              name="Stockout Costs"
              radius={[4, 4, 0, 0]}
              label={<CustomLabel />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings Summary */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-green-800">
              Annual Savings
            </h4>
            <p className="text-2xl font-bold text-green-600">
              ${savings.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-700">Percentage Reduction</div>
            <div className="text-lg font-semibold text-green-600">
              {savingsPercentage}%
            </div>
          </div>
        </div>
        <p className="text-sm text-green-700 mt-2">
          Optimized policy reduces total inventory costs by balancing holding
          and stockout expenses.
        </p>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">Holding Costs</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">Stockout Costs</span>
        </div>
      </div>
    </div>
  );
};

export default CostComparisonChart;
