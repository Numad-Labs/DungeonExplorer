import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import FirstArea from "./scenes/FirstArea.js";
import MainMapScene from "./scenes/MainMapScene.js";
import MiniMapDarkForastScene from "./scenes/MiniMapDarkForastScene.js";
import MiniMapBossFightScene from "./scenes/MiniMapBossFightScene.js";
import { initializeMenu } from "./MenuIntegration.jsx";
import MiniMapBeachScene from "./scenes/MiniMapBeachScene.js";
import MiniMapLavaScene from "./scenes/MiniMapLavaScene.js";
import GameManager from "./managers/GameManager.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: "#242424",
    parent: 'game-container',
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            tileBias: 32,
        }
    },
    render: {
        pixelArt: true,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

class Boot extends Phaser.Scene {
    preload() {
        this.load.pack("pack", "assets/preload-asset-pack.json");
    }
    
    create() {
        this.scene.start("Preload");
    }
}

let menuControls = null;

const StartGame = (parent) => {
    const gameManager = new GameManager();
    
    try {
        menuControls = initializeMenu(gameManager);
        console.log("React menu initialized successfully with GameManager");
    } catch (error) {
        console.error("Error initializing React menu:", error);
    }
    
    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');
    
    if (menuContainer) menuContainer.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
    
    console.log("Starting Phaser game...");
    const gameConfig = parent ? { ...config, parent } : config;
    const game = new Phaser.Game(gameConfig);
    
    game.registry.set('gameManager', gameManager);
    console.log("GameManager initialized and registered");
    
    game.scene.add("Boot", Boot, true);
    game.scene.add("Preload", Preload);
    game.scene.add("Level", Level);
    game.scene.add("FirstArea", FirstArea);
    game.scene.add("MainMapScene", MainMapScene);
    game.scene.add("MiniMapDarkForastScene", MiniMapDarkForastScene);
    game.scene.add("MiniMapBossFightScene", MiniMapBossFightScene);
    game.scene.add("MiniMapBeachScene", MiniMapBeachScene);
    game.scene.add("MiniMapLavaScene", MiniMapLavaScene);
    
    window.game = game;
    
    window.returnToMenu = function() {
        console.log("Returning to menu from game");
        
        const gameManager = game.registry.get('gameManager');
        if (gameManager && gameManager.isRunActive) {
            gameManager.endRun("Manual Exit");
        }
        
        if (menuContainer && gameContainer) {
            menuContainer.style.display = 'block';
            gameContainer.style.display = 'none';
        }
        
        window.dispatchEvent(new CustomEvent('gameStateUpdated'));
    };
    
    window.startGame = function() {
        console.log("Start game button clicked");
        console.log("Current GameManager upgrades:", gameManager.passiveUpgrades);
        
        if (menuContainer) menuContainer.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
        
        if (gameManager) {
            if (!gameManager.isRunActive) {
                gameManager.startNewRun();
            }
            console.log("New run started with upgrades:", gameManager.passiveUpgrades);
        }
        
        game.scene.start('MainMapScene');
    };
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer && gameContainer.style.display !== 'none') {
                window.returnToMenu();
            }
        }
    });
    
    return game;
};

window.addEventListener('load', function() {
    console.log("Window loaded - starting game initialization");
    StartGame('game-container');
});

export default StartGame;