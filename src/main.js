import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import MainMapScene from "./scenes/MainMapScene.js";
import MiniMapDarkForastScene from "./scenes/MiniMapDarkForastScene.js";
import MiniMapBossFightScene from "./scenes/MiniMapBossFightScene.js";
import MiniMapBeachScene from "./scenes/MiniMapBeachScene.js";
import MiniMapLavaScene from "./scenes/MiniMapLavaScene.js";
import { EventBus } from './game/EventBus';

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
    constructor() {
        super("Boot");
    }
    
    preload() {
        this.load.pack("pack", "assets/preload-asset-pack.json");
    }
    
    create() {
        this.scene.start("Preload");
        EventBus.emit('current-scene-ready', this);
    }
}

const StartGame = (parent, gameManager) => {
    console.log("Starting Phaser game with GameManager...");
    
    const gameConfig = parent ? { ...config, parent } : config;
    const game = new Phaser.Game(gameConfig);
    
    game.registry.set('gameManager', gameManager);
    console.log("GameManager registered with Phaser game");
    
    game.scene.add("Boot", Boot, true);
    game.scene.add("Preload", Preload);
    game.scene.add("Level", Level);
    game.scene.add("MainMapScene", MainMapScene);
    game.scene.add("MiniMapDarkForastScene", MiniMapDarkForastScene);
    game.scene.add("MiniMapBossFightScene", MiniMapBossFightScene);
    game.scene.add("MiniMapBeachScene", MiniMapBeachScene);
    game.scene.add("MiniMapLavaScene", MiniMapLavaScene);
    
    // global event handlers
    EventBus.on('return-to-menu', () => {
        console.log('Return to menu event received');
        if (gameManager && gameManager.isGameRunning) {
            gameManager.handlePlayerDeath("Manual Exit");
        }
    });
    
    // Handle scene transitions
    EventBus.on('change-scene', (sceneName, data) => {
        if (game.scene.isActive(sceneName)) {
            game.scene.restart(sceneName, data);
        } else {
            game.scene.start(sceneName, data);
        }
    });
    
    return game;
};

export default StartGame;