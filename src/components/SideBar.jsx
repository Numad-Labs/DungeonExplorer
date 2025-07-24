import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "./Header.jsx";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar Navigation */}
      <nav className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen">
        <div className="p-4">
          {/* Navigation Links */}
          <div className="space-y-2">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              🏠 Home
            </Link>
            <Link
              to="/game"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/game")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              🎮 Game
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/about")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              ℹ️ About
            </Link>
          </div>

          {/* User Menu */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/profile")
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                👤 Profile
              </Link>
              <Link
                to="/settings"
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/settings")
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                ⚙️ Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1" style={{ minHeight: "calc(100vh - 112px)" }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 py-4">
          <div className="px-4">
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 DungeonExplorer. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Sidebar;
