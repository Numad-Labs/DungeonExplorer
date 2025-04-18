import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import FirstArea from "./scenes/FirstArea.js";

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

const StartGame = (parent) => {
    const gameConfig = parent ? { ...config, parent } : config;
    
    const game = new Phaser.Game(gameConfig);
    
    // Add scenes
    game.scene.add("Preload", Preload);
    game.scene.add("Level", Level);
    game.scene.add("Boot", Boot, true);
    game.scene.add("FirstArea", FirstArea);
    
    return game;
};

window.addEventListener('load', function() {
    StartGame('game-container');
});

export default StartGame;