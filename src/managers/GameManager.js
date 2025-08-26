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
    survivalTime: 0, maxLevel: 1, enemiesKilled: 0, goldEarned: 0,
    experienceGained: 0, damageDealt: 0, damageTaken: 0, causeOfDeath: null
  }),

  createAllTimeStats: () => ({
    totalRuns: 0, totalGoldEarned: 0, totalEnemiesKilled: 0, totalExperienceGained: 0,
    totalDamageDealt: 0, highestLevel: 1, longestSurvivalTime: 0, averageSurvivalTime: 0
  }),

  createGameProgress: () => ({
    gameTime: 0, currentDifficulty: 1,
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

    this.gameManager.gold -= cost;
    this.gameManager.passiveUpgrades[upgradeId] = { level: newLevel, value: newValue };
    
    this.gameManager.saveGame();
    this.gameManager.emitStateUpdate();
    EventBus.emit('game-state-updated');
    return true;
  }

  canPurchase(upgradeId, cost) {
    if (this.gameManager.gold < cost) return false;
    const upgrade = GameConfig.UPGRADES[upgradeId];
    if (!upgrade) return false;
    const currentLevel = this.gameManager.passiveUpgrades[upgradeId]?.level || 0;
    return currentLevel < upgrade.maxLevel;
  }

  getUpgradeConfig(upgradeId) {
    return GameConfig.UPGRADES[upgradeId];
  }
}

class StatsTracker {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  trackRunEvent(type, value = 1) {
    if (!this.gameManager.isGameRunning) return;
    const stats = this.gameManager.currentRunStats;
    
    const eventMap = {
      enemyKill: () => stats.enemiesKilled++,
      experienceGained: () => stats.experienceGained += value,
      goldEarned: () => stats.goldEarned += value,
      damageDealt: () => stats.damageDealt += value,
      damageTaken: () => stats.damageTaken += value,
      levelReached: () => stats.maxLevel = Math.max(stats.maxLevel, value)
    };

    eventMap[type]?.();
  }

  updateAllTimeStats(runStats) {
    const stats = this.gameManager.allTimeStats;
    
    stats.totalRuns++;
    ['goldEarned', 'enemiesKilled', 'experienceGained', 'damageDealt'].forEach(stat => {
      stats[`total${stat.charAt(0).toUpperCase() + stat.slice(1)}`] += runStats[stat];
    });
    
    if (runStats.maxLevel > stats.highestLevel) stats.highestLevel = runStats.maxLevel;
    if (runStats.survivalTime > stats.longestSurvivalTime) stats.longestSurvivalTime = runStats.survivalTime;
    
    stats.averageSurvivalTime = Math.floor((stats.longestSurvivalTime + runStats.survivalTime) / stats.totalRuns);
  }
}

class PlayerStatsManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  applyAllStats(player) {
    if (!player) return;
    
    Object.assign(player, StateFactory.createPlayerStats());
    this.applyLocalUpgrades(player);
    
    const backendManager = this.gameManager.backendStatsManager;
    if (backendManager.isBackendUpgradesLoaded()) {
      backendManager.applyBackendUpgradesToPlayer(player);
    }
    
    this.syncInternalStats(player);
  }

  applyLocalUpgrades(player) {
    Object.entries(this.gameManager.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
      this.applySingleUpgrade(player, upgradeId, upgrade.value);
    });
  }

  applySingleUpgrade(player, upgradeId, value) {
    const upgradeActions = {
      maxHealth: () => { player.maxHealth = value; player.health = value; },
      baseDamage: () => player.damage = value,
      moveSpeed: () => player.moveSpeed = value,
      attackSpeed: () => player.fireRate = value,
      armor: () => player.armor = value,
      critChance: () => player.critChance = value / 100,
      critDamage: () => player.critDamage = value / 100,
      pickupRange: () => player.pickupRange = value
    };

    upgradeActions[upgradeId]?.();
  }

  syncInternalStats(player) {
    const stats = this.gameManager.playerStats;
    ['maxHealth', 'health', 'damage', 'moveSpeed', 'fireRate', 'attackRange'].forEach(stat => {
      stats[stat] = player[stat];
    });
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
    EventBus.on('upgrade-purchased', () => this.loadBackendUpgradesAsync());
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
      console.warn("Backend upgrade loading failed:", error);
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

  startNewRun() {
    this.isGameRunning = true;
    this.gameStartTime = Date.now();
    this.currentRunStats = StateFactory.createRunStats();
    this.playerStats = StateFactory.createPlayerStats();
    this.gameProgress = StateFactory.createGameProgress();
    
    this.loadBackendUpgradesAsync();
    this.applyPassiveUpgrades();
    this.emitGoldUpdate();
    this.emitKillUpdate();
  }

  handlePlayerDeath(causeOfDeath = "Unknown") {
    if (!this.isGameRunning) return;
    this.isGameRunning = false;
    const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

    this.currentRunStats.survivalTime = survivalTime;
    this.currentRunStats.causeOfDeath = causeOfDeath;
    this.lastRunStats = { ...this.currentRunStats };
    
    this.statsTracker.updateAllTimeStats(this.currentRunStats);
    this.saveGame();
    
    EventBus.emit('player-died', this.lastRunStats);
    window.dispatchEvent(new CustomEvent('playerDeath', { detail: this.lastRunStats }));
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

  addExperience(amount) {
    const multiplier = this.getMultiplier('expMultiplier');
    const actualAmount = Math.floor(amount * multiplier);
    
    this.playerStats.experience += actualAmount;
    this.statsTracker.trackRunEvent('experienceGained', actualAmount);
    
    if (this.playerStats.experience >= this.playerStats.nextLevelExp) {
      this.levelUp();
      return true;
    }
    
    this.events.emit('experienceUpdated', this.playerStats.experience, this.playerStats.nextLevelExp);
    return false;
  }

  levelUp() {
    this.playerStats.level++;
    this.statsTracker.trackRunEvent('levelReached', this.playerStats.level);
    
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
    this.statsTracker.trackRunEvent('goldEarned', actualAmount);
    this.emitGoldUpdate(actualAmount);
    this.updateUI();
  }

  addEnemyKill() { 
    this.statsTracker.trackRunEvent('enemyKill'); 
    this.emitKillUpdate();
  }
  addDamageDealt(damage) { this.statsTracker.trackRunEvent('damageDealt', damage); }
  trackEnemyKill() { 
    this.statsTracker.trackRunEvent('enemyKill');
    this.emitKillUpdate();
    console.log(`Enemy killed, total: ${this.currentRunStats.enemiesKilled}`);
  }

  emitKillUpdate() {
    const killData = {
      kills: this.currentRunStats.enemiesKilled,
      enemiesKilled: this.currentRunStats.enemiesKilled
    };
    
    EventBus.emit('player-kill-updated', killData);
    EventBus.emit('enemy-killed', killData);
  }

  applyPlayerStats(player) {
    this.playerStatsManager.applyAllStats(player);
  }

  applyPassiveUpgrades() {
    Object.entries(this.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
      this.playerStatsManager.applySingleUpgrade(this.playerStats, upgradeId, upgrade.value);
    });
  }

  updateDifficulty(deltaTime) {
    this.gameProgress.gameTime += deltaTime / 1000;
    const newDifficultyLevel = 1 + Math.floor(
      this.gameProgress.gameTime / GameConfig.BALANCE.DIFFICULTY.SCALING_INTERVAL
    );
    
    if (newDifficultyLevel !== this.gameProgress.currentDifficulty) {
      this.gameProgress.currentDifficulty = newDifficultyLevel;
      this.gameProgress.maxEnemies = GameConfig.Utils.getDifficultyMaxEnemies(newDifficultyLevel);
      this.gameProgress.enemySpawnDelay = GameConfig.Utils.getDifficultySpawnDelay(newDifficultyLevel);
      this.events.emit('difficultyUpdated', newDifficultyLevel);
    }
  }

  getMultiplier(upgradeId) {
    return this.passiveUpgrades[upgradeId] ? this.passiveUpgrades[upgradeId].value / 100 : 1;
  }

  getCurrentSurvivalTime() {
    return this.isGameRunning ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
  }

  getGold() { return this.gold; }
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

  emitGoldUpdate(earned = 0) {
    const goldData = { gold: this.gold, goldEarned: earned, totalGold: this.gold, currentGold: this.gold };
    
    EventBus.emit('player-gold-updated', goldData);
    EventBus.emit('player-stats-updated', goldData);
    window.dispatchEvent(new CustomEvent('playerGoldUpdated', { detail: goldData }));
  }

  updateUI() {
    if (this.currentScene?.uiManager) {
      this.currentScene.uiManager.updateScoreboard();
    }
  }

  emitStateUpdate() {
    const stateData = {
      gold: this.gold,
      passiveUpgrades: this.passiveUpgrades,
      allTimeStats: this.allTimeStats,
      lastRunStats: this.lastRunStats,
      currentRunStats: this.currentRunStats
    };
    
    window.dispatchEvent(new CustomEvent('gameStateUpdated', { detail: stateData }));
    EventBus.emit('game-state-updated', stateData);
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
