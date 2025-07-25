import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from '../main';
import { EventBus } from './EventBus';
import { useGame } from '../context/GameContext';

export const PhaserGame = forwardRef(function PhaserGame({ 
  currentActiveScene, 
  showModal, 
  autoStart = false 
}, ref) {
  const game = useRef();
  const { gameManager } = useGame();
  const isGameStarted = useRef(false);

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
                EventBus.emit('game-started');
              }, 100);
            }
          },
          stopGame: () => {
            console.log("Manual game stop triggered");
            if (game.current && isGameStarted.current) {
              isGameStarted.current = false;
              
              const activeScenes = game.current.scene.getScenes(true);
              activeScenes.forEach(scene => {
                if (scene.scene.key !== "Boot" && scene.scene.key !== "Preload") {
                  game.current.scene.stop(scene.scene.key);
                }
              });
              
              if (gameManager && gameManager.isGameRunning) {
                gameManager.handlePlayerDeath("Manual Exit");
              }
              
              EventBus.emit('game-stopped');
            }
          },
          pauseGame: () => {
            if (game.current && isGameStarted.current) {
              const activeScenes = game.current.scene.getScenes(true);
              activeScenes.forEach(scene => {
                if (scene.scene.key !== "Boot" && scene.scene.key !== "Preload") {
                  game.current.scene.pause(scene.scene.key);
                }
              });
              EventBus.emit('game-paused');
            }
          },
          resumeGame: () => {
            if (game.current && isGameStarted.current) {
              const activeScenes = game.current.scene.getScenes(false);
              activeScenes.forEach(scene => {
                if (scene.scene.key !== "Boot" && scene.scene.key !== "Preload") {
                  game.current.scene.resume(scene.scene.key);
                }
              });
              EventBus.emit('game-resumed');
            }
          },
          getCurrentScene: () => {
            if (game.current) {
              const activeScenes = game.current.scene.getScenes(true);
              return activeScenes.find(scene => 
                scene.scene.key !== "Boot" && scene.scene.key !== "Preload"
              ) || null;
            }
            return null;
          }
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
      
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(currentScene);
      }
      
      if (ref && ref.current) {
        ref.current.scene = currentScene;
      }

      if (currentScene?.scene?.key === "MainMapScene") {
        EventBus.emit('main-scene-started');
      }
    };

    const handlePlayerDeath = (deathData) => {
      console.log("Player death detected:", deathData);
      isGameStarted.current = false;
      
      if (showModal) {
        showModal("GAME_OVER", deathData);
      }
      
      EventBus.emit('game-over', deathData);
    };

    const handleReturnToMenu = () => {
      console.log("Return to menu requested");
      if (ref?.current?.stopGame) {
        ref.current.stopGame();
      }
      EventBus.emit('return-to-menu');
    };

    const handlePauseRequest = () => {
      if (showModal) {
        showModal("PAUSE_MENU");
      }
    };

    EventBus.on('current-scene-ready', handleSceneReady);
    EventBus.on('player-death', handlePlayerDeath);
    EventBus.on('return-to-menu', handleReturnToMenu);
    EventBus.on('pause-game', handlePauseRequest);

    window.addEventListener('playerDeath', (e) => handlePlayerDeath(e.detail));
    window.addEventListener('returnToMenu', handleReturnToMenu);

    return () => {
      EventBus.removeListener('current-scene-ready', handleSceneReady);
      EventBus.removeListener('player-death', handlePlayerDeath);
      EventBus.removeListener('return-to-menu', handleReturnToMenu);
      EventBus.removeListener('pause-game', handlePauseRequest);
      
      window.removeEventListener('playerDeath', (e) => handlePlayerDeath(e.detail));
      window.removeEventListener('returnToMenu', handleReturnToMenu);
    };
  }, [currentActiveScene, showModal, ref]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && isGameStarted.current) {
        EventBus.emit('pause-game');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div 
      id="game-container" 
      className="game-container"
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#242424'
      }}
    />
  );
});

PhaserGame.propTypes = {
  currentActiveScene: PropTypes.func,
  showModal: PropTypes.func,
  autoStart: PropTypes.bool
};

export default PhaserGame;