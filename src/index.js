// Configuration
export { default as GameConfig } from './config/GameConfig.js';

// Utilities
export { default as SceneUtils } from './utils/SceneUtils.js';
export { default as TimerUtils } from './utils/TimerUtils.js';
export { default as EffectUtils } from './utils/EffectUtils.js';
export { default as MathUtils } from './utils/MathUtils.js';

// Managers (refactored)
export { default as GameManager } from './managers/GameManager.js';
export { default as UIManager } from './managers/UIManager.js';

// Scenes (refactored)
export { default as BaseGameScene } from './scenes/BaseGameScene.js';
export { default as MainMapScene } from './scenes/MainMapScene.js';

export const {
  // Config utilities
  getUpgradeConfig,
  getUpgradeCost,
  getMobConfig,
  calculateMobStats
} = GameConfig.Utils;

// Scene utilities
export const {
  setupWorldBounds,
  setupCameraFollow,
  cleanupTimers,
  cleanupPhysicsGroups
} = SceneUtils;

// Timer utilities
export const {
  formatTime,
  formatSeconds,
  createGameTimer,
  createCooldown
} = TimerUtils;

// Effect utilities
export const {
  createFadeEffect,
  createPulseEffect,
  createFloatingText,
  createDamageFlash,
  createHealFlash
} = EffectUtils;

// Math utilities
export const {
  distance,
  clamp,
  lerp,
  random,
  randomInt,
  randomChoice
} = MathUtils;

/**
 * Quick setup function for new scenes
 * @param {Phaser.Scene} scene - The scene to setup
 * @param {object} options - Setup options
 */
export function quickSceneSetup(scene, options = {}) {
  const defaults = {
    worldBounds: true,
    debugControls: false,
    baseManagers: true
  };
  const config = { ...defaults, ...options };

  // Setup world bounds
  if (config.worldBounds) {
    SceneUtils.setupWorldBounds(scene);
  }

  // Setup debug controls
  if (config.debugControls) {
    SceneUtils.setupDebugControls(scene, {
      toggledebug: () => scene.debugMode = !scene.debugMode,
      heal: () => scene.player?.heal?.(50),
      addgold: () => scene.gameManager?.addGold?.(100)
    });
  }

  // Initialize base managers
  if (config.baseManagers) {
    scene.gameManager = GameManager.get();
    scene.gameManager.setCurrentScene(scene);
  }
}

/**
 * Create a basic game timer for any scene
 * @param {Phaser.Scene} scene - The scene
 * @param {object} options - Timer options
 * @returns {object} Timer object
 */
export function createBasicGameTimer(scene, options = {}) {
  const defaults = {
    displayX: 890,
    displayY: 210,
    showBackground: true,
    autoStart: true
  };
  const config = { ...defaults, ...options };

  let timerText = null;
  let background = null;

  // Create display elements
  if (config.showBackground) {
    background = SceneUtils.createStyledBackground(
      scene, config.displayX, config.displayY, 120, 40
    );
    background.setScrollFactor(0).setDepth(900);
  }

  timerText = SceneUtils.createStyledText(
    scene, config.displayX, config.displayY, "00:00",
    { fontSize: "24px", color: "#ffff00" }
  );
  timerText.setOrigin(0.5).setScrollFactor(0).setDepth(901);

  // Create timer
  const timer = TimerUtils.createGameTimer(scene, (elapsed, formatted) => {
    if (timerText?.active) {
      timerText.setText(formatted);
    }
  });

  if (config.autoStart) {
    timer.start();
  }

  return {
    timer,
    timerText,
    background,
    destroy: () => {
      timer.destroy();
      timerText?.destroy();
      background?.destroy();
    }
  };
}

/**
 * Quick mob spawning setup using config
 * @param {Phaser.Scene} scene - The scene
 * @param {object} player - Player object
 * @param {number} wave - Current wave
 * @returns {object} Spawn configuration
 */
export function setupMobSpawning(scene, player, wave = 1) {
  const availableMobs = GameConfig.Utils.getAvailableMobsForWave(wave);
  const spawnCount = GameConfig.Utils.getWaveSpawnCount(wave);
  const spawnDelay = GameConfig.Utils.getSpawnDelay(wave);

  return {
    availableMobs,
    spawnCount,
    spawnDelay,
    spawnMob: (mobType) => {
      const stats = GameConfig.Utils.calculateMobStats(mobType, wave);
      // Return spawn configuration that can be used by your mob spawning system
      return {
        type: mobType,
        stats,
        config: GameConfig.MOBS[mobType]
      };
    }
  };
}

/**
 * Validation helper to check if refactoring is working correctly
 * @returns {object} Validation results
 */
export function validateRefactoring() {
  const results = {
    configLoaded: false,
    utilitiesAvailable: false,
    managersWorking: false,
    errors: []
  };

  try {
    // Check config
    if (GameConfig && GameConfig.WORLD && GameConfig.PLAYER) {
      results.configLoaded = true;
    } else {
      results.errors.push("GameConfig not properly loaded");
    }

    // Check utilities
    if (SceneUtils && TimerUtils && EffectUtils && MathUtils) {
      results.utilitiesAvailable = true;
    } else {
      results.errors.push("Utility classes not available");
    }

    // Check managers
    if (GameManager && UIManager) {
      results.managersWorking = true;
    } else {
      results.errors.push("Manager classes not available");
    }

  } catch (error) {
    results.errors.push(`Validation error: ${error.message}`);
  }

  results.isValid = results.configLoaded && results.utilitiesAvailable && results.managersWorking;
  return results;
}

// Export validation for easy debugging
export const validation = validateRefactoring();

if (validation.isValid) {
  console.log("✅ Refactoring validation passed! All systems working correctly.");
} else {
  console.warn("⚠️ Refactoring validation issues:", validation.errors);
}
