import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import MainMapScene from "./scenes/MainMapScene.js";
import MiniMapDarkForastScene from "./scenes/MiniMapDarkForastScene.js";
import MiniMapBossFightScene from "./scenes/MiniMapBossFightScene.js";
import MiniMapBeachScene from "./scenes/MiniMapBeachScene.js";
import MiniMapLavaScene from "./scenes/MiniMapLavaScene.js";
import { EventBus } from "./game/EventBus";
import GameManager from "./managers/GameManager.js";

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: "#242424",
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      tileBias: 32,
    },
  },
  render: {
    pixelArt: true,
  },
  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
    min: {
      width: 1280,
      height: 720
    },
    max: {
      width: 2560,
      height: 1440
    }
  },
};

class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  
  preload() {
    this.load.pack("pack", "assets/preload-asset-pack.json");
  }
  
  create() {
    // Only start Preload scene, don't auto-start any game scenes
    this.scene.start("Preload");
    EventBus.emit("current-scene-ready", this);
  }
}

let game = null;

const StartGame = (parent, gameManager = null, autoStartGame = false) => {
  console.log("Initializing Phaser game...", { parent, autoStartGame });
  
  // Create or use provided GameManager
  const manager = gameManager || new GameManager();
  
  const gameConfig = parent ? { ...config, parent } : config;
  game = new Phaser.Game(gameConfig);

  // Register GameManager with Phaser
  game.registry.set("gameManager", manager);
  console.log("GameManager initialized and registered with Phaser");

  // Add all scenes
  game.scene.add("Boot", Boot, true);
  game.scene.add("Preload", Preload);
  game.scene.add("Level", Level);
  game.scene.add("MainMapScene", MainMapScene);
  game.scene.add("MiniMapDarkForastScene", MiniMapDarkForastScene);
  game.scene.add("MiniMapBossFightScene", MiniMapBossFightScene);
  game.scene.add("MiniMapBeachScene", MiniMapBeachScene);
  game.scene.add("MiniMapLavaScene", MiniMapLavaScene);

  window.game = game;

  // Set up global event handlers
  EventBus.on("return-to-menu", () => {
    console.log("Return to menu event received");
    if (manager && manager.isGameRunning) {
      manager.handlePlayerDeath("Manual Exit");
    }
    EventBus.emit('game-stopped');
  });

  // Handle scene transitions
  EventBus.on("change-scene", (sceneName, data) => {
    console.log(`Changing scene to: ${sceneName}`);
    
    if (game.scene.isActive(sceneName)) {
      game.scene.restart(sceneName, data);
    } else {
      game.scene.start(sceneName, data);
    }
  });

  // Player health updates for HP bar
  EventBus.on("player-health-update", (healthData) => {
    EventBus.emit('player-health-updated', healthData);
  });

  // Game state updates
  EventBus.on("game-state-update", (gameData) => {
    EventBus.emit('game-state-updated', gameData);
    
    window.dispatchEvent(new CustomEvent('gameStateUpdated', { 
      detail: gameData 
    }));
  });

  // Player death handling
  EventBus.on("player-died", (deathData) => {
    console.log("Player died:", deathData);
    EventBus.emit('player-death', deathData);
    
    window.dispatchEvent(new CustomEvent('playerDeath', { 
      detail: deathData 
    }));
  });

  if (autoStartGame) {
    setTimeout(() => {
      if (manager) {
        manager.startNewRun();
      }
      game.scene.start("MainMapScene");
    }, 1000);
  }
  return game;
};

window.startGameManually = function() {
  if (game) {
    const gameManager = game.registry.get("gameManager");
    if (gameManager) {
      gameManager.startNewRun();
    }
    game.scene.start("MainMapScene");
  }
};

window.stopGameManually = function() {
  console.log("Manual game stop requested");
  if (game) {
    const gameManager = game.registry.get("gameManager");
    if (gameManager && gameManager.isGameRunning) {
      gameManager.handlePlayerDeath("Manual Exit");
    }
    
    // Stop all game scenes except Boot and Preload
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach(scene => {
      if (scene.scene.key !== "Boot" && scene.scene.key !== "Preload") {
        game.scene.stop(scene.scene.key);
      }
    });
  }
};

export default StartGame;