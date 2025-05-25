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
  console.log(`Container visibility set: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
  
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
    gameManager.gold = savedData.gold;
    gameManager.passiveUpgrades = {...savedData.passiveUpgrades};
    gameManager.gameStats = {...savedData.gameStats};
    console.log("Loaded saved data into GameManager");
  }
  
  window.startGame = function() {
    console.log("startGame function called");
    
    if (gameManager && gameManager.applyPassiveUpgrades) {
      console.log("Applying passive upgrades");
      gameManager.applyPassiveUpgrades();
    }
    
    if (gameManager) {
      const gameData = {
        gold: gameManager.gold,
        passiveUpgrades: gameManager.passiveUpgrades,
        gameStats: gameManager.gameStats
      };
      saveToLocalStorage(gameData);
      console.log("Saved game state to local storage before starting game");
    }
    
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    console.log(`Container visibility changed: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
    
    if (window.game && window.game.scene) {
      console.log("Starting MainMapScene");
      window.game.scene.start('MainMapScene');
    } else {
      console.error("Game or scene not available!");
    }
  };
  
  window.returnToMenu = function() {
    console.log("returnToMenu function called");
    
    if (gameManager && gameManager.saveGame) {
      console.log("Saving game state via GameManager");
      gameManager.saveGame();
      
      const gameData = {
        gold: gameManager.gold,
        passiveUpgrades: gameManager.passiveUpgrades,
        gameStats: gameManager.gameStats
      };
      saveToLocalStorage(gameData);
      console.log("Saved game state to local storage");
    }
    
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    console.log(`Container visibility changed: Menu=${menuContainer.style.display}, Game=${gameContainer.style.display}`);
    
    window.dispatchEvent(new Event('gameStateUpdated'));
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
    console.log("React menu rendered successfully with GameManager");
  } catch (error) {
    console.error("Error rendering React menu:", error);
  }
  
  return {
    show: function() { 
      console.log("Menu show() called");
      menuContainer.style.display = 'block';
      gameContainer.style.display = 'none';
    },
    hide: function() { 
      console.log("Menu hide() called");
      menuContainer.style.display = 'none';
      gameContainer.style.display = 'block';
    }
  };
}