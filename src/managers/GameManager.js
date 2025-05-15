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
            maxEnemies: 30,
            enemySpawnDelay: 3000,
            orbMagnetRange: 50
        };

        this.events = new Phaser.Events.EventEmitter();
        
        this.directlyApplyMenuUpgrades();
        console.log("GameManager initialized");
    }
    
    static get() {
        if (!GameManager.instance) {
            new GameManager();
        }
        return GameManager.instance;
    }
    
    applyPlayerStats(playerPrefab) {
        if (!playerPrefab) return;
        
        playerPrefab.moveSpeed = this.playerStats.moveSpeed;
        playerPrefab.maxHealth = this.playerStats.maxHealth;
        playerPrefab.health = this.playerStats.health;
        playerPrefab.damage = this.playerStats.damage;
        playerPrefab.fireRate = this.playerStats.fireRate;
        playerPrefab.attackRange = this.playerStats.attackRange;
        
        console.log("Applied player stats to prefab:", this.playerStats);
        return playerPrefab;
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
        this.playerStats.experience += amount;
        
        if (this.playerStats.experience >= this.playerStats.nextLevelExp) {
            this.levelUp();
            return true;
        }
        
        this.events.emit('experienceUpdated', this.playerStats.experience, this.playerStats.nextLevelExp);
        return false;
    }
    
    levelUp() {
        this.playerStats.level++;
        
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
            
            // More gradual enemy scaling with a reasonable cap
            const baseMaxEnemies = 30;
            const enemiesPerLevel = 3;
            const maxEnemyCap = 60;
            
            this.gameProgress.maxEnemies = Math.min(
                maxEnemyCap,
                baseMaxEnemies + (this.gameProgress.currentDifficulty - 1) * enemiesPerLevel
            );
            
            const minSpawnDelay = 500;
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