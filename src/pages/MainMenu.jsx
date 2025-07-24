// pages/MainMenu.jsx (updated)
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import MainMenuComponent from "../components/MainMenuComponent"; // Your existing MainMenu component

const MainMenu = () => {
  const navigate = useNavigate();
  const { gameManager } = useGame();

  const handleStartGame = () => {
    console.log("Starting game from React Router");

    // Initialize game manager state
    if (gameManager && gameManager.startNewRun) {
      gameManager.startNewRun();
    }

    // Navigate to game route
    navigate("/game/play");
  };

  return (
    <MainMenuComponent
      gameManager={gameManager}
      onStartGame={handleStartGame}
    />
  );
};

export default MainMenu;
