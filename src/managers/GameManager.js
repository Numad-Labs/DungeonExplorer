import { saveToLocalStorage, loadFromLocalStorage, resetProgress as resetLocalStorage } from '../GameStorage';

export default class GameManager {
    static instance = null;

    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        
        GameManager.instance = this;
        
        this.playerStats = {
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            maxHealth: 100,
            health: 100,
            damage: 10,
            moveSpeed: 200,
            fireRate: 1,
            attackRange: 100
        };
        
        this.powerUps = {
            speed: 0,
            damage: 0,
            health: 0,
            fireRate: 0,
            range: 0,
            magnet: 0
        };
        
        this.gameProgress = {
            gameTime: 0,
            currentDifficulty: 1,
            maxEnemies: 1000,
            enemySpawnDelay: 100,
            orbMagnetRange: 50
        };

        this.gold = 500;
        this.passiveUpgrades = {};
        this.currentRunStats = {
            survivalTime: 0,
            maxLevel: 1,
            enemiesKilled: 0,
            goldEarned: 0,
            experienceGained: 0,
            damageDealt: 0,
            damageTaken: 0,
            causeOfDeath: null
        };
        this.lastRunStats = null;
        this.allTimeStats = {
            totalRuns: 0,
            totalGoldEarned: 0,
            totalEnemiesKilled: 0,
            totalExperienceGained: 0,
            totalDamageDealt: 0,
            highestLevel: 1,
            longestSurvivalTime: 0,
            averageSurvivalTime: 0
        };
        
        this.isGameRunning = false;
        this.gameStartTime = 0;
        this.currentScene = null;
        
        this.debugMode = false;

        this.events = new Phaser.Events.EventEmitter();
        
        this.loadGame();
        this.directlyApplyMenuUpgrades();
        
        console.log("GameManager initialized");
    }
    
    static get() {
        if (!GameManager.instance) {
            new GameManager();
        }
        return GameManager.instance;
    }

    purchaseUpgrade(upgradeId, cost) {
        try {
            console.log(`Attempting to purchase upgrade: ${upgradeId} for ${cost} gold`);
            
            if (this.gold < cost) {
                console.log("Not enough gold for purchase");
                return false;
            }
            
            const passiveUpgrades = [
                {
                    id: 'maxHealth',
                    name: 'Max Health',
                    baseValue: 100,
                    valuePerLevel: 20,
                    baseCost: 100,
                    costMultiplier: 1.5,
                    maxLevel: 15
                },
                {
                    id: 'baseDamage',
                    name: 'Base Damage',
                    baseValue: 10,
                    valuePerLevel: 2,
                    baseCost: 150,
                    costMultiplier: 1.6,
                    maxLevel: 15
                },
                {
                    id: 'moveSpeed',
                    name: 'Move Speed',
                    baseValue: 200,
                    valuePerLevel: 15,
                    baseCost: 125,
                    costMultiplier: 1.4,
                    maxLevel: 12
                },
                {
                    id: 'attackSpeed',
                    name: 'Attack Speed',
                    baseValue: 1,
                    valuePerLevel: 0.1,
                    baseCost: 175,
                    costMultiplier: 1.7,
                    maxLevel: 10
                },
                {
                    id: 'critChance',
                    name: 'Critical Chance',
                    baseValue: 5,
                    valuePerLevel: 2,
                    baseCost: 200,
                    costMultiplier: 1.8,
                    maxLevel: 10
                },
                {
                    id: 'critDamage',
                    name: 'Critical Damage',
                    baseValue: 150,
                    valuePerLevel: 25,
                    baseCost: 250,
                    costMultiplier: 1.9,
                    maxLevel: 8
                },
                {
                    id: 'pickupRange',
                    name: 'Pickup Range',
                    baseValue: 50,
                    valuePerLevel: 10,
                    baseCost: 120,
                    costMultiplier: 1.3,
                    maxLevel: 12
                },
                {
                    id: 'armor',
                    name: 'Armor',
                    baseValue: 0,
                    valuePerLevel: 2,
                    baseCost: 180,
                    costMultiplier: 1.6,
                    maxLevel: 10
                },
                {
                    id: 'expMultiplier',
                    name: 'EXP Gain',
                    baseValue: 100,
                    valuePerLevel: 10,
                    baseCost: 300,
                    costMultiplier: 2.0,
                    maxLevel: 8
                },
                {
                    id: 'goldMultiplier',
                    name: 'Gold Gain',
                    baseValue: 100,
                    valuePerLevel: 20,
                    baseCost: 350,
                    costMultiplier: 2.2,
                    maxLevel: 8
                }
            ];
            
            const upgrade = passiveUpgrades.find(u => u.id === upgradeId);
            if (!upgrade) {
                console.error(`Upgrade ${upgradeId} not found`);
                return false;
            }
            
            const currentLevel = this.passiveUpgrades[upgradeId]?.level || 0;
            
            if (currentLevel >= upgrade.maxLevel) {
                console.log(`Upgrade ${upgradeId} already at max level`);
                return false;
            }
            
            this.gold -= cost;
            
            const newLevel = currentLevel + 1;
            const newValue = upgrade.baseValue + (upgrade.valuePerLevel * newLevel);
            
            this.passiveUpgrades[upgradeId] = {
                level: newLevel,
                value: newValue
            };
            
            console.log(`Purchase successful: ${upgradeId} level ${newLevel}, value ${newValue}`);
            
            this.saveGame();
            
            window.dispatchEvent(new CustomEvent('gameStateUpdated', {
                detail: {
                    gold: this.gold,
                    passiveUpgrades: this.passiveUpgrades,
                    allTimeStats: this.allTimeStats,
                    lastRunStats: this.lastRunStats,
                    currentRunStats: this.currentRunStats
                }
            }));
            
            return true;
        } catch (error) {
            console.error("Error purchasing upgrade:", error);
            return false;
        }
    }

    // Reset progress method
    resetProgress() {
        try {
            console.log("Resetting all progress...");
            
            this.gold = 25000;
            this.passiveUpgrades = {};
            this.currentRunStats = {
                survivalTime: 0,
                maxLevel: 1,
                enemiesKilled: 0,
                goldEarned: 0,
                experienceGained: 0,
                damageDealt: 0,
                damageTaken: 0,
                causeOfDeath: null
            };
            this.lastRunStats = null;
            this.allTimeStats = {
                totalRuns: 0,
                totalGoldEarned: 0,
                totalEnemiesKilled: 0,
                totalExperienceGained: 0,
                totalDamageDealt: 0,
                highestLevel: 1,
                longestSurvivalTime: 0,
                averageSurvivalTime: 0
            };
            
            this.playerStats = {
                level: 1,
                experience: 0,
                nextLevelExp: 100,
                maxHealth: 100,
                health: 100,
                damage: 10,
                moveSpeed: 200,
                fireRate: 1,
                attackRange: 100
            };
            
            resetLocalStorage(25000);
            
            window.dispatchEvent(new CustomEvent('gameStateUpdated', {
                detail: {
                    gold: this.gold,
                    passiveUpgrades: this.passiveUpgrades,
                    allTimeStats: this.allTimeStats,
                    lastRunStats: this.lastRunStats,
                    currentRunStats: this.currentRunStats
                }
            }));
            
            console.log("Progress reset complete");
            return true;
        } catch (error) {
            console.error("Error resetting progress:", error);
            return false;
        }
    }

    startNewRun() {
        console.log("Starting completely new run...");
        
        this.isGameRunning = true;
        this.gameStartTime = Date.now();
        
        this.currentRunStats = {
            survivalTime: 0,
            maxLevel: 1,
            enemiesKilled: 0,
            goldEarned: 0,
            experienceGained: 0,
            damageDealt: 0,
            damageTaken: 0,
            causeOfDeath: null
        };
        
        this.resetPlayerStatsToBase();
        this.applyPassiveUpgradesToPlayerStats();
        this.resetGameProgression();
    }

    resetGameProgression() {
        this.gameProgress = {
            gameTime: 0,
            currentDifficulty: 1,
            maxEnemies: 1000,
            enemySpawnDelay: 100,
            orbMagnetRange: 50
        };
        
        this.powerUps = {
            speed: 0,
            damage: 0,
            health: 0,
            fireRate: 0,
            range: 0,
            magnet: 0
        };
        
        console.log("Game progression reset to starting difficulty");
    }

    handlePlayerDeath(causeOfDeath = "Unknown") {
        console.log("Player died:", causeOfDeath);
        
        if (!this.isGameRunning) return;
        
        this.isGameRunning = false;
        
        const currentTime = Date.now();
        const survivalTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        
        this.currentRunStats.survivalTime = survivalTime;
        this.currentRunStats.causeOfDeath = causeOfDeath;
        
        this.lastRunStats = { ...this.currentRunStats };
        
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
        
        if (this.allTimeStats.totalRuns > 0) {
            this.allTimeStats.averageSurvivalTime = Math.floor(
                (this.allTimeStats.longestSurvivalTime + survivalTime) / this.allTimeStats.totalRuns
            );
        }
        
        this.gold += this.currentRunStats.goldEarned;
        this.saveGame();
        
        window.dispatchEvent(new CustomEvent('playerDeath', {
            detail: this.lastRunStats
        }));
    }
    
    applyPlayerStats(playerPrefab) {
        if (!playerPrefab) return;
        
        playerPrefab.moveSpeed = this.playerStats.moveSpeed;
        playerPrefab.maxHealth = this.playerStats.maxHealth;
        playerPrefab.health = this.playerStats.health;
        playerPrefab.damage = this.playerStats.damage;
        playerPrefab.fireRate = this.playerStats.fireRate;
        playerPrefab.attackRange = this.playerStats.attackRange;
        
        Object.keys(this.passiveUpgrades).forEach(upgradeId => {
            const upgrade = this.passiveUpgrades[upgradeId];
            
            switch (upgradeId) {
                case 'maxHealth':
                    playerPrefab.maxHealth = upgrade.value;
                    playerPrefab.health = upgrade.value;
                    break;
                case 'baseDamage':
                    playerPrefab.damage = upgrade.value;
                    break;
                case 'moveSpeed':
                    playerPrefab.moveSpeed = upgrade.value;
                    break;
                case 'attackSpeed':
                    playerPrefab.fireRate = upgrade.value;
                    break;
                case 'armor':
                    playerPrefab.armor = upgrade.value;
                    break;
                case 'critChance':
                    playerPrefab.critChance = upgrade.value / 100;
                    break;
                case 'critDamage':
                    playerPrefab.critDamage = upgrade.value / 100;
                    break;
                case 'pickupRange':
                    playerPrefab.pickupRange = upgrade.value;
                    break;
            }
        });
        
        console.log("Applied player stats to prefab:", {
            maxHealth: playerPrefab.maxHealth,
            damage: playerPrefab.damage,
            moveSpeed: playerPrefab.moveSpeed,
            armor: playerPrefab.armor
        });
        
        return playerPrefab;
    }

    applyPassiveUpgradesToPlayerStats() {
        Object.keys(this.passiveUpgrades).forEach(upgradeId => {
            const upgrade = this.passiveUpgrades[upgradeId];
            
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

    resetPlayerStatsToBase() {
        this.playerStats = {
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            maxHealth: 100,
            health: 100,
            damage: 10,
            moveSpeed: 200,
            fireRate: 1,
            attackRange: 100
        };
        
        console.log("Player stats reset to base values for new run");
    }
    
    savePlayerStats(playerPrefab) {
        if (!playerPrefab) return;
        
        this.playerStats.health = playerPrefab.health;
        this.playerStats.maxHealth = playerPrefab.maxHealth;
        this.playerStats.damage = playerPrefab.damage; 
        this.playerStats.moveSpeed = playerPrefab.moveSpeed;
        this.playerStats.fireRate = playerPrefab.fireRate;
        this.playerStats.attackRange = playerPrefab.attackRange;
        
        console.log("Saved player stats from prefab:", this.playerStats);
    }
    
    addExperience(amount) {
        const multiplier = this.passiveUpgrades.expMultiplier ? this.passiveUpgrades.expMultiplier.value / 100 : 1;
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
        
        console.log(`Player reached level ${this.playerStats.level}!`);
        console.log(`Next level at ${this.playerStats.nextLevelExp} exp`);
    }
    
    applyPowerUp(type, level) {
        if (!this.powerUps.hasOwnProperty(type)) {
            console.error(`Power-up type '${type}' not recognized`);
            return;
        }
        
        this.powerUps[type] = level;
        
        switch (type) {
            case 'speed':
                this.playerStats.moveSpeed = 200 * (1 + level * 0.1);
                break;
                
            case 'damage':
                this.playerStats.damage = 10 * (1 + level * 0.2);
                break;
                
            case 'health':
                const prevMaxHealth = this.playerStats.maxHealth;
                this.playerStats.maxHealth = 100 * (1 + level * 0.15);
                this.playerStats.health += (this.playerStats.maxHealth - prevMaxHealth);
                break;
                
            case 'fireRate':
                this.playerStats.fireRate = 1 * (1 + level * 0.15);
                break;
                
            case 'range':
                this.playerStats.attackRange = 100 * (1 + level * 0.2);
                break;
                
            case 'magnet':
                this.gameProgress.orbMagnetRange = 50 * (1 + level * 0.3);
                break;
        }
        
        this.events.emit('powerUpApplied', type, level);
        
        console.log(`Applied power-up: ${type} level ${level}`);
    }
    
    updateDifficulty(deltaTime) {
        this.gameProgress.gameTime += deltaTime / 1000;
        
        const initialDifficultyDuration = 60;
        const newDifficultyLevel = 1 + Math.floor(this.gameProgress.gameTime / initialDifficultyDuration);
        
        if (newDifficultyLevel !== this.gameProgress.currentDifficulty) {
            this.gameProgress.currentDifficulty = newDifficultyLevel;
            
            const baseMaxEnemies = 30;
            const enemiesPerLevel = 3;
            const maxEnemyCap = 60;
            
            this.gameProgress.maxEnemies = Math.min(
                maxEnemyCap,
                baseMaxEnemies + (this.gameProgress.currentDifficulty - 1) * enemiesPerLevel
            );
            
            const minSpawnDelay = 100;
            this.gameProgress.enemySpawnDelay = Math.max(
                minSpawnDelay,
                3000 - (this.gameProgress.currentDifficulty - 1) * 300
            );
            
            this.events.emit('difficultyUpdated', this.gameProgress.currentDifficulty);
        }
    }
    
    handleSceneTransition(fromScene, toScene) {
        if (fromScene.player) {
            this.savePlayerStats(fromScene.player);
        }
        
        this.events.emit('sceneTransition', fromScene.scene.key, toScene);
        
        console.log(`Transitioning from ${fromScene.scene.key} to ${toScene}`);
    }

    resetGameState() {
        this.playerStats = {
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            maxHealth: 100,
            health: 100,
            damage: 10,
            moveSpeed: 200,
            fireRate: 1,
            attackRange: 100
        };
        
        this.powerUps = {
            speed: 0,
            damage: 0,
            health: 0,
            fireRate: 0,
            range: 0,
            magnet: 0
        };
        
        this.gameProgress = {
            gameTime: 0,
            currentDifficulty: 1,
            maxEnemies: 30,
            enemySpawnDelay: 3000,
            orbMagnetRange: 50
        };
        
        this.events.emit('gameStateReset');
    }
    getCurrentSurvivalTime() {
        if (!this.isGameRunning) return 0;
        return Math.floor((Date.now() - this.gameStartTime) / 1000);
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

    addEnemyKill() {
        if (this.isGameRunning) {
            this.currentRunStats.enemiesKilled++;
        }
    }

    addGold(amount) {
        const multiplier = this.passiveUpgrades.goldMultiplier ? this.passiveUpgrades.goldMultiplier.value / 100 : 1;
        const actualAmount = Math.floor(amount * multiplier);
        
        if (this.isGameRunning) {
            this.currentRunStats.goldEarned += actualAmount;
        }
    }

    addDamageDealt(damage) {
        if (this.isGameRunning) {
            this.currentRunStats.damageDealt += damage;
        }
    }

    saveGame() {
        const gameData = {
            gold: this.gold,
            passiveUpgrades: this.passiveUpgrades,
            allTimeStats: this.allTimeStats,
            lastRunStats: this.lastRunStats,
            gameStats: this.allTimeStats // For backward compatibility
        };
        
        saveToLocalStorage(gameData);
    }

    loadGame() {
        const savedData = loadFromLocalStorage();
        if (savedData) {
            this.gold = savedData.gold || 500;
            this.passiveUpgrades = savedData.passiveUpgrades || {};
            this.allTimeStats = savedData.allTimeStats || {
                totalRuns: 0,
                totalGoldEarned: 0,
                totalEnemiesKilled: 0,
                totalExperienceGained: 0,
                totalDamageDealt: 0,
                highestLevel: 1,
                longestSurvivalTime: 0,
                averageSurvivalTime: 0
            };
            this.lastRunStats = savedData.lastRunStats || null;
            
            console.log("Game loaded from save data");
        }
    }

    setCurrentScene(scene) {
        this.currentScene = scene;
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log("Debug mode:", this.debugMode ? "ON" : "OFF");
        return this.debugMode;
    }
    
    directlyApplyMenuUpgrades() {
        try {
            const storageData = localStorage.getItem('survivor_game_save');
            if (!storageData) {
                console.log("No saved data found in local storage");
                return;
            }
            
            const savedData = JSON.parse(storageData);
            
            if (savedData && savedData.passiveUpgrades) {
                console.log("Found passive upgrades in localStorage:", savedData.passiveUpgrades);
                
                this.passiveUpgrades = savedData.passiveUpgrades;
                
                const upgrades = savedData.passiveUpgrades;
                
                if (upgrades.maxHealth) {
                    this.playerStats.maxHealth = upgrades.maxHealth.value;
                    this.playerStats.health = upgrades.maxHealth.value;
                    console.log("Set maxHealth:", this.playerStats.maxHealth);
                }
                
                if (upgrades.baseDamage) {
                    this.playerStats.damage = upgrades.baseDamage.value;
                    console.log("Set damage:", this.playerStats.damage);
                }
                
                if (upgrades.moveSpeed) {
                    this.playerStats.moveSpeed = upgrades.moveSpeed.value;
                    console.log("Set moveSpeed:", this.playerStats.moveSpeed);
                }
                
                if (upgrades.expMultiplier) {
                    this.playerStats.expMultiplier = upgrades.expMultiplier.value;
                    console.log("Set expMultiplier:", this.playerStats.expMultiplier);
                }
                
                if (upgrades.goldMultiplier) {
                    this.goldMultiplier = upgrades.goldMultiplier.value;
                    console.log("Set goldMultiplier:", this.goldMultiplier);
                }
                
                console.log("Updated playerStats with menu upgrades:", this.playerStats);
            }
        } catch (error) {
            console.error("Error applying menu upgrades:", error);
        }
    }
}