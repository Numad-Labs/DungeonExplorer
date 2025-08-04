import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameControls } from "../context/GameControlsContext.jsx";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { gameControls } = useGameControls();

  const isOnGameRoute = location.pathname.startsWith("/game");

  const startGame = () => {
    if (isOnGameRoute && gameControls?.startGame) {
      gameControls.startGame();
    } else {
      navigate("/game");
    }
  };

  // Show different button text based on context
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
    <header className="bg-dark-secondary border-b border-dark-secondary h-16 flex items-center justify-between px-6">
      <div className="flex items-center"></div>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <h1 className="text-yellow-400 text-xl">
              <span className="text-white font-medium">Welcome, </span>
              <span className="text-yellow-400 font-medium">
                {user?.data?.username || user?.username || "Player"}
              </span>
            </h1>
            <button
              onClick={handleGameAction}
              className="px-6 py-3 text-sm pt-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors whitespace-nowrap shadow-lg"
            >
              {getButtonText()}
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
              onClick={logout}
              className="px-6 py-3 pt-4 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors whitespace-nowrap shadow-lg"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
