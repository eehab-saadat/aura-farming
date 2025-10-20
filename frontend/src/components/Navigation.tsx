import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  name: string;
  route: string;
  icon: string;
}

const navigationItems: NavItem[] = [
  { name: "Optimization", route: "/", icon: "O" },
  { name: "Forecasting", route: "/forecasting", icon: "F" },
  { name: "Cost Config", route: "/cost-config", icon: "C" },
  { name: "Data Management", route: "/data-management", icon: "M" },
];

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex-1 p-4 space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
        Navigation
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.route}
            to={item.route}
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.route
                ? "bg-primary/10 border border-primary/20 text-primary shadow-sm"
                : "hover:bg-gray-100 text-gray-700 hover:text-primary"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                location.pathname === item.route
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {item.icon}
            </div>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
