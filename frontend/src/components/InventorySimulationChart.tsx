import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface InventoryDataPoint {
  day: number;
  inventory: number;
  demand: number;
  isBelowSafety: boolean;
}

interface InventorySimulationChartProps {
  reorderPoint?: number;
  safetyStock?: number;
  days?: number;
}

const InventorySimulationChart: React.FC<InventorySimulationChartProps> = ({
  reorderPoint = 800,
  safetyStock = 500,
  days = 90,
}) => {
  // Generate mock inventory simulation data
  const generateMockData = (): InventoryDataPoint[] => {
    const data: InventoryDataPoint[] = [];
    let currentInventory = 1000;
    const baseDemand = 25; // Base daily demand
    const demandVariance = 10; // Random variance in demand

    for (let day = 1; day <= days; day++) {
      // Generate demand with some randomness
      const dailyDemand = Math.max(
        10,
        baseDemand + (Math.random() - 0.5) * demandVariance * 2
      );

      // Simulate inventory reduction
      currentInventory -= dailyDemand;

      // Simulate reorders when inventory drops below reorder point
      if (currentInventory <= reorderPoint && day % 30 === 0) {
        // Reorder every 30 days when below reorder point
        currentInventory += 600; // Reorder quantity
      }

      // Ensure inventory doesn't go negative (backorders not modeled)
      currentInventory = Math.max(0, currentInventory);

      data.push({
        day,
        inventory: Math.round(currentInventory),
        demand: Math.round(dailyDemand),
        isBelowSafety: currentInventory < safetyStock,
      });
    }

    return data;
  };

  const data = generateMockData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Day ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${
                entry.name === "Inventory" || entry.name === "Demand"
                  ? " units"
                  : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Create shaded areas for below safety stock
  const shadedAreas = data.reduce((areas: any[], point, index) => {
    if (point.isBelowSafety) {
      const lastArea = areas[areas.length - 1];
      if (lastArea && lastArea.end === index) {
        // Extend existing area
        lastArea.end = index + 1;
      } else {
        // Start new area
        areas.push({ start: index, end: index + 1 });
      }
    }
    return areas;
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Inventory Simulation (90 Days)
        </h3>
        <p className="text-gray-600 text-sm">
          Projected inventory levels based on current demand patterns and
          reorder policies
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              fontSize={12}
              label={{ value: "Days", position: "insideBottom", offset: -10 }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{ value: "Units", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

            {/* Shaded areas for below safety stock */}
            {shadedAreas.map((area, index) => (
              <ReferenceLine
                key={`shaded-${index}`}
                x={area.start + 1}
                stroke="transparent"
                strokeWidth={0}
                label=""
              />
            ))}

            {/* Safety stock reference line */}
            <ReferenceLine
              y={safetyStock}
              stroke="#ef4444"
              strokeDasharray="2 2"
              strokeWidth={2}
              label={{
                value: "Safety Stock",
                position: "top",
                fill: "#ef4444",
                fontSize: 12,
              }}
            />

            {/* Reorder point reference line */}
            <ReferenceLine
              y={reorderPoint}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Reorder Point",
                position: "top",
                fill: "#f59e0b",
                fontSize: 12,
              }}
            />

            {/* Inventory area chart */}
            <Area
              type="monotone"
              dataKey="inventory"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Inventory Level"
            />

            {/* Demand line */}
            <Area
              type="monotone"
              dataKey="demand"
              stroke="#10b981"
              fill="transparent"
              strokeWidth={2}
              name="Daily Demand"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-gray-700">Inventory Level</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-gray-700">Daily Demand</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-amber-500 border-dashed border-t-2"></div>
          <span className="text-gray-700">Reorder Point</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500 border-dotted border-t-2"></div>
          <span className="text-gray-700">Safety Stock</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-800">
          <strong>Critical Zones:</strong> Red-shaded areas indicate periods
          where inventory falls below safety stock levels, increasing the risk
          of stockouts.
        </p>
      </div>
    </div>
  );
};

export default InventorySimulationChart;
