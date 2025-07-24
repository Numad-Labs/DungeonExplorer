import React, { createContext, useContext, useEffect, useState } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "../GameStorage.js";
import GameManager from "../managers/GameManager.js";

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameManager] = useState(() => new GameManager());

  // const [gameManager, setGameManager] = useState(null);
  console.log("gameManager", gameManager);
  const [isGameInitialized, setIsGameInitialized] = useState(false);
  const [gameContainer, setGameContainer] = useState(null);

  useEffect(() => {
    // Initialize game manager when available
    const checkGameManager = () => {
      const manager = window.game?.registry?.get("gameManager") || null;
      if (manager && !gameManager) {
        console.log("GameManager found and initialized");
        setGameManager(manager);
        loadSavedData(manager);
      }
    };

    // Check immediately and set up polling
    checkGameManager();
    const interval = setInterval(checkGameManager, 1000);

    return () => clearInterval(interval);
  }, [gameManager]);

  const loadSavedData = (manager) => {
    try {
      const savedData = loadFromLocalStorage();
      if (savedData && manager) {
        manager.gold = savedData.gold || 500;
        manager.passiveUpgrades = { ...(savedData.passiveUpgrades || {}) };
        manager.allTimeStats = { ...(savedData.allTimeStats || {}) };
        console.log("Saved data loaded into GameManager");
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  const saveGameData = () => {
    if (!gameManager) return;

    try {
      if (gameManager.saveGame) {
        gameManager.saveGame();
      }

      const gameData = {
        gold: gameManager.gold || 0,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        allTimeStats: gameManager.allTimeStats || {},
      };

      saveToLocalStorage(gameData);
      console.log("Game data saved");
    } catch (error) {
      console.error("Error saving game data:", error);
    }
  };

  const initializeGameContainer = () => {
    if (gameContainer) return gameContainer;

    let container = document.getElementById("phaser-game-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "phaser-game-container";
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.zIndex = "1";
      document.body.appendChild(container);

      // Move canvas to this container
      const canvas = document.querySelector("canvas");
      if (canvas && canvas.parentNode !== container) {
        container.appendChild(canvas);
        console.log("Canvas moved to game container");
      }
    }

    setGameContainer(container);
    return container;
  };

  const startGameScene = () => {
    if (!window.game?.scene) {
      console.error("Game or scene manager not available!");
      return false;
    }

    try {
      // Apply upgrades before starting
      if (gameManager?.applyPassiveUpgrades) {
        gameManager.applyPassiveUpgrades();
      }

      // Save data
      saveGameData();

      // Initialize game container
      const container = initializeGameContainer();

      // Clean up existing scenes
      cleanupAllScenes();

      // Start main scene
      const mainScene = window.game.scene.getScene("MainMapScene");
      if (mainScene) {
        window.game.scene.stop("MainMapScene");
        setTimeout(() => {
          window.game.scene.start("MainMapScene");
          console.log("MainMapScene started fresh");
        }, 100);
        return true;
      } else {
        console.error("MainMapScene not found!");
        return false;
      }
    } catch (error) {
      console.error("Error starting game scene:", error);
      return false;
    }
  };

  const cleanupAllScenes = () => {
    try {
      const activeScenes = window.game.scene.getScenes(true);

      activeScenes.forEach((scene) => {
        if (scene.scene.key !== "MainMapScene") {
          window.game.scene.pause(scene.scene.key);
        }
      });

      console.log("All scenes cleaned up");
    } catch (error) {
      console.error("Error cleaning up scenes:", error);
    }
  };

  const stopGame = () => {
    try {
      // Save data before stopping
      saveGameData();

      // Clean up scenes
      cleanupAllScenes();

      console.log("Game stopped and cleaned up");
    } catch (error) {
      console.error("Error stopping game:", error);
    }
  };

  const value = {
    gameManager,
    isGameInitialized,
    startGameScene,
    stopGame,
    saveGameData,
    initializeGameContainer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
