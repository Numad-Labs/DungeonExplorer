import React from 'react';
import ReactDOM from 'react-dom';
import MainMenu from './MainMenu';
import { loadFromLocalStorage, saveToLocalStorage } from './GameStorage';

/**
 * Initialize and mount the React menu
 * @returns {Object} Menu controls to show/hide the menu
 */
export function initializeMenu() {
  console.log("Initializing React menu with local storage support");
  
  let menuContainer = document.getElementById('menu-container');
  if (!menuContainer) {
    console.log("Creating menu container");
    menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    menuContainer.style.position = 'absolute';
    menuContainer.style.top = '0';
    menuContainer.style.left = '0';
    menuContainer.style.width = '100%';
    menuContainer.style.height = '100%';
    menuContainer.style.zIndex = '10000';
    document.body.appendChild(menuContainer);
  }
  
  let gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.log("Creating game container");
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.position = 'absolute';
    gameContainer.style.top = '0';
    gameContainer.style.left = '0';
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.zIndex = '1';
    document.body.appendChild(gameContainer);
    
    const canvas = document.querySelector('canvas');
    if (canvas && canvas.parentNode !== gameContainer) {
      console.log("Moving canvas to game container");
      gameContainer.appendChild(canvas);
    }
  }
  
  menuContainer.style.display = 'block';
  gameContainer.style.display = 'none';
  console.log(`Initial container visibility: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
  
  const style = document.createElement('style');
  style.textContent = `
    #menu-container {
      z-index: 10000 !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    #game-container {
      z-index: 1 !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(style);
  
  const gameManager = window.game && window.game.registry 
    ? window.game.registry.get('gameManager') 
    : null;
  
  console.log("GameManager available:", !!gameManager);
  
  const savedData = loadFromLocalStorage();
  if (savedData && gameManager) {
    gameManager.gold = savedData.gold || 500;
    gameManager.passiveUpgrades = {...(savedData.passiveUpgrades || {})};
    gameManager.gameStats = {...(savedData.gameStats || {})};
    console.log("Loaded saved data into GameManager");
  }
  
  window.startGame = function() {
    console.log("startGame function called");
    
    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');
    
    if (!menuContainer || !gameContainer) {
      console.error("Container elements not found!");
      return;
    }
    
    if (gameManager && gameManager.applyPassiveUpgrades) {
      console.log("Applying passive upgrades");
      gameManager.applyPassiveUpgrades();
    } else {
      console.log("No gameManager or applyPassiveUpgrades method available");
    }
    
    if (gameManager) {
      const gameData = {
        gold: gameManager.gold || 0,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        gameStats: gameManager.gameStats || {}
      };
      saveToLocalStorage(gameData);
      console.log("Saved game state to local storage before starting game");
    }
    
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    console.log(`Container visibility changed: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
    
    menuContainer.offsetHeight;
    gameContainer.offsetHeight;
    
    if (window.game && window.game.scene) {
      console.log("Starting MainMapScene");
      
      const activeScenes = window.game.scene.getScenes(true);
      activeScenes.forEach(scene => {
        if (scene.key !== 'MainMapScene') {
          window.game.scene.pause(scene.key);
        }
      });
      
      if (window.game.scene.getScene('MainMapScene')) {
        window.game.scene.stop('MainMapScene');
        window.game.scene.start('MainMapScene');
      } else {
        window.game.scene.start('MainMapScene');
      }
    } else {
      console.error("Game or scene not available!");
    }
  };
  
  window.returnToMenu = function() {
    console.log("returnToMenu function called");
    
    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');
    
    if (!menuContainer || !gameContainer) {
      console.error("Container elements not found!");
      return;
    }
    
    if (gameManager && gameManager.saveGame) {
      console.log("Saving game state via GameManager");
      gameManager.saveGame();
      
      const gameData = {
        gold: gameManager.gold || 0,
        passiveUpgrades: gameManager.passiveUpgrades || {},
        gameStats: gameManager.gameStats || {}
      };
      saveToLocalStorage(gameData);
      console.log("Saved game state to local storage");
    }
    
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    console.log(`Container visibility changed: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
    
    menuContainer.offsetHeight;
    gameContainer.offsetHeight;
    
    window.dispatchEvent(new CustomEvent('gameStateUpdated'));
  };
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log("ESC key pressed");
      const gameContainer = document.getElementById('game-container');
      if (gameContainer && gameContainer.style.display !== 'none') {
        window.returnToMenu();
      }
    }
  });
  
  console.log("Rendering React menu component");
  
  try {
    ReactDOM.render(
      React.createElement(MainMenu, {
        gameManager: gameManager,
        onStartGame: window.startGame
      }), 
      menuContainer
    );
    console.log("React menu rendered successfully");
  } catch (error) {
    console.error("Error rendering React menu:", error);
  }
  
  return {
    show: function() { 
      console.log("Menu show() called");
      const menuContainer = document.getElementById('menu-container');
      const gameContainer = document.getElementById('game-container');
      if (menuContainer && gameContainer) {
        menuContainer.style.display = 'block';
        gameContainer.style.display = 'none';
      }
    },
    hide: function() { 
      console.log("Menu hide() called");
      const menuContainer = document.getElementById('menu-container');
      const gameContainer = document.getElementById('game-container');
      if (menuContainer && gameContainer) {
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';
      }
    }
  };
}