import { saveToLocalStorage, loadFromLocalStorage, resetProgress as resetLocalStorage } from '../GameStorage';
import { EventBus } from '../game/EventBus';
import { BackendStatsManager } from './BackendStatsManager';

// Upgrade configuration - centralized and clean
const UPGRADES = {
    maxHealth: { base: 100, perLevel: 20, baseCost: 100, multiplier: 1.5, maxLevel: 15 },
    baseDamage: { base: 10, perLevel: 2, baseCost: 150, multiplier: 1.6, maxLevel: 15 },
    moveSpeed: { base: 200, perLevel: 15, baseCost: 125, multiplier: 1.4, maxLevel: 12 },
    attackSpeed: { base: 1, perLevel: 0.1, baseCost: 175, multiplier: 1.7, maxLevel: 10 },
    critChance: { base: 5, perLevel: 2, baseCost: 200, multiplier: 1.8, maxLevel: 10 },
    critDamage: { base: 150, perLevel: 25, baseCost: 250, multiplier: 1.9, maxLevel: 8 },
    pickupRange: { base: 50, perLevel: 10, baseCost: 120, multiplier: 1.3, maxLevel: 12 },
    armor: { base: 0, perLevel: 2, baseCost: 180, multiplier: 1.6, maxLevel: 10 },
    expMultiplier: { base: 100, perLevel: 10, baseCost: 300, multiplier: 2.0, maxLevel: 8 },
    goldMultiplier: { base: 100, perLevel: 20, baseCost: 350, multiplier: 2.2, maxLevel: 8 }
};

export default class GameManager {
    static instance = null;

    constructor() {
        if (GameManager.instance) return GameManager.instance;
        GameManager.instance = this;
        
        // Core game state
        this.gold = 500;
        this.passiveUpgrades = {};
        this.isGameRunning = false;
        this.gameStartTime = 0;
        this.debugMode = false;
        
        // Player stats (reset each run)
        this.playerStats = this.getBasePlayerStats();
        
        // Run tracking
        this.currentRunStats = this.getEmptyRunStats();
        this.lastRunStats = null;
        this.allTimeStats = this.getEmptyAllTimeStats();
        
        // Game progression (reset each run)
        this.gameProgress = this.getBaseGameProgress();
        
        // Event system
        this.events = new Phaser.Events.EventEmitter();
        this.currentScene = null;
        
        // Backend stats integration
        this.backendStatsManager = BackendStatsManager.getInstance();
        this.loadingBackendUpgrades = false;
        
        // Initialize
        this.loadGame();
        this.applyPassiveUpgrades();
        
        // Load backend upgrades asynchronously on startup
        this.loadBackendUpgradesAsync();
        
        // Listen for upgrade purchases from Dashboard
        EventBus.on('upgrade-purchased', () => {
            console.log('GameManager: Upgrade purchased, refreshing backend upgrades...');
            this.loadBackendUpgradesAsync();
        });
    }
    
    static get() {
        return GameManager.instance || new GameManager();
    }
    
    // Asynchronously load backend upgrades (non-blocking)
    async loadBackendUpgradesAsync() {
        if (this.loadingBackendUpgrades) return;
        
        this.loadingBackendUpgrades = true;
        try {
            await this.backendStatsManager.loadBackendUpgrades();
            console.log("GameManager: Backend upgrades loaded in background");
            
            // If there's a current scene with a player, re-apply stats
            if (this.currentScene?.player) {
                this.applyPlayerStats(this.currentScene.player);
            }
        } catch (error) {
            console.warn("GameManager: Failed to load backend upgrades in background:", error);
        } finally {
            this.loadingBackendUpgrades = false;
        }
    }
    
    // Base state getters
    getBasePlayerStats() {
        return {
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            maxHealth: 100,
            health: 100,
            damage: 10,
            moveSpeed: 100,
            fireRate: 1,
            attackRange: 80
        };
    }
    
    getEmptyRunStats() {
        return {
            survivalTime: 0,
            maxLevel: 1,
            enemiesKilled: 0,
            goldEarned: 0,
            experienceGained: 0,
            damageDealt: 0,
            damageTaken: 0,
            causeOfDeath: null
        };
    }
    
    getEmptyAllTimeStats() {
        return {
            totalRuns: 0,
            totalGoldEarned: 0,
            totalEnemiesKilled: 0,
            totalExperienceGained: 0,
            totalDamageDealt: 0,
            highestLevel: 1,
            longestSurvivalTime: 0,
            averageSurvivalTime: 0
        };
    }
    
    getBaseGameProgress() {
        return {
            gameTime: 0,
            currentDifficulty: 1,
            maxEnemies: 30,
            enemySpawnDelay: 3000
        };
    }
    
    // Upgrade system
    purchaseUpgrade(upgradeId, cost) {
        if (this.gold < cost) return false;
        if (!UPGRADES[upgradeId]) return false;
        
        const upgrade = UPGRADES[upgradeId];
        const currentLevel = this.passiveUpgrades[upgradeId]?.level || 0;
        
        if (currentLevel >= upgrade.maxLevel) return false;
        
        // Execute purchase
        this.gold -= cost;
        const newLevel = currentLevel + 1;
        const newValue = upgrade.base + (upgrade.perLevel * newLevel);
        
        this.passiveUpgrades[upgradeId] = { level: newLevel, value: newValue };
        
        this.saveGame();
        this.emitStateUpdate();
        
        console.log(`Purchased ${upgradeId} for ${cost} gold. New level: ${newLevel}`);
        console.log(`Remaining gold: ${this.gold}`);
        
        EventBus.emit('game-state-updated');
        
        return true;
    }
    
    resetProgress() {
        this.gold = 0;
        this.passiveUpgrades = {};
        this.currentRunStats = this.getEmptyRunStats();
        this.lastRunStats = null;
        this.allTimeStats = this.getEmptyAllTimeStats();
        this.playerStats = this.getBasePlayerStats();
        
        resetLocalStorage(0);
        this.emitStateUpdate();
        
        return true;
    }
    
    // Run management
    startNewRun() {
        this.isGameRunning = true;
        this.gameStartTime = Date.now();
        this.currentRunStats = this.getEmptyRunStats();
        this.playerStats = this.getBasePlayerStats();
        this.gameProgress = this.getBaseGameProgress();
        
        // Refresh backend upgrades for new run (non-blocking)
        this.loadBackendUpgradesAsync();
        
        this.applyPassiveUpgrades();
        
        const goldData = {
            gold: this.gold,
            totalGold: this.gold,
            currentGold: this.gold
        };
        
        EventBus.emit('player-gold-updated', goldData);
        EventBus.emit('player-stats-updated', goldData);
    }
    
    handlePlayerDeath(causeOfDeath = "Unknown") {
        if (!this.isGameRunning) return;
        console.log(`GameManager: handlePlayerDeath called with cause: ${causeOfDeath}`);
        
        this.isGameRunning = false;
        const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Update run stats
        this.currentRunStats.survivalTime = survivalTime;
        this.currentRunStats.causeOfDeath = causeOfDeath;
        this.lastRunStats = { ...this.currentRunStats };
        
        // Update all-time stats
        this.updateAllTimeStats(survivalTime);
        
        this.saveGame();
        
        // Emit both EventBus and window events for compatibility
        EventBus.emit('player-died', this.lastRunStats);
        window.dispatchEvent(new CustomEvent('playerDeath', { detail: this.lastRunStats }));
    }
    
    updateAllTimeStats(survivalTime) {
        this.allTimeStats.totalRuns++;
        this.allTimeStats.totalGoldEarned += this.currentRunStats.goldEarned;
        this.allTimeStats.totalEnemiesKilled += this.currentRunStats.enemiesKilled;
        this.allTimeStats.totalExperienceGained += this.currentRunStats.experienceGained;
        this.allTimeStats.totalDamageDealt += this.currentRunStats.damageDealt;
        
        if (this.currentRunStats.maxLevel > this.allTimeStats.highestLevel) {
            this.allTimeStats.highestLevel = this.currentRunStats.maxLevel;
        }
        
        if (survivalTime > this.allTimeStats.longestSurvivalTime) {
            this.allTimeStats.longestSurvivalTime = survivalTime;
        }
        
        // Calculate average survival time
        this.allTimeStats.averageSurvivalTime = Math.floor(
            (this.allTimeStats.longestSurvivalTime + survivalTime) / this.allTimeStats.totalRuns
        );
    }
    
    // Player stats management
    applyPlayerStats(player) {
        if (!player) {
            console.warn("GameManager: No player provided to applyPlayerStats");
            return;
        }
        
        console.log("GameManager: Applying player stats...");
        
        // Start with base stats
        const baseStats = this.getBasePlayerStats();
        player.maxHealth = baseStats.maxHealth;
        player.health = baseStats.health;
        player.damage = baseStats.damage;
        player.moveSpeed = baseStats.moveSpeed;
        player.fireRate = baseStats.fireRate;
        player.attackRange = baseStats.attackRange;
        
        // Apply local passive upgrades first
        if (this.passiveUpgrades && Object.keys(this.passiveUpgrades).length > 0) {
            console.log("GameManager: Applying local upgrades...");
            Object.entries(this.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
                console.log(`GameManager: Applying ${upgradeId}:`, upgrade);
                switch (upgradeId) {
                    case 'maxHealth':
                        player.maxHealth = upgrade.value;
                        player.health = upgrade.value;
                        console.log(`GameManager: Applied maxHealth - now ${player.health}/${player.maxHealth}`);
                        break;
                    case 'baseDamage':
                        player.damage = upgrade.value;
                        console.log(`GameManager: Applied damage - now ${player.damage}`);
                        break;
                    case 'moveSpeed':
                        player.moveSpeed = upgrade.value;
                        console.log(`GameManager: Applied moveSpeed - now ${player.moveSpeed}`);
                        break;
                    case 'attackSpeed':
                        player.fireRate = upgrade.value;
                        break;
                    case 'armor':
                        player.armor = upgrade.value;
                        break;
                    case 'critChance':
                        player.critChance = upgrade.value / 100;
                        break;
                    case 'critDamage':
                        player.critDamage = upgrade.value / 100;
                        break;
                    case 'pickupRange':
                        player.pickupRange = upgrade.value;
                        break;
                }
            });
        } else {
            console.log("GameManager: No local upgrades to apply");
        }
        
        // Apply backend upgrades (purchased through Dashboard) if loaded
        if (this.backendStatsManager.isBackendUpgradesLoaded()) {
            try {
                this.backendStatsManager.applyBackendUpgradesToPlayer(player);
                console.log("GameManager: Backend upgrades applied successfully");
            } catch (error) {
                console.warn("GameManager: Failed to apply backend upgrades:", error);
            }
        } else {
            console.log("GameManager: Backend upgrades not loaded yet, will apply when ready");
        }
        
        // Update internal playerStats to reflect final values
        this.playerStats.maxHealth = player.maxHealth;
        this.playerStats.health = player.health;
        this.playerStats.damage = player.damage;
        this.playerStats.moveSpeed = player.moveSpeed;
        this.playerStats.fireRate = player.fireRate;
        this.playerStats.attackRange = player.attackRange;
        
        console.log("GameManager: Final player stats applied:", {
            maxHealth: player.maxHealth,
            damage: player.damage,
            moveSpeed: player.moveSpeed,
            fireRate: player.fireRate,
            attackRange: player.attackRange
        });
    }
    
    applyPassiveUpgrades() {
        Object.entries(this.passiveUpgrades).forEach(([upgradeId, upgrade]) => {
            switch (upgradeId) {
                case 'maxHealth':
                    this.playerStats.maxHealth = upgrade.value;
                    this.playerStats.health = upgrade.value;
                    break;
                case 'baseDamage':
                    this.playerStats.damage = upgrade.value;
                    break;
                case 'moveSpeed':
                    this.playerStats.moveSpeed = upgrade.value;
                    break;
                case 'attackSpeed':
                    this.playerStats.fireRate = upgrade.value;
                    break;
            }
        });
    }
    
    addExperience(amount) {
        const multiplier = this.getMultiplier('expMultiplier');
        const actualAmount = Math.floor(amount * multiplier);
        
        this.playerStats.experience += actualAmount;
        
        if (this.isGameRunning) {
            this.currentRunStats.experienceGained += actualAmount;
        }
        
        if (this.playerStats.experience >= this.playerStats.nextLevelExp) {
            this.levelUp();
            return true;
        }
        
        this.events.emit('experienceUpdated', this.playerStats.experience, this.playerStats.nextLevelExp);
        return false;
    }
    
    levelUp() {
        this.playerStats.level++;
        
        if (this.isGameRunning) {
            this.currentRunStats.maxLevel = Math.max(this.currentRunStats.maxLevel, this.playerStats.level);
        }
        
        const expOverflow = this.playerStats.experience - this.playerStats.nextLevelExp;
        this.playerStats.nextLevelExp = Math.floor(this.playerStats.nextLevelExp * 1.2);
        this.playerStats.experience = expOverflow;
        
        this.events.emit('levelUp', this.playerStats.level);
    }
    
    // Stat tracking
    addEnemyKill() {
        if (this.isGameRunning) {
            this.currentRunStats.enemiesKilled++;
        }
    }
    
    // FIXED: Gold system that updates immediately during gameplay
    addGold(amount) {
        const multiplier = this.getMultiplier('goldMultiplier');
        const actualAmount = Math.floor(amount * multiplier);
        
        // FIXED: Always add to main gold property immediately
        this.gold += actualAmount;
        
        if (this.isGameRunning) {
            this.currentRunStats.goldEarned += actualAmount;
        }
        
        // Emit gold update events for React components
        const goldData = {
            gold: this.gold,
            goldEarned: actualAmount,
            totalGold: this.gold
        };
        
        EventBus.emit('player-gold-updated', goldData);
        EventBus.emit('player-stats-updated', {
            gold: this.gold,
            currentGold: this.gold
        });
        
        window.dispatchEvent(new CustomEvent('playerGoldUpdated', {
            detail: goldData
        }));
        
        console.log(`Player gained ${actualAmount} gold. Total: ${this.gold}`);
        
        // Force UI update
        if (this.currentScene?.uiManager) {
            this.currentScene.uiManager.updateScoreboard();
        }
    }
    
    // ADDED: getGold method for BaseGameScene compatibility
    getGold() {
        return this.gold;
    }
    
    addDamageDealt(damage) {
        if (this.isGameRunning) {
            this.currentRunStats.damageDealt += damage;
        }
    }
    
    trackEnemyKill() {
        if (this.isGameRunning) {
            this.currentRunStats.enemiesKilled++;
            console.log(`GameManager: Enemy killed, total: ${this.currentRunStats.enemiesKilled}`);
        }
    }
    
    // Difficulty system
    updateDifficulty(deltaTime) {
        this.gameProgress.gameTime += deltaTime / 1000;
        
        const newDifficultyLevel = 1 + Math.floor(this.gameProgress.gameTime / 60);
        
        if (newDifficultyLevel !== this.gameProgress.currentDifficulty) {
            this.gameProgress.currentDifficulty = newDifficultyLevel;
            
            // Update spawn parameters
            this.gameProgress.maxEnemies = Math.min(60, 30 + (newDifficultyLevel - 1) * 3);
            this.gameProgress.enemySpawnDelay = Math.max(100, 3000 - (newDifficultyLevel - 1) * 300);
            
            this.events.emit('difficultyUpdated', newDifficultyLevel);
        }
    }
    
    // Utility methods
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
    
    // State management
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
            this.gold = savedData.gold || 500;
            this.passiveUpgrades = savedData.passiveUpgrades || {};
            this.allTimeStats = savedData.allTimeStats || this.getEmptyAllTimeStats();
            this.lastRunStats = savedData.lastRunStats || null;
        }
    }
    
    setCurrentScene(scene) {
        this.currentScene = scene;
    }
}