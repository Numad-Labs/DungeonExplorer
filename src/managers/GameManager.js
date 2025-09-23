import { saveToLocalStorage, loadFromLocalStorage, resetProgress as resetLocalStorage } from '../GameStorage';
import { EventBus } from '../game/EventBus';
import { BackendStatsManager } from './BackendStatsManager';
import GameConfig from '../config/GameConfig.js';

const StateFactory = {
  createPlayerStats: () => Object.assign({}, GameConfig.PLAYER.DEFAULTS),
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
    
    this.gameManager.updateUserDataGold();
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
    this.eventHandlers = {
      enemyKill: (stats) => stats.enemiesKilled++,
      experienceGained: (stats, value) => stats.experienceGained += value,
      goldEarned: (stats, value) => stats.goldEarned += value,
      damageDealt: (stats, value) => stats.damageDealt += value,
      damageTaken: (stats, value) => stats.damageTaken += value,
      levelReached: (stats, value) => stats.maxLevel = Math.max(stats.maxLevel, value)
    };
  }

  trackRunEvent(type, value = 1) {
    if (!this.gameManager.isGameRunning) return;
    this.eventHandlers[type]?.(this.gameManager.currentRunStats, value);
  }

  updateAllTimeStats(runStats) {
    const allTime = this.gameManager.allTimeStats;
    
    allTime.totalRuns++;
    
    // Update cumulative stats
    const statMappings = {
      goldEarned: 'totalGoldEarned',
      enemiesKilled: 'totalEnemiesKilled',
      experienceGained: 'totalExperienceGained',
      damageDealt: 'totalDamageDealt'
    };
    
    Object.entries(statMappings).forEach(([runStat, totalStat]) => {
      allTime[totalStat] += runStats[runStat] || 0;
    });
    
    // Update records
    if (runStats.maxLevel > allTime.highestLevel) allTime.highestLevel = runStats.maxLevel;
    if (runStats.survivalTime > allTime.longestSurvivalTime) allTime.longestSurvivalTime = runStats.survivalTime;
    
    // Update average
    allTime.averageSurvivalTime = Math.floor(
      (allTime.longestSurvivalTime + runStats.survivalTime) / allTime.totalRuns
    );
  }
}

class PlayerStatsManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.upgradeActions = {
      maxHealth: (player, value) => { player.maxHealth = value; player.health = value; },
      baseDamage: (player, value) => player.damage = value,
      moveSpeed: (player, value) => player.moveSpeed = value,
      attackSpeed: (player, value) => player.fireRate = value,
      armor: (player, value) => player.armor = value,
      critChance: (player, value) => player.critChance = value / 100,
      critDamage: (player, value) => player.critDamage = value / 100,
      pickupRange: (player, value) => player.pickupRange = value
    };
  }

  applyAllStats(player) {
    if (!player) return;
    
    Object.assign(player, StateFactory.createPlayerStats());
    Object.entries(this.gameManager.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
      this.applySingleUpgrade(player, upgradeId, upgrade.value);
    });
    const backendManager = this.gameManager.backendStatsManager;
    if (backendManager.isBackendUpgradesLoaded()) {
      backendManager.applyBackendUpgradesToPlayer(player);
    }
    
    const syncStats = ['maxHealth', 'health', 'damage', 'moveSpeed', 'fireRate', 'attackRange'];
    syncStats.forEach(stat => {
      this.gameManager.playerStats[stat] = player[stat];
    });
  }

  applySingleUpgrade(player, upgradeId, value) {
    this.upgradeActions[upgradeId]?.(player, value);
  }
}

export default class GameManager {
  static instance = null;

  constructor() {
    if (GameManager.instance) return GameManager.instance;
    GameManager.instance = this;
    
    this.initializeCore();
    this.initializeState();
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
    this._isPausedByPauseManager = false;
    this.events = new Phaser.Events.EventEmitter();
    this.backendStatsManager = BackendStatsManager.getInstance();
    this.upgradeSystem = new UpgradeSystem(this);
    this.statsTracker = new StatsTracker(this);
    this.playerStatsManager = new PlayerStatsManager(this);
    this.loadActualPlayerGold();
    
    EventBus.on('upgrade-purchased', () => this.loadBackendUpgradesAsync());
  }

  loadActualPlayerGold() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        this.gold = user?.data?.gold || this.gold;
      }
    } catch (error) {
      console.warn('GameManager: Error loading actual gold:', error);
    }
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

  applyPlayerStats(player) {
    this.playerStatsManager.applyAllStats(player);
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
    this.playerStats.nextLevelExp = 30 * this.playerStats.level;
    this.playerStats.experience = expOverflow;
    
    this.events.emit('levelUp', this.playerStats.level);
  }

  addGold(amount) {
    const multiplier = this.getMultiplier('goldMultiplier');
    const actualAmount = Math.floor(amount * multiplier);
    
    this.gold += actualAmount;
    this.statsTracker.trackRunEvent('goldEarned', actualAmount);
    this.updateUserDataGold();
    this.emitGoldUpdate(actualAmount);
    this.updateUI();
  }

  updateUserDataGold() {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.data) {
          user.data.gold = this.gold;
          localStorage.setItem('userData', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.warn('GameManager: Error updating userData gold:', error);
    }
  }

  addEnemyKill() { 
    this.trackEnemyKill();
  }
  
  addDamageDealt(damage) { 
    this.statsTracker.trackRunEvent('damageDealt', damage); 
  }
  
  trackEnemyKill() { 
    this.statsTracker.trackRunEvent('enemyKill');
    this.emitKillUpdate();
  }

  emitKillUpdate() {
    const killData = {
      kills: this.currentRunStats.enemiesKilled,
      enemiesKilled: this.currentRunStats.enemiesKilled
    };
    
    EventBus.emit('player-kill-updated', killData);
    EventBus.emit('enemy-killed', killData);
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

  applyPassiveUpgrades() {
    Object.entries(this.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
      this.playerStatsManager.applySingleUpgrade(this.playerStats, upgradeId, upgrade.value);
    });
  }

  updateDifficulty(deltaTime) {
    if (this._isPausedByPauseManager) return;
    
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

  getGold() { 
    return this.gold; 
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

  updateUI() {
    this.currentScene?.uiManager?.updateScoreboard();
  }

  setCurrentScene(scene) {
    this.currentScene = scene;
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
}
