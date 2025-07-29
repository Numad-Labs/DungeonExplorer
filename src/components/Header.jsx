import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { user, logout } = useAuth();

  //   const { gameManager, onStartGame } = useGame();

  //   console.log({ gameManager, onStartGame });
  //   const startGame = () => {
  //     // setShowDeathScreen(false);
  //     if (gameManager && gameManager.startNewRun) {
  //       gameManager.startNewRun();
  //     }
  //     if (onStartGame) {
  //       onStartGame();
  //     }
  //   };
  return (
    <header className="bg-dark-primary border-b border-dark-secondary h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-yellow-400">DungeonExplorer</h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <>
            <div className="text-gray-300 text-sm">
              Welcome,{" "}
              <span className="text-yellow-400 font-medium">
                {user.username || "Player"}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
            >
              🚪 Logout
            </button>
            {/* <button
              onClick={startGame}
              style={{
                backgroundColor: "#3F8F3F",
                color: "white",
                border: "none",
                padding: "18px",
                borderRadius: "8px",
                width: "100%",
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {"🎮 Start Game"}
            </button> */}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
