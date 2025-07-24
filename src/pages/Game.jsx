import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import GameCanvas from "../components/GameCanvas";
import PhaserGame from "../game/PhaserGame";

const Game = () => {
  const navigate = useNavigate();
  const phaserRef = useRef();
  const { gameManager, startGameScene, stopGame } = useGame();
  const [isGameRunning, setIsGameRunning] = useState(false);

  const [gameState, setGameState] = useState({
    gold: gameManager.gold || 500,
    passiveUpgrades: gameManager.passiveUpgrades || {},
    allTimeStats: gameManager.allTimeStats || {},
    lastRunStats: gameManager.lastRunStats || null,
    currentRunStats: gameManager.currentRunStats || {},
  });

  useEffect(() => {
    const handleGameStateUpdate = () => {
      setGameState({
        gold: gameManager.gold || 500,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        allTimeStats: gameManager.allTimeStats || {},
        lastRunStats: gameManager.lastRunStats || null,
        currentRunStats: gameManager.currentRunStats || {},
      });
    };

    const handlePlayerDeath = () => {
      setTimeout(() => setCurrentView("menu"), 2000);
    };

    EventBus.on("game-state-updated", handleGameStateUpdate);
    EventBus.on("player-death", handlePlayerDeath);
    EventBus.on("return-to-menu", () => returnToMenu());

    window.addEventListener("gameStateUpdated", handleGameStateUpdate);
    window.addEventListener("playerDeath", handlePlayerDeath);

    return () => {
      EventBus.removeListener("game-state-updated", handleGameStateUpdate);
      EventBus.removeListener("player-death", handlePlayerDeath);
      EventBus.removeListener("return-to-menu");
      window.removeEventListener("gameStateUpdated", handleGameStateUpdate);
      window.removeEventListener("playerDeath", handlePlayerDeath);
    };
  }, [gameManager]);

  const startGame = () => {
    if (gameManager) {
      gameManager.startNewRun();
      setIsGameRunning(true);
    }
  };

  useEffect(() => {
    startGame();
  }, []);

  const returnToMenu = () => {
    if (gameManager && gameManager.isGameRunning) {
      gameManager.handlePlayerDeath("Manual Exit");
    }
    navigate("/game");
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && currentView === "game") {
        returnToMenu();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentView]);

  useEffect(() => {
    // Start the game when this component mounts
    const success = startGameScene();
    if (success) {
      setIsGameRunning(true);
    } else {
      console.error("Failed to start game, returning to menu");
      navigate("/game/menu");
    }

    // ESC key handler
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        handleReturnToMenu();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      stopGame();
      setIsGameRunning(false);
    };
  }, [startGameScene, stopGame, navigate]);

  const handleReturnToMenu = () => {
    stopGame();
    navigate("/game/menu");
  };

  if (!gameManager) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1a1a1a",
          color: "white",
        }}
      >
        <div>Loading game...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
      }}
    >
      {isGameRunning && (
        <PhaserGame
          ref={phaserRef}
          gameManager={gameManager}
          onReturnToMenu={returnToMenu}
        />
      )}
      {/* Optional: Game UI overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          color: "white",
          fontSize: "14px",
        }}
      >
        Press ESC to return to menu
      </div>
    </div>
  );
};

export default Game;
