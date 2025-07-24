import Level from "./scenes/Level.js";
import Preload from "./scenes/Preload.js";
import MainMapScene from "./scenes/MainMapScene.js";
import MiniMapDarkForastScene from "./scenes/MiniMapDarkForastScene.js";
import MiniMapBossFightScene from "./scenes/MiniMapBossFightScene.js";
import MiniMapBeachScene from "./scenes/MiniMapBeachScene.js";
import MiniMapLavaScene from "./scenes/MiniMapLavaScene.js";
import { EventBus } from "./game/EventBus";
// import { initializeMenu } from "./MenuIntegration.jsx";
import GameManager from "./managers/GameManager.js";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
    this.scene.start("Preload");
    EventBus.emit("current-scene-ready", this);
  }
}

let menuControls = null;
let game = null;

const StartGame = async (parent) => {
  const gameManager = new GameManager();

  console.log("Starting Phaser game...");
  const gameConfig = parent ? { ...config, parent } : config;
  game = new Phaser.Game(gameConfig);

  // Register GameManager with Phaser
  game.registry.set("gameManager", gameManager);
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

  // Make game globally available
  window.game = game;

  // global event handlers
  EventBus.on("return-to-menu", () => {
    console.log("Return to menu event received");
    if (gameManager && gameManager.isGameRunning) {
      gameManager.handlePlayerDeath("Manual Exit");
    }
  });

  // Handle scene transitions
  EventBus.on("change-scene", (sceneName, data) => {
    if (game.scene.isActive(sceneName)) {
      game.scene.restart(sceneName, data);
    } else {
      game.scene.start(sceneName, data);
    }
  });

  //   try {
  //     // Initialize the React menu (it will wait for GameManager to be available)
  //     console.log("Initializing React menu...");
  //     menuControls = await initializeMenu();
  //     console.log("React menu initialized successfully");
  //   } catch (error) {
  //     console.error("Error initializing React menu:", error);
  //     // Fallback: create basic containers if menu integration failed
  //     createFallbackContainers();
  //   }

  // Set up escape key handler (backup - the menu integration also handles this)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuControls) {
      const gameContainer = document.getElementById("game-container");
      if (gameContainer && gameContainer.style.display !== "none") {
        menuControls.show(); // Use the menu controls
      }
    }
  });

  return game;
};

// Fallback container creation if menu integration fails
function createFallbackContainers() {
  console.log("Creating fallback containers");

  let menuContainer = document.getElementById("menu-container");
  let gameContainer = document.getElementById("game-container");

  if (!menuContainer) {
    menuContainer = document.createElement("div");
    menuContainer.id = "menu-container";
    menuContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            background-color: #242424;
            display: block;
        `;
    document.body.appendChild(menuContainer);
  }

  if (!gameContainer) {
    gameContainer = document.createElement("div");
    gameContainer.id = "game-container";
    gameContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            display: none;
        `;
    document.body.appendChild(gameContainer);
  }

  // Basic fallback functions
  window.returnToMenu = function () {
    console.log("Fallback: Returning to menu");
    if (menuContainer && gameContainer) {
      menuContainer.style.display = "block";
      gameContainer.style.display = "none";
    }
  };

  window.startGame = function () {
    console.log("Fallback: Starting game");
    if (menuContainer && gameContainer) {
      menuContainer.style.display = "none";
      gameContainer.style.display = "block";
    }

    if (game) {
      const gameManager = game.registry.get("gameManager");
      if (gameManager && !gameManager.isRunActive) {
        gameManager.startNewRun();
      }
      game.scene.start("MainMapScene");
    }
  };
}

// Updated window load handler to be async
window.addEventListener("load", async function () {
  await StartGame("game-container");
});

export default StartGame;
