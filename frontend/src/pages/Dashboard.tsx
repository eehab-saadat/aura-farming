import React from "react";
import StatsCard from "../components/StatsCard";
import TestChart from "../components/TestChart";
import ComponentCard from "../components/ComponentCard";

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor your inventory operations and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Components"
          value={24}
          icon={
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded"></div>
            </div>
          }
        />

        <StatsCard
          title="Active Alerts"
          value={3}
          change="-2 from last week"
          icon={
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-warning rounded"></div>
            </div>
          }
        />

        <StatsCard
          title="Cost Savings (Month)"
          value="$15,420"
          change="+12%"
          icon={
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-success rounded"></div>
            </div>
          }
        />

        <StatsCard
          title="Inventory Health"
          value={87}
          change="+5 points"
          icon={
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-accent rounded"></div>
            </div>
          }
        />
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <TestChart />
      </div>

      {/* Component Cards Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Component Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ComponentCard
            componentName="Engine Assembly"
            status="healthy"
            demandData={[
              { date: "2025-10-14", value: 85 },
              { date: "2025-10-15", value: 92 },
              { date: "2025-10-16", value: 78 },
              { date: "2025-10-17", value: 105 },
              { date: "2025-10-18", value: 98 },
              { date: "2025-10-19", value: 112 },
              { date: "2025-10-20", value: 89 },
            ]}
          />
          <ComponentCard
            componentName="Transmission Unit"
            status="warning"
            demandData={[
              { date: "2025-10-14", value: 65 },
              { date: "2025-10-15", value: 72 },
              { date: "2025-10-16", value: 58 },
              { date: "2025-10-17", value: 85 },
              { date: "2025-10-18", value: 78 },
              { date: "2025-10-19", value: 92 },
              { date: "2025-10-20", value: 69 },
            ]}
          />
          <ComponentCard
            componentName="Brake System"
            status="critical"
            demandData={[
              { date: "2025-10-14", value: 45 },
              { date: "2025-10-15", value: 52 },
              { date: "2025-10-16", value: 38 },
              { date: "2025-10-17", value: 65 },
              { date: "2025-10-18", value: 58 },
              { date: "2025-10-19", value: 72 },
              { date: "2025-10-20", value: 49 },
            ]}
          />
          <ComponentCard
            componentName="Electrical Harness"
            status="healthy"
            demandData={[
              { date: "2025-10-14", value: 95 },
              { date: "2025-10-15", value: 102 },
              { date: "2025-10-16", value: 88 },
              { date: "2025-10-17", value: 115 },
              { date: "2025-10-18", value: 108 },
              { date: "2025-10-19", value: 122 },
              { date: "2025-10-20", value: 99 },
            ]}
          />
          <ComponentCard
            componentName="Fuel Injector"
            status="healthy"
            demandData={[
              { date: "2025-10-14", value: 75 },
              { date: "2025-10-15", value: 82 },
              { date: "2025-10-16", value: 68 },
              { date: "2025-10-17", value: 95 },
              { date: "2025-10-18", value: 88 },
              { date: "2025-10-19", value: 102 },
              { date: "2025-10-20", value: 79 },
            ]}
          />
          <ComponentCard
            componentName="Cooling Fan"
            status="warning"
            demandData={[
              { date: "2025-10-14", value: 55 },
              { date: "2025-10-15", value: 62 },
              { date: "2025-10-16", value: 48 },
              { date: "2025-10-17", value: 75 },
              { date: "2025-10-18", value: 68 },
              { date: "2025-10-19", value: 82 },
              { date: "2025-10-20", value: 59 },
            ]}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-success rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Harvest completed in Farm A
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-accent rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Irrigation system activated
                  </p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-warning rounded"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Weather alert: High temperature
                  </p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Colors Showcase */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Theme Colors
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Primary</p>
                <p className="text-xs text-gray-500">#1E40AF</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Accent</p>
                <p className="text-xs text-gray-500">#06B6D4</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <div className="w-4 h-4 bg-success rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Success</p>
                <p className="text-xs text-gray-500">#10B981</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
              <div className="w-4 h-4 bg-warning rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Warning</p>
                <p className="text-xs text-gray-500">#F59E0B</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-error/5 border border-error/20">
              <div className="w-4 h-4 bg-error rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Error</p>
                <p className="text-xs text-gray-500">#EF4444</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
