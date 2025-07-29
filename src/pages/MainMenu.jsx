import React from "react";
import { useGame } from "../context/GameContext";
import MainMenuComponent from "../components/MainMenuComponent";

const MainMenu = ({ onStartGame }) => {
  const { gameManager } = useGame();

  const handleStartGame = () => {
    console.log("Starting game from MainMenu");

    if (gameManager && gameManager.startNewRun) {
      console.log("GameManager ready for new run");
    }

    if (onStartGame) {
      onStartGame();
    }
  };

  return (
    <MainMenuComponent
      gameManager={gameManager}
      onStartGame={handleStartGame}
    />
  );
};

export default MainMenu;
