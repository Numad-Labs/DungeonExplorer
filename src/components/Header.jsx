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
      console.log("Start Game button clicked - starting game directly!");
      gameControls.startGame();
    } else {
      console.log("Start Game button clicked - navigating to game with auto-start!");
      navigate("/game?autostart=true");
    }
  };

  // Show different button text based on context
  const getButtonText = () => {
    if (isOnGameRoute && gameControls?.gameState === "playing") {
      return "🏠 Return to Menu";
    }
    return "🎮 Start Game";
  };

  const handleGameAction = () => {
    if (isOnGameRoute && gameControls?.gameState === "playing" && gameControls?.returnToMenu) {
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
            <div className="text-gray-300 text-sm">
              Welcome,{" "}
              <span className="text-yellow-400 font-medium">
                {user.username || "Player"}
              </span>
            </div>
            <button
              onClick={handleGameAction}
              className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors whitespace-nowrap"
            >
              {getButtonText()}
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
            >
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
