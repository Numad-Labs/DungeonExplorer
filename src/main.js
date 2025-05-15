import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import FirstArea from "./scenes/FirstArea.js";
import MainMapScene from "./scenes/MainMapScene.js";
import MiniMapDarkForastScene from "./scenes/MiniMapDarkForastScene.js";
import MiniMapBossFightScene from "./scenes/MiniMapBossFightScene.js";
import { initializeMenu } from "./MenuIntegration.jsx";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: "#242424",
    parent: 'game-container',
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
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
    try {
        menuControls = initializeMenu();
        console.log("React menu initialized successfully");
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
    
    game.scene.add("Boot", Boot, true);
    game.scene.add("Preload", Preload);
    game.scene.add("Level", Level);
    game.scene.add("FirstArea", FirstArea);
    game.scene.add("MainMapScene", MainMapScene);
    game.scene.add("MiniMapDarkForastScene", MiniMapDarkForastScene);
    game.scene.add("MiniMapBossFightScene", MiniMapBossFightScene);
    
    // Make game globally accessible
    window.game = game;
    
    // Override the startGame function to ensure it works correctly
    window.startGame = function() {
        console.log("Start game button clicked");
        
        // Hide menu container, show game container
        if (menuContainer) menuContainer.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
        
        // Get GameManager if available
        const gameManager = game.registry.get('gameManager');
        if (gameManager && gameManager.applyPassiveUpgrades) {
            gameManager.applyPassiveUpgrades();
        }
        
        // Start the main game scene
        game.scene.start('MainMapScene');
    };
    
    // Add ESC key handler to return to menu
    game.input.keyboard.on('keydown-ESC', function() {
        if (menuControls) {
            menuControls.show();
        }
    });
    
    return game;
};

window.addEventListener('load', function() {
    console.log("Window loaded - starting game initialization");
    StartGame('game-container');
});

export default StartGame;