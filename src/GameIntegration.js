import React from 'react';
import ReactDOM from 'react-dom';
import MainMenu from './MainMenu';
import { loadFromLocalStorage, saveToLocalStorage } from './GameStorage';

// Configuration constants
const CONFIG = {
  CONTAINERS: {
    MENU_ID: 'menu-container',
    GAME_ID: 'game-container'
  },
  Z_INDEX: {
    MENU: '10000',
    GAME: '1'
  },
  SCENES: {
    MAIN: 'MainMapScene'
  }
};

// Container management utilities
const ContainerManager = {
  create(id, zIndex, isVisible = false) {
    let container = document.getElementById(id);
    
    if (!container) {
      container = document.createElement('div');
      container.id = id;
      this.setStyles(container, zIndex, isVisible);
      document.body.appendChild(container);
      console.log(`Created container: ${id}`);
    }
    
    return container;
  },

  setStyles(container, zIndex, isVisible) {
    Object.assign(container.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: zIndex,
      display: isVisible ? 'block' : 'none'
    });
  },

  show(container) {
    if (container) {
      container.style.display = 'block';
      container.offsetHeight; // Force reflow
    }
  },

  hide(container) {
    if (container) {
      container.style.display = 'none';
      container.offsetHeight; // Force reflow
    }
  },

  moveCanvasToGame(gameContainer) {
    const canvas = document.querySelector('canvas');
    if (canvas && canvas.parentNode !== gameContainer) {
      gameContainer.appendChild(canvas);
      console.log("Canvas moved to game container");
    }
  }
};

// CSS utilities
const StyleManager = {
  injectCSS() {
    if (document.getElementById('game-integration-styles')) return;

    const style = document.createElement('style');
    style.id = 'game-integration-styles';
    style.textContent = `
      #${CONFIG.CONTAINERS.MENU_ID} {
        z-index: ${CONFIG.Z_INDEX.MENU} !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      #${CONFIG.CONTAINERS.GAME_ID} {
        z-index: ${CONFIG.Z_INDEX.GAME} !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Game state management
const GameStateManager = {
  gameManager: null,

  init() {
    this.gameManager = window.game?.registry?.get('gameManager') || null;
    console.log("GameManager available:", !!this.gameManager);
    
    if (this.gameManager) {
      this.loadSavedData();
    }
  },

  loadSavedData() {
    try {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        this.gameManager.gold = savedData.gold || 500;
        this.gameManager.passiveUpgrades = { ...(savedData.passiveUpgrades || {}) };
        this.gameManager.gameStats = { ...(savedData.gameStats || {}) };
        console.log("Saved data loaded into GameManager");
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  },

  applyUpgrades() {
    if (this.gameManager?.applyPassiveUpgrades) {
      this.gameManager.applyPassiveUpgrades();
      console.log("Passive upgrades applied");
    }
  },

  saveData() {
    if (!this.gameManager) return;

    try {
      if (this.gameManager.saveGame) {
        this.gameManager.saveGame();
      }

      const gameData = {
        gold: this.gameManager.gold || 0,
        passiveUpgrades: this.gameManager.passiveUpgrades || {},
        gameStats: this.gameManager.gameStats || {}
      };
      
      saveToLocalStorage(gameData);
      console.log("Game data saved");
    } catch (error) {
      console.error("Error saving game data:", error);
    }
  }
};

// Scene management
const SceneManager = {
  startMainScene() {
    if (!window.game?.scene) {
      console.error("Game or scene manager not available!");
      return false;
    }

    try {
      // ENHANCED: Complete scene cleanup before starting new scene
      this.cleanupAllScenes();
      
      // Start main scene fresh
      const mainScene = window.game.scene.getScene(CONFIG.SCENES.MAIN);
      if (mainScene) {
        // Stop and restart the scene to ensure fresh state
        window.game.scene.stop(CONFIG.SCENES.MAIN);
        
        // Small delay to ensure cleanup completes
        setTimeout(() => {
          window.game.scene.start(CONFIG.SCENES.MAIN);
          console.log("MainMapScene started fresh");
        }, 100);
        
        return true;
      } else {
        console.error("MainMapScene not found!");
        return false;
      }
    } catch (error) {
      console.error("Error starting main scene:", error);
      return false;
    }
  },
  
  // NEW: Complete scene cleanup method
  cleanupAllScenes() {
    try {
      const activeScenes = window.game.scene.getScenes(true);
      
      activeScenes.forEach(scene => {
        if (scene.scene.key !== CONFIG.SCENES.MAIN) {
          // Stop non-main scenes
          window.game.scene.pause(scene.scene.key);
        } else {
          // Clean up main scene if it exists
          this.cleanupMainScene(scene);
        }
      });
      
      console.log("All scenes cleaned up");
    } catch (error) {
      console.error("Error cleaning up scenes:", error);
    }
  },
  
  // NEW: Specific main scene cleanup
  cleanupMainScene(scene) {
    try {
      if (!scene) return;
      
      // Clean up UI elements that might persist
      if (scene.children) {
        // Remove all UI containers and health bars
        scene.children.list.forEach(child => {
          if (child && typeof child.destroy === 'function') {
            // Check for UI elements, health bars, text objects
            if (child.type === 'Container' || 
                child.type === 'Rectangle' || 
                child.type === 'Text' ||
                (child.displayWidth && child.displayWidth < 50 && child.displayHeight < 20)) {
              child.destroy();
            }
          }
        });
      }
      
      // Clean up managers if they exist
      if (scene.uiManager && scene.uiManager.shutdown) {
        scene.uiManager.shutdown();
      }
      
      if (scene.gameplayManager && scene.gameplayManager.shutdown) {
        scene.gameplayManager.shutdown();
      }
      
      // Clean up physics groups
      if (scene.physics && scene.physics.world) {
        scene.physics.world.bodies.clear();
      }
      
      console.log("Main scene cleaned up");
    } catch (error) {
      console.error("Error cleaning up main scene:", error);
    }
  }
};

// Main game integration class
class GameIntegration {
  constructor() {
    this.menuContainer = null;
    this.gameContainer = null;
    this.isInitialized = false;
    this.isStartingGame = false; // NEW: Prevent double-starts
  }

  initialize() {
    console.log("Initializing game integration");

    try {
      // Create containers
      this.menuContainer = ContainerManager.create(
        CONFIG.CONTAINERS.MENU_ID, 
        CONFIG.Z_INDEX.MENU, 
        true
      );
      
      this.gameContainer = ContainerManager.create(
        CONFIG.CONTAINERS.GAME_ID, 
        CONFIG.Z_INDEX.GAME, 
        false
      );

      // Move canvas and inject styles
      ContainerManager.moveCanvasToGame(this.gameContainer);
      StyleManager.injectCSS();

      // Initialize game state
      GameStateManager.init();

      // Setup global functions
      this.setupGlobalFunctions();

      // Setup event listeners
      this.setupEventListeners();

      // Render initial menu
      this.renderMenu();

      this.isInitialized = true;
      console.log("Game integration initialized successfully");

    } catch (error) {
      console.error("Error initializing game integration:", error);
    }
  }

  setupGlobalFunctions() {
    window.startGame = () => this.startGame();
    window.returnToMenu = () => this.returnToMenu();
  }

  setupEventListeners() {
    // ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isGameVisible()) {
        this.returnToMenu();
      }
    });
  }

  // IMPROVED: Better game start handling
  startGame() {
    // Prevent multiple simultaneous starts
    if (this.isStartingGame) {
      console.log("Game start already in progress, ignoring duplicate call");
      return;
    }
    
    this.isStartingGame = true;
    console.log("Starting game");

    if (!this.validateContainers()) {
      this.isStartingGame = false;
      return;
    }

    try {
      // Apply upgrades and save data
      GameStateManager.applyUpgrades();
      GameStateManager.saveData();

      // Switch to game view immediately
      this.showGame();

      // Start game scene with cleanup
      const success = SceneManager.startMainScene();
      if (!success) {
        console.error("Failed to start game scene");
        this.showMenu();
      }

    } catch (error) {
      console.error("Error starting game:", error);
      this.showMenu();
    } finally {
      // Reset flag after a delay to prevent rapid clicking
      setTimeout(() => {
        this.isStartingGame = false;
      }, 1000);
    }
  }

  // IMPROVED: Better menu return handling
  returnToMenu() {
    console.log("Returning to menu");

    if (!this.validateContainers()) return;

    try {
      // Save game data
      GameStateManager.saveData();

      // Clean up current scene completely
      SceneManager.cleanupAllScenes();

      // Switch to menu view
      this.showMenu();

      // Trigger React re-render with fresh data
      this.renderMenu();
      window.dispatchEvent(new CustomEvent('gameStateUpdated'));

    } catch (error) {
      console.error("Error returning to menu:", error);
    }
  }

  showMenu() {
    ContainerManager.show(this.menuContainer);
    ContainerManager.hide(this.gameContainer);
    console.log("Switched to menu view");
  }

  showGame() {
    ContainerManager.hide(this.menuContainer);
    ContainerManager.show(this.gameContainer);
    console.log("Switched to game view");
  }

  isGameVisible() {
    return this.gameContainer && this.gameContainer.style.display !== 'none';
  }

  validateContainers() {
    if (!this.menuContainer || !this.gameContainer) {
      console.error("Container elements not found!");
      return false;
    }
    return true;
  }

  // IMPROVED: Better menu rendering with cleanup
  renderMenu() {
    if (!this.menuContainer) {
      console.error("Menu container not available for rendering");
      return;
    }

    try {
      // Complete unmount to prevent memory leaks and state issues
      ReactDOM.unmountComponentAtNode(this.menuContainer);
      
      // Small delay to ensure complete cleanup
      setTimeout(() => {
        // Render fresh component with current game state
        ReactDOM.render(
          React.createElement(MainMenu, {
            gameManager: GameStateManager.gameManager,
            onStartGame: () => this.startGame()
          }), 
          this.menuContainer
        );
        
        console.log("React menu rendered successfully");
      }, 50);
      
    } catch (error) {
      console.error("Error rendering React menu:", error);
    }
  }

  // Public API
  getControls() {
    return {
      show: () => this.showMenu(),
      hide: () => this.showGame(),
      refresh: () => this.renderMenu(),
      isInitialized: () => this.isInitialized
    };
  }
}

// Global instance
let gameIntegration = null;

/**
 * Initialize and mount the React menu
 * @returns {Object} Menu controls to show/hide the menu
 */
export function initializeMenu() {
  if (!gameIntegration) {
    gameIntegration = new GameIntegration();
  }

  gameIntegration.initialize();
  return gameIntegration.getControls();
}

// Export for external use if needed
export { gameIntegration };