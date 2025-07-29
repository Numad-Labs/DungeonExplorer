import { EventBus } from "../game/EventBus";

/**
 * Simple Game Bridge for DungeonExplorer - enhances existing EventBus communication
 */
class GameBridge {
  constructor() {
    this.gameManager = null;
    this.currentScene = null;
    this.isConnected = false;
    this.init();
  }

  init() {
    this.startPolling();
    this.setupEventEnhancement();
    this.isConnected = true;
    console.log('GameBridge connected');
    EventBus.emit('bridge-connected');
  }

  startPolling() {
    // Poll for game references every 100ms
    setInterval(() => {
      this.updateGameReferences();
      this.syncGameData();
    }, 100);
  }

  updateGameReferences() {
    const gameManagerFromRegistry = window.game?.registry?.get('gameManager');
    const gameManagerFromGlobal = window.gameManager;
    const gameManagerFromScene = window.currentGameScene?.gameManager;
    
    const newGameManager = gameManagerFromRegistry || gameManagerFromGlobal || gameManagerFromScene || null;
    
    if (newGameManager && newGameManager !== this.gameManager) {
      this.gameManager = newGameManager;
      console.log('GameBridge: GameManager connected');
    }

    // Get current scene with better fallback logic
    const sceneFromGame = window.game?.scene?.getScene('MainMapScene');
    const sceneFromGlobal = window.currentGameScene;
    
    const newScene = sceneFromGame || sceneFromGlobal || null;
    
    if (newScene && newScene !== this.currentScene) {
      this.currentScene = newScene;
      console.log('GameBridge: Scene connected');
      
      if (newScene.player || newScene.playerPrefab) {
        this.player = newScene.player || newScene.playerPrefab;
        console.log('GameBridge: Player connected');
      }
    }
  }

  syncGameData() {
    if (!this.gameManager || !this.currentScene) return;

    // Enhanced player data
    const playerData = this.getPlayerData();
    EventBus.emit('bridge-player-data', playerData);

    // Enhanced game progress
    const gameProgress = this.getGameProgress();
    EventBus.emit('bridge-game-progress', gameProgress);
  }

  getPlayerData() {
    const data = {
      health: 100,
      maxHealth: 100,
      healthPercentage: 100,
      experience: 0,
      maxExperience: 100,
      level: 1,
      experiencePercentage: 0,
      gold: 500,
      isAlive: true,
      isInGame: false
    };

    // Priority order: Player object -> GameManager -> Scene -> defaults
    const player = this.player || this.currentScene?.player || this.currentScene?.playerPrefab;
    if (player) {
      data.health = player.health !== undefined ? player.health : data.health;
      data.maxHealth = player.maxHealth !== undefined ? player.maxHealth : data.maxHealth;
      data.isAlive = player.alive !== false && player.health > 0;
    }
    
    // Get from GameManager stats
    if (this.gameManager?.playerStats) {
      const stats = this.gameManager.playerStats;
      data.health = stats.health !== undefined ? stats.health : data.health;
      data.maxHealth = stats.maxHealth !== undefined ? stats.maxHealth : data.maxHealth;
      data.experience = stats.experience !== undefined ? stats.experience : data.experience;
      data.maxExperience = stats.nextLevelExp !== undefined ? stats.nextLevelExp : data.maxExperience;
      data.level = stats.level !== undefined ? stats.level : data.level;
    }
    
    // Get gold from GameManager
    if (this.gameManager) {
      data.gold = this.gameManager.gold !== undefined ? this.gameManager.gold : data.gold;
      data.isInGame = this.gameManager.isGameRunning || false;
    }

    // Calculate percentages safely
    data.healthPercentage = data.maxHealth > 0 ? Math.max(0, (data.health / data.maxHealth) * 100) : 0;
    data.experiencePercentage = data.maxExperience > 0 ? (data.experience / data.maxExperience) * 100 : 0;

    return data;
  }

  getGameProgress() {
    const data = {
      gameTime: 0,
      formattedTime: '00:00',
      currentWave: 1,
      survivalTime: 0,
      isGameRunning: false
    };

    // Get from GameManager
    if (this.gameManager) {
      data.survivalTime = this.gameManager.getCurrentSurvivalTime();
      data.isGameRunning = this.gameManager.isGameRunning;
    }

    // Get from UIManager timer (this fixes the timer issue)
    if (this.currentScene?.uiManager?.timer) {
      const elapsed = this.currentScene.uiManager.timer.elapsed || 0;
      data.gameTime = elapsed;
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      data.formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Get wave information
    if (this.currentScene?.uiManager?.lastWave) {
      data.currentWave = this.currentScene.uiManager.lastWave;
    } else if (this.currentScene?.currentWave) {
      data.currentWave = this.currentScene.currentWave;
    }

    return data;
  }

  setupEventEnhancement() {
    // Enhance existing health events
    EventBus.on('player-health-updated', (data) => {
      const enhancedData = {
        ...data,
        percentage: data.maxHP > 0 ? (data.currentHP / data.maxHP) * 100 : 0,
        isLowHealth: data.currentHP < (data.maxHP * 0.25),
        isCritical: data.currentHP < (data.maxHP * 0.1)
      };
      EventBus.emit('bridge-health-updated', enhancedData);
    });

    // Enhance existing gold events
    EventBus.on('player-gold-updated', (data) => {
      const enhancedData = {
        ...data,
        formatted: this.formatNumber(data.gold || 0)
      };
      EventBus.emit('bridge-gold-updated', enhancedData);
    });
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  // Methods for React components
  getGameState() {
    return {
      player: this.getPlayerData(),
      progress: this.getGameProgress(),
      connected: this.isConnected
    };
  }

  isGameReady() {
    return !!(this.gameManager && this.currentScene);
  }
}

// Singleton instance
let bridgeInstance = null;

export const getBridge = () => {
  if (!bridgeInstance) {
    bridgeInstance = new GameBridge();
  }
  return bridgeInstance;
};

export default GameBridge;