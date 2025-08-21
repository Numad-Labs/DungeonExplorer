import { saveToLocalStorage, loadFromLocalStorage, resetProgress as resetLocalStorage } from '../GameStorage';
import { EventBus } from '../game/EventBus';
import { BackendStatsManager } from './BackendStatsManager';
import GameConfig from '../config/GameConfig.js';

const StateFactory = {
  createPlayerStats: () => ({
    level: GameConfig.PLAYER.DEFAULTS.level,
    experience: GameConfig.PLAYER.DEFAULTS.experience,
    nextLevelExp: GameConfig.PLAYER.DEFAULTS.nextLevelExp,
    maxHealth: GameConfig.PLAYER.DEFAULTS.maxHealth,
    health: GameConfig.PLAYER.DEFAULTS.health,
    damage: GameConfig.PLAYER.DEFAULTS.damage,
    moveSpeed: GameConfig.PLAYER.DEFAULTS.moveSpeed,
    fireRate: GameConfig.PLAYER.DEFAULTS.fireRate,
    attackRange: GameConfig.PLAYER.DEFAULTS.attackRange
  }),

  createRunStats: () => ({
    survivalTime: 0,
    maxLevel: 1,
    enemiesKilled: 0,
    goldEarned: 0,
    experienceGained: 0,
    damageDealt: 0,
    damageTaken: 0,
    causeOfDeath: null
  }),

  createAllTimeStats: () => ({
    totalRuns: 0,
    totalGoldEarned: 0,
    totalEnemiesKilled: 0,
    totalExperienceGained: 0,
    totalDamageDealt: 0,
    highestLevel: 1,
    longestSurvivalTime: 0,
    averageSurvivalTime: 0
  }),

  createGameProgress: () => ({
    gameTime: 0,
    currentDifficulty: 1,
    maxEnemies: GameConfig.BALANCE.DIFFICULTY.MAX_ENEMIES_BASE,
    enemySpawnDelay: GameConfig.BALANCE.DIFFICULTY.SPAWN_DELAY_BASE
  })
};

class UpgradeSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  purchaseUpgrade(upgradeId, cost) {
    if (!this.canPurchase(upgradeId, cost)) return false;

    const upgrade = GameConfig.UPGRADES[upgradeId];
    const currentLevel = this.gameManager.passiveUpgrades[upgradeId]?.level || 0;
    const newLevel = currentLevel + 1;
    const newValue = upgrade.base + (upgrade.perLevel * newLevel);

    this.executeUpgrade(upgradeId, cost, newLevel, newValue);
    return true;
  }

  canPurchase(upgradeId, cost) {
    if (this.gameManager.gold < cost) return false;
    if (!GameConfig.UPGRADES[upgradeId]) return false;

    const upgrade = GameConfig.UPGRADES[upgradeId];
    const currentLevel = this.gameManager.passiveUpgrades[upgradeId]?.level || 0;
    
    return currentLevel < upgrade.maxLevel;
  }

  executeUpgrade(upgradeId, cost, newLevel, newValue) {
    this.gameManager.gold -= cost;
    this.gameManager.passiveUpgrades[upgradeId] = { level: newLevel, value: newValue };
    
    this.gameManager.saveGame();
    this.gameManager.emitStateUpdate();
    EventBus.emit('game-state-updated');
  }

  getUpgradeConfig(upgradeId) {
    return GameConfig.UPGRADES[upgradeId];
  }
}

class StatsTracker {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  updateRunStats(type, value) {
    if (!this.gameManager.isGameRunning) return;

    switch (type) {
      case 'enemyKill':
        this.gameManager.currentRunStats.enemiesKilled++;
        break;
      case 'experienceGained':
        this.gameManager.currentRunStats.experienceGained += value;
        break;
      case 'goldEarned':
        this.gameManager.currentRunStats.goldEarned += value;
        break;
      case 'damageDealt':
        this.gameManager.currentRunStats.damageDealt += value;
        break;
      case 'damageTaken':
        this.gameManager.currentRunStats.damageTaken += value;
        break;
      case 'levelReached':
        this.gameManager.currentRunStats.maxLevel = Math.max(
          this.gameManager.currentRunStats.maxLevel, 
          value
        );
        break;
    }
  }

  updateAllTimeStats(runStats) {
    const stats = this.gameManager.allTimeStats;
    
    stats.totalRuns++;
    stats.totalGoldEarned += runStats.goldEarned;
    stats.totalEnemiesKilled += runStats.enemiesKilled;
    stats.totalExperienceGained += runStats.experienceGained;
    stats.totalDamageDealt += runStats.damageDealt;
    
    if (runStats.maxLevel > stats.highestLevel) {
      stats.highestLevel = runStats.maxLevel;
    }
    
    if (runStats.survivalTime > stats.longestSurvivalTime) {
      stats.longestSurvivalTime = runStats.survivalTime;
    }
    
    stats.averageSurvivalTime = Math.floor(
      (stats.longestSurvivalTime + runStats.survivalTime) / stats.totalRuns
    );
  }
}

class PlayerStatsManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  applyStatsToPlayer(player) {
    if (!player) {
      console.warn("PlayerStatsManager: No player provided");
      return;
    }

    this.applyBaseStats(player);
    this.applyLocalUpgrades(player);
    this.applyBackendUpgrades(player);
    this.updateInternalStats(player);
  }

  applyBaseStats(player) {
    const baseStats = StateFactory.createPlayerStats();
    Object.assign(player, baseStats);
  }

  applyLocalUpgrades(player) {
    const upgrades = this.gameManager.passiveUpgrades;
    
    if (!upgrades || Object.keys(upgrades).length === 0) {
      return;
    }

    Object.entries(upgrades).forEach(([upgradeId, upgrade]) => {
      this.applySingleUpgrade(player, upgradeId, upgrade.value);
    });
  }

  applySingleUpgrade(player, upgradeId, value) {
    const upgradeMap = {
      maxHealth: () => {
        player.maxHealth = value;
        player.health = value;
      },
      baseDamage: () => player.damage = value,
      moveSpeed: () => player.moveSpeed = value,
      attackSpeed: () => player.fireRate = value,
      armor: () => player.armor = value,
      critChance: () => player.critChance = value / 100,
      critDamage: () => player.critDamage = value / 100,
      pickupRange: () => player.pickupRange = value
    };

    const applyFunction = upgradeMap[upgradeId];
    if (applyFunction) {
      applyFunction();
    }
  }

  applyBackendUpgrades(player) {
    const backendManager = this.gameManager.backendStatsManager;
    
    if (backendManager.isBackendUpgradesLoaded()) {
      try {
        backendManager.applyBackendUpgradesToPlayer(player);
      } catch (error) {
        console.warn("PlayerStatsManager: Backend upgrade application failed:", error);
      }
    } else {
      console.log("PlayerStatsManager: Backend upgrades not loaded yet");
    }
  }

  updateInternalStats(player) {
    const stats = this.gameManager.playerStats;
    stats.maxHealth = player.maxHealth;
    stats.health = player.health;
    stats.damage = player.damage;
    stats.moveSpeed = player.moveSpeed;
    stats.fireRate = player.fireRate;
    stats.attackRange = player.attackRange;
  }

  getPlayerStatsSummary(player) {
    return {
      maxHealth: player.maxHealth,
      damage: player.damage,
      moveSpeed: player.moveSpeed,
      fireRate: player.fireRate,
      attackRange: player.attackRange
    };
  }
}

export default class GameManager {
  static instance = null;

  constructor() {
    if (GameManager.instance) return GameManager.instance;
    GameManager.instance = this;
    
    this.initializeCore();
    this.initializeModules();
    this.initializeState();
    this.setupEventListeners();
    this.loadBackendUpgradesAsync();
  }

  static get() {
    return GameManager.instance || new GameManager();
  }

  initializeCore() {
    this.gold = GameConfig.BALANCE.GOLD.STARTING_AMOUNT;
    this.passiveUpgrades = {};
    this.isGameRunning = false;
    this.gameStartTime = 0;
    this.debugMode = GameConfig.DEBUG.ENABLED;
    this.currentScene = null;
    this.loadingBackendUpgrades = false;
    this.events = new Phaser.Events.EventEmitter();
    this.backendStatsManager = BackendStatsManager.getInstance();
  }

  initializeModules() {
    this.upgradeSystem = new UpgradeSystem(this);
    this.statsTracker = new StatsTracker(this);
    this.playerStatsManager = new PlayerStatsManager(this);
  }

  initializeState() {
    this.playerStats = StateFactory.createPlayerStats();
    this.currentRunStats = StateFactory.createRunStats();
    this.lastRunStats = null;
    this.allTimeStats = StateFactory.createAllTimeStats();
    this.gameProgress = StateFactory.createGameProgress();
    
    this.loadGame();
    this.applyPassiveUpgrades();
  }

  setupEventListeners() {
    EventBus.on('upgrade-purchased', () => {
      this.loadBackendUpgradesAsync();
    });
  }

  async loadBackendUpgradesAsync() {
    if (this.loadingBackendUpgrades) return;
    
    this.loadingBackendUpgrades = true;
    try {
      await this.backendStatsManager.loadBackendUpgrades();
      if (this.currentScene?.player) {
        this.applyPlayerStats(this.currentScene.player);
      }
    } catch (error) {
      console.warn("GameManager: Backend upgrade loading failed:", error);
    } finally {
      this.loadingBackendUpgrades = false;
    }
  }

  purchaseUpgrade(upgradeId, cost) {
    return this.upgradeSystem.purchaseUpgrade(upgradeId, cost);
  }

  getUpgradeConfig(upgradeId) {
    return this.upgradeSystem.getUpgradeConfig(upgradeId);
  }

  resetProgress() {
    this.gold = 0;
    this.passiveUpgrades = {};
    this.currentRunStats = StateFactory.createRunStats();
    this.lastRunStats = null;
    this.allTimeStats = StateFactory.createAllTimeStats();
    this.playerStats = StateFactory.createPlayerStats();
    
    resetLocalStorage(0);
    this.emitStateUpdate();
    
    return true;
  }

  startNewRun() {
    this.isGameRunning = true;
    this.gameStartTime = Date.now();
    this.currentRunStats = StateFactory.createRunStats();
    this.playerStats = StateFactory.createPlayerStats();
    this.gameProgress = StateFactory.createGameProgress();
    
    this.loadBackendUpgradesAsync();
    this.applyPassiveUpgrades();
    this.emitGoldUpdate();
  }

  handlePlayerDeath(causeOfDeath = "Unknown") {
    if (!this.isGameRunning) return;
    this.isGameRunning = false;
    const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    this.finalizeRun(survivalTime, causeOfDeath);
    this.saveGame();
    this.emitDeathEvents();
  }

  finalizeRun(survivalTime, causeOfDeath) {
    this.currentRunStats.survivalTime = survivalTime;
    this.currentRunStats.causeOfDeath = causeOfDeath;
    this.lastRunStats = { ...this.currentRunStats };
    
    this.statsTracker.updateAllTimeStats(this.currentRunStats);
  }

  emitDeathEvents() {
    EventBus.emit('player-died', this.lastRunStats);
    window.dispatchEvent(new CustomEvent('playerDeath', { detail: this.lastRunStats }));
  }

  applyPlayerStats(player) {
    this.playerStatsManager.applyStatsToPlayer(player);
  }

  applyPassiveUpgrades() {
    Object.entries(this.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
      this.playerStatsManager.applySingleUpgrade(this.playerStats, upgradeId, upgrade.value);
    });
  }

  addExperience(amount) {
    const multiplier = this.getMultiplier('expMultiplier');
    const actualAmount = Math.floor(amount * multiplier);
    
    this.playerStats.experience += actualAmount;
    this.statsTracker.updateRunStats('experienceGained', actualAmount);
    
    if (this.playerStats.experience >= this.playerStats.nextLevelExp) {
      this.levelUp();
      return true;
    }
    
    this.events.emit('experienceUpdated', this.playerStats.experience, this.playerStats.nextLevelExp);
    return false;
  }

  levelUp() {
    this.playerStats.level++;
    this.statsTracker.updateRunStats('levelReached', this.playerStats.level);
    
    const expOverflow = this.playerStats.experience - this.playerStats.nextLevelExp;
    this.playerStats.nextLevelExp = Math.floor(
      this.playerStats.nextLevelExp * GameConfig.PLAYER.LEVEL_UP.EXP_MULTIPLIER
    );
    this.playerStats.experience = expOverflow;
    
    this.events.emit('levelUp', this.playerStats.level);
  }

  addGold(amount) {
    const multiplier = this.getMultiplier('goldMultiplier');
    const actualAmount = Math.floor(amount * multiplier);
    
    this.gold += actualAmount;
    this.statsTracker.updateRunStats('goldEarned', actualAmount);
    
    this.emitGoldUpdate(actualAmount);
    this.updateUI();
  }

  emitGoldUpdate(earned = 0) {
    const goldData = {
      gold: this.gold,
      goldEarned: earned,
      totalGold: this.gold,
      currentGold: this.gold
    };
    
    EventBus.emit('player-gold-updated', goldData);
    EventBus.emit('player-stats-updated', goldData);
    
    window.dispatchEvent(new CustomEvent('playerGoldUpdated', { detail: goldData }));
  }

  updateUI() {
    if (this.currentScene?.uiManager) {
      this.currentScene.uiManager.updateScoreboard();
    }
  }

  getGold() {
    return this.gold;
  }

  addEnemyKill() {
    this.statsTracker.updateRunStats('enemyKill');
  }

  addDamageDealt(damage) {
    this.statsTracker.updateRunStats('damageDealt', damage);
  }

  trackEnemyKill() {
    this.statsTracker.updateRunStats('enemyKill');
    console.log(`Enemy killed, total: ${this.currentRunStats.enemiesKilled}`);
  }

  updateDifficulty(deltaTime) {
    this.gameProgress.gameTime += deltaTime / 1000;
    
    const newDifficultyLevel = 1 + Math.floor(
      this.gameProgress.gameTime / GameConfig.BALANCE.DIFFICULTY.SCALING_INTERVAL
    );
    
    if (newDifficultyLevel !== this.gameProgress.currentDifficulty) {
      this.gameProgress.currentDifficulty = newDifficultyLevel;
      this.updateDifficultyParameters(newDifficultyLevel);
      this.events.emit('difficultyUpdated', newDifficultyLevel);
    }
  }

  updateDifficultyParameters(level) {
    this.gameProgress.maxEnemies = GameConfig.Utils.getDifficultyMaxEnemies(level);
    this.gameProgress.enemySpawnDelay = GameConfig.Utils.getDifficultySpawnDelay(level);
  }

  getMultiplier(upgradeId) {
    return this.passiveUpgrades[upgradeId] ? this.passiveUpgrades[upgradeId].value / 100 : 1;
  }

  getCurrentSurvivalTime() {
    return this.isGameRunning ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    return this.debugMode;
  }

  emitStateUpdate() {
    window.dispatchEvent(new CustomEvent('gameStateUpdated', {
      detail: {
        gold: this.gold,
        passiveUpgrades: this.passiveUpgrades,
        allTimeStats: this.allTimeStats,
        lastRunStats: this.lastRunStats,
        currentRunStats: this.currentRunStats
      }
    }));
  }

  saveGame() {
    const gameData = {
      gold: this.gold,
      passiveUpgrades: this.passiveUpgrades,
      allTimeStats: this.allTimeStats,
      lastRunStats: this.lastRunStats
    };
    
    saveToLocalStorage(gameData);
  }

  loadGame() {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      this.gold = savedData.gold || GameConfig.BALANCE.GOLD.STARTING_AMOUNT;
      this.passiveUpgrades = savedData.passiveUpgrades || {};
      this.allTimeStats = savedData.allTimeStats || StateFactory.createAllTimeStats();
      this.lastRunStats = savedData.lastRunStats || null;
    }
  }

  setCurrentScene(scene) {
    this.currentScene = scene;
  }
}