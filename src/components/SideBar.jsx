import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "./Header.jsx";
import Menu from "./icons/Menu.jsx";
import Trending from "./icons/Trending.jsx";
import Quest from "./icons/Quest.jsx";
import Market from "./icons/Market.jsx";
import Guide from "./icons/Guide.jsx";
import User from "./icons/User.jsx";
import Logout from "./icons/Logout.jsx";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-white flex">
      {/* Left Sidebar Navigation */}
      <nav className="bg-dark-secondary border-r border-dark-secondary w-64 min-h-screen relative">
        <div className="p-4">
          <img
            src="/logo.svg"
            alt="Logo"
            className=" mb-16"
            draggable="false"
          />
          {/* Navigation Links */}
          <div className=" gap-5 flex flex-col">
            <Link
              to="/"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <Menu size={20} />
              <p className="text-button-48-pixelify">Dashboard</p>
            </Link>
            <Link
              to="/leaderboard"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/leaderboard")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <Trending size={20} />
              <p className="text-button-48-pixelify">Leaderboard</p>
            </Link>
            <Link
              to="/quest"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/quest")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <Quest size={20} />
              <p className="text-button-48-pixelify">Quest</p>
            </Link>
            <Link
              to="/market"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/market")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <Market size={20} />
              <p className="text-button-48-pixelify">Market</p>
            </Link>
            <Link
              to="/guide"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/guide")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <Guide size={20} />
              <p className="text-button-48-pixelify">Guide</p>
            </Link>
            <Link
              to="/account"
              className={` flex gap-3 pl-6 pr-5 py-3 outline-none border-none  text-sm font-medium transition-colors ${
                isActive("/account")
                  ? "bg-translucent-light-8 text-light-primary"
                  : "text-light-primary hover:bg-translucent-light-8"
              }`}
            >
              <User size={20} />
              <p className="text-button-48-pixelify">Account</p>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full flex gap-3 pl-6 pr-5 py-3 outline-none border-none text-sm font-medium transition-colors text-light-primary hover:bg-translucent-light-8"
            >
              <Logout size={20} />
              <p className="text-button-48-pixelify">Logout</p>
            </button>
          </div>

          {/* User Menu */}
          {/* <div className="mt-8 pt-4 border-t border-gray-700">
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
          </div> */}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen bg-dark-secondary">
        {/* Header */}
        <Header />
        {/* Main Content */}
        <Outlet />

        {/* Footer */}
        {/* <footer className="bg-gray-800 border-t border-gray-700 py-4">
          <div className="px-4">
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 DungeonExplorer. All rights reserved.</p>
            </div>
          </div>
        </footer> */}
      </div>
    </div>
  );
};

export default Sidebar;
