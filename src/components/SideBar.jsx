import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useGameControls } from "../context/GameControlsContext.jsx";
import Header from "./Header.jsx";
import Menu from "./icons/Menu.jsx";
import Trending from "./icons/Trending.jsx";
import Quest from "./icons/Quest.jsx";
import Market from "./icons/Market.jsx";
import Guide from "./icons/Guide.jsx";
import User from "./icons/User.jsx";
import Logout from "./icons/Logout.jsx";
import PlayerStatsPanel from "./PlayerStatsPanel.jsx";
import Play from "./icons/Play.jsx";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { gameControls } = useGameControls();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isOnGameRoute = location.pathname.startsWith("/game");

  const startGame = () => {
    if (isOnGameRoute && gameControls?.startGame) {
      gameControls.startGame();
    } else {
      navigate("/game");
    }
  };

  const getButtonText = () => {
    if (isOnGameRoute && gameControls?.gameState === "playing") {
      return "🏠 Return to Menu";
    }
    return "Start Game";
  };

  const handleGameAction = () => {
    if (
      isOnGameRoute &&
      gameControls?.gameState === "playing" &&
      gameControls?.returnToMenu
    ) {
      gameControls.returnToMenu();
    } else {
      startGame();
    }
  };

  return (
    <div className="min-h-screen text-white flex ">
      {/* Left Sidebar Navigation */}
      <nav className="bg-dark-secondary border-r-2  border-r-dark-tertiary w-64 min-h-screen relative">
        <div className="p-4 flex flex-col">
          <div className="mb-16 flex flex-col gap-3 justify-center items-center">
            <img src="/logo.svg" alt="Logo" draggable="false" />
            <p className="text-heading-1-alagard">Insomnus</p>
          </div>

          {/* Navigation Links */}
          <div className=" gap-5 flex flex-col">
            <div className="">
              <button
                onClick={handleGameAction}
                className="w-full flex gap-4 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-lg"
              >
                <Play size={20} />
                {getButtonText()}
              </button>
            </div>

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
          </div>

          {/* Play Button */}

          {/* User Dropdown */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="relative">
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-tertiary border border-dark-tertiary rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      to="/account"
                      className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-light-primary hover:bg-translucent-light-8 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={20} />
                      <span className="text-button-48-pixelify">Account</span>
                    </Link>
                    <div className="border-t border-gray-600 my-1"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-light-primary hover:bg-translucent-light-8 transition-colors"
                    >
                      <Logout size={20} color={"#CC1508"} />
                      <span className="text-button-48-pixelify text-[#CC1508] ">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown Trigger Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex gap-3  p-2 items-center outline-none bg-translucent-light-8 border-none text-sm font-medium transition-colors text-light-primary hover:bg-translucent-light-8"
              >
                <div className="w-8 h-8 bg-gradient-to-b from-[#E55151] to-transparent rounded-full"></div>
                <p className="text-button-16-pixelify">
                  {user.walletAddress.slice(0, 4)}...
                  {user.walletAddress.slice(-4)}
                </p>
                {/* <svg
                  className={`ml-auto transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>*/}
              </button>
            </div>
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
        {/* <Header />*/}
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
