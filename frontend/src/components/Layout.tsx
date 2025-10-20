import React from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
        {/* Logo/Title */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Aura Farming
            </h1>
          </div>
        </div>

        <Navigation />

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800/50">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-gray-400">Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white/95 shadow-sm border-b border-gray-200 flex items-center justify-between px-6 backdrop-blur-sm">
          {/* App Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">Welcome back!</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-gray-400 rounded"></div>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="w-5 h-5 bg-gray-400 rounded"></div>
            </button>
            <div className="flex items-center space-x-3 ml-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-sm font-medium text-gray-700">User</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
