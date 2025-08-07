import PropTypes from "prop-types";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import StartGame from "../main";
import { EventBus } from "./EventBus";
import { useGame } from "../context/GameContext";
import DeathLoadingScreen from "../components/DeathLoadingScreen.jsx";

export const PhaserGame = forwardRef(function PhaserGame(
  {
    currentActiveScene,
    showModal,
    autoStart = false,
    onReturnToMainMenu, // New prop for routing to main menu
  },
  ref
) {
  const game = useRef();
  const { gameManager } = useGame();
  const isGameStarted = useRef(false);

  // State for death loading screen
  const [showDeathLoading, setShowDeathLoading] = useState(false);
  const [deathData, setDeathData] = useState(null);

  useLayoutEffect(() => {
    if (game.current === undefined) {
      game.current = StartGame("game-container", gameManager, false);

      if (ref !== null) {
        ref.current = {
          game: game.current,
          scene: null,
          gameManager: gameManager,
          startGame: () => {
            console.log("Manual game start triggered");
            if (game.current && gameManager && !isGameStarted.current) {
              isGameStarted.current = true;

              if (gameManager.applyPassiveUpgrades) {
                gameManager.applyPassiveUpgrades();
              }

              if (gameManager.startNewRun) {
                gameManager.startNewRun();
              }

              setTimeout(() => {
                game.current.scene.start("MainMapScene");
                EventBus.emit("game-started");
              }, 100);
            }
          },
          stopGame: () => {
            console.log("Manual game stop triggered");
            if (game.current && isGameStarted.current) {
              isGameStarted.current = false;

              const activeScenes = game.current.scene.getScenes(true);
              activeScenes.forEach((scene) => {
                if (scene.key !== "Boot" && scene.key !== "Preload") {
                  game.current.scene.stop(scene.key);
                }
              });

              if (gameManager && gameManager.isGameRunning) {
                gameManager.handlePlayerDeath("Manual Exit");
              }

              EventBus.emit("game-stopped");
            }
          },
          pauseGame: () => {
            if (game.current && isGameStarted.current) {
              const activeScenes = game.current.scene.getScenes(true);
              activeScenes.forEach((scene) => {
                if (scene.key !== "Boot" && scene.key !== "Preload") {
                  game.current.scene.pause(scene.key);
                }
              });
              EventBus.emit("game-paused");
            }
          },
          resumeGame: () => {
            if (game.current && isGameStarted.current) {
              const activeScenes = game.current.scene.getScenes(false);
              activeScenes.forEach((scene) => {
                if (scene.key !== "Boot" && scene.key !== "Preload") {
                  game.current.scene.resume(scene.key);
                }
              });
              EventBus.emit("game-resumed");
            }
          },
          getCurrentScene: () => {
            if (game.current) {
              const activeScenes = game.current.scene.getScenes(true);
              return (
                activeScenes.find(
                  (scene) => scene.key !== "Boot" && scene.key !== "Preload"
                ) || null
              );
            }
            return null;
          },
        };
      }

      if (autoStart && ref?.current?.startGame) {
        setTimeout(() => {
          ref.current.startGame();
        }, 100);
      }
    }

    return () => {
      if (game.current) {
        console.log("Destroying Phaser game");
        isGameStarted.current = false;
        game.current.destroy(true);
        game.current = undefined;
      }
    };
  }, [ref, gameManager, autoStart]);

  useEffect(() => {
    const handleSceneReady = (currentScene) => {
      console.log("Scene ready:", currentScene?.scene?.key);

      if (currentActiveScene && typeof currentActiveScene === "function") {
        currentActiveScene(currentScene);
      }

      if (ref && ref.current) {
        ref.current.scene = currentScene;
      }

      if (currentScene?.scene?.key === "MainMapScene") {
        EventBus.emit("main-scene-started");
      }
    };

    const handlePlayerDeath = (playerDeathData) => {
      console.log("Player death detected:", playerDeathData);
      isGameStarted.current = false;

      // Store death data for the loading screen
      setDeathData(playerDeathData);

      // Stop the game scenes
      if (game.current) {
        const activeScenes = game.current.scene.getScenes(true);
        activeScenes.forEach((scene) => {
          if (scene.key !== "Boot" && scene.key !== "Preload") {
            game.current.scene.stop(scene.key);
          }
        });
      }

      // Show death loading screen
      setShowDeathLoading(true);

      EventBus.emit("game-over", playerDeathData);
    };

    const handleReturnToMenu = () => {
      console.log("Return to menu requested");
      if (ref?.current?.stopGame) {
        ref.current.stopGame();
      }
      EventBus.emit("return-to-menu");
    };

    const handlePauseRequest = () => {
      if (showModal) {
        showModal("PAUSE_MENU");
      }
    };

    EventBus.on("current-scene-ready", handleSceneReady);
    EventBus.on("player-died", handlePlayerDeath);
    EventBus.on("return-to-menu", handleReturnToMenu);
    EventBus.on("pause-game", handlePauseRequest);

    window.addEventListener("playerDeath", (e) => handlePlayerDeath(e.detail));
    window.addEventListener("returnToMenu", handleReturnToMenu);

    return () => {
      EventBus.removeListener("current-scene-ready", handleSceneReady);
      EventBus.removeListener("player-died", handlePlayerDeath);
      EventBus.removeListener("return-to-menu", handleReturnToMenu);
      EventBus.removeListener("pause-game", handlePauseRequest);

      window.removeEventListener("playerDeath", (e) =>
        handlePlayerDeath(e.detail)
      );
      window.removeEventListener("returnToMenu", handleReturnToMenu);
    };
  }, [currentActiveScene, showModal, ref]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && isGameStarted.current) {
        EventBus.emit("pause-game");
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Handle death loading completion
  const handleDeathLoadingComplete = () => {
    setShowDeathLoading(false);
    setDeathData(null);

    // Route to main menu
    if (onReturnToMainMenu && typeof onReturnToMainMenu === "function") {
      onReturnToMainMenu();
    } else {
      console.log("No onReturnToMainMenu function provided");
      // Fallback - you could emit an event or use your routing system here
      EventBus.emit("navigate-to-main-menu");
    }
  };

  return (
    <>
      <div
        id="game-container"
        className="game-container"
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#242424",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      />

      {/* Death Loading Screen */}
      <DeathLoadingScreen
        isVisible={showDeathLoading}
        deathData={deathData}
        onComplete={handleDeathLoadingComplete}
        loadingDuration={3000} // 3 seconds
      />
    </>
  );
});

PhaserGame.propTypes = {
  currentActiveScene: PropTypes.func,
  showModal: PropTypes.func,
  autoStart: PropTypes.bool,
  onReturnToMainMenu: PropTypes.func, // New prop type
};

export default PhaserGame;
