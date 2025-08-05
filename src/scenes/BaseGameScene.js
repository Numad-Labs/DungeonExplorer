import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import PlayerLevel from "../prefabs/PlayerLevel";
import { EventBus } from '../game/EventBus';

export default class BaseGameScene extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
        
        this.gameManager = null;
        this.uiManager = null;
        this.gameplayManager = null;
        this.powerUpManager = null;
        this.playerAttackSystem = null;
        this.playerAttack = null;
        this.playerLevelSystem = null;
        this.player = null;
        this.isTeleporting = false;
        this.debugMode = false;
        this.enemies = null;
        this.experienceOrbs = null;
        this.goldOrbs = null;
        this.zombieGroup = null;
        this.staticObstacles = null;
        this.collisionLayers = [];
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
        
        // UI Elements
        this.statsContainer = null;
        this.waveText = null;
        this.killsText = null;
        this.goldText = null;
        this.timeText = null;
        this.expText = null;
        this.levelText = null;
        this.enemySpawnTimer = null;
        this.upgradeDebugText = null;
    }
    
    preload() {
        this.load.spritesheet('AOE_Fire_Ball_Projectile_VFX_V01', 'assets/Hero/AttackPatterns/fire_ball.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('AOE_Fire_Blast_Attack_VFX_V01', 'assets/Hero/AttackPatterns/fire_blast.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        
        this.load.spritesheet('AOE_Ice_Shard_Projectile_VFX_V01', 'assets/Hero/AttackPatterns/ice_shard.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    
    create() {
        this.gameManager = this.game.registry.get('gameManager');
        if (!this.gameManager) {
            this.gameManager = new GameManager();
            this.game.registry.set('gameManager', this.gameManager);
        }
        
        if (this.gameManager) {
            this.gameManager.setCurrentScene(this);
        }
        
        this.gameStartTime = Date.now();
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.enemiesKilled = 0;
        this.isTeleporting = false;
        
        if (!this.enemies) {
            this.initializeCollisionSystem();
        }
        
        this.initializeManagers();
        this.createStatsDisplay();
        this.setupUIEventListeners();
        
        if (this.player) {
            this.onPlayerCreated(this.player);
        }
        
        if (this.gameManager) {
            this.gameManager.startNewRun();
            this.gameManager.currentWave = 0;
        }
        EventBus.emit('current-scene-ready', this);
    }
    
    initializeManagers() {
        if (!this.powerUpManager) {
            this.powerUpManager = new PowerUpManager(this);
            this.powerUpManager.initialize();
        }
        
        try {
            if (!this.gameplayManager) {
                this.gameplayManager = new GameplayManager(this);
                if (this.gameplayManager.initialize) {
                    this.gameplayManager.initialize();
                }
            }
        } catch (error) {
            console.warn("BaseGameScene: GameplayManager initialization failed, continuing without it:", error);
            this.gameplayManager = null;
        }
        
        try {
            if (!this.uiManager) {
                this.uiManager = new UIManager(this);
            }
        } catch (error) {
            console.warn("BaseGameScene: UIManager initialization failed, continuing without it:", error);
            this.uiManager = null;
        }
    }
    
    initializePlayerSystems() {
        if (!this.player) {
            console.warn("BaseGameScene: Player not found, cannot initialize player systems");
            return;
        }
        
        this.playerLevelSystem = new PlayerLevel(this, 20, 20);
        this.add.existing(this.playerLevelSystem);
        this.playerAttack = new PlayerAttack(this, this.player);
        this.add.existing(this.playerAttack);
        this.playerAttackSystem = this.playerAttack;
        
        this.playerLevelSystem.onLevelUp((newLevel) => {
            if (this.powerUpManager && this.powerUpManager.skillUpgradeManager) {
                this.powerUpManager.skillUpgradeManager.playerLevel = newLevel;
                this.powerUpManager.skillUpgradeManager.showSkillUpgradeSelection();
            } else {
                console.error("BaseGameScene: PowerUpManager or SkillUpgradeManager not found!");
            }
        });
        
        if (this.powerUpManager && this.powerUpManager.skillUpgradeManager) {
            this.powerUpManager.skillUpgradeManager.setupInitialSkills();
        }
    }
    
    initializeCollisionSystem() {
        this.enemies = this.physics.add.group();
        this.experienceOrbs = this.physics.add.group();
        this.goldOrbs = this.physics.add.group();
        this.zombieGroup = this.physics.add.group();
        this.staticObstacles = this.physics.add.staticGroup();
    }
    
    createStatsDisplay() {
        try {
            // Create stats container in top-right corner
            this.statsContainer = this.add.container(this.cameras.main.width - 20, 20);
            this.statsContainer.setScrollFactor(0);
            this.statsContainer.setDepth(1000);
            
            const bgStyle = {
                x: -200,
                y: 0,
                width: 200,
                height: 120,
                fillColor: 0x000000,
                fillAlpha: 0.7
            };
            
            const statsBg = this.add.rectangle(bgStyle.x, bgStyle.y, bgStyle.width, bgStyle.height, bgStyle.fillColor, bgStyle.fillAlpha);
            statsBg.setOrigin(0, 0);
            this.statsContainer.add(statsBg);
            
            const textStyle = {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            };
            
            this.levelText = this.add.text(-190, 10, 'Level: 1', textStyle);
            this.expText = this.add.text(-190, 25, 'EXP: 0/100', textStyle);
            this.killsText = this.add.text(-190, 40, 'Kills: 0', textStyle);
            this.goldText = this.add.text(-190, 55, 'Gold: 0', textStyle);
            this.timeText = this.add.text(-190, 70, 'Time: 00:00', textStyle);
            this.waveText = this.add.text(-190, 85, 'Wave: 0', textStyle);
            
            this.statsContainer.add([
                this.levelText, this.expText, this.killsText, 
                this.goldText, this.timeText, this.waveText
            ]);
            
            this.statsUpdateTimer = this.time.addEvent({
                delay: 1000,
                callback: this.updateStatsDisplay,
                callbackScope: this,
                loop: true
            });
            
            console.log("BaseGameScene: Stats display created");
            
        } catch (error) {
            console.error("Error creating stats display:", error);
        }
    }
    
    updateStatsDisplay() {
        try {
            if (!this.gameManager) return;
            
            const currentTime = Date.now() - this.gameStartTime;
            const stats = this.gameplayManager?.mobManager?.getStatistics() || {};
            
            // Update level and experience
            if (this.playerLevelSystem) {
                this.levelText?.setText(`Level: ${this.playerLevelSystem.getLevel()}`);
                this.expText?.setText(`EXP: ${this.playerLevelSystem.experience}/${this.playerLevelSystem.nextLevelExp}`);
            }
            
            this.killsText?.setText(`Kills: ${stats.totalKilled || this.enemiesKilled}`);
            this.goldText?.setText(`Gold: ${this.gameManager.gold || 0}`);
            this.timeText?.setText(`Time: ${this.formatTime(currentTime)}`);
            this.waveText?.setText(`Wave: ${stats.currentWave || this.currentWave}`);
            
        } catch (error) {
            console.error("Error updating stats display:", error);
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    setupUIEventListeners() {
        window.addEventListener('gameStateUpdated', this.updateStatsDisplay.bind(this));
        window.addEventListener('levelUp', this.updateStatsDisplay.bind(this));
        
        this.input.keyboard.on('keydown-D', () => {
            this.debugMode = !this.debugMode;
        });
    }
    
    onPlayerCreated(player) {
        this.player = player;
        this.initializePlayerSystems();
        this.setupExperienceCollection();
    }
    
    setupExperienceCollection() {
        if (!this.player || !this.experienceOrbs) return;
        
        this.physics.add.overlap(this.player, this.experienceOrbs, (player, orb) => {
            if (this.playerLevelSystem) {
                const expAmount = orb.expValue || 1;
                this.playerLevelSystem.addExperience(expAmount);
            }
            orb.destroy();
        });
        
        if (this.enemies) {
            this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
                
            });
        }
        
        if (this.zombieGroup) {
            this.physics.add.overlap(this.player, this.zombieGroup, (player, zombie) => {
                
            });
        }
    }
    
    addExperience(amount) {
        if (this.playerLevelSystem) {
            this.playerLevelSystem.addExperience(amount);
        }
    }
    
    getPlayerLevel() {
        return this.playerLevelSystem ? this.playerLevelSystem.getLevel() : 1;
    }
    
    showPowerUpSelection() {
        if (this.powerUpManager) {
            this.powerUpManager.showPowerUpSelection();
        }
    }
    
    startEnemySpawning() {
        if (this.gameplayManager && this.gameplayManager.mobManager) {
            try {
                if (this.gameplayManager.mobManager.startSpawning) {
                    this.gameplayManager.mobManager.startSpawning();
                    return;
                }
            } catch (error) {
                console.warn("BaseGameScene: GameplayManager spawning failed:", error);
            }
        }
        if (!this.enemies) {
            this.enemies = this.physics.add.group();
        }
        if (!this.zombieGroup) {
            this.zombieGroup = this.physics.add.group();
        }
    }
    
    spawnBasicEnemy() {
        if (!this.player || this.player.isDead) return;
        
        const spawnDistance = 300;
        const angle = Math.random() * Math.PI * 2;
        const x = this.player.x + Math.cos(angle) * spawnDistance;
        const y = this.player.y + Math.sin(angle) * spawnDistance;
    }
    
    setupPlayerAttack() {
        if (!this.player) {
            console.warn("BaseGameScene: Cannot setup player attack - player not found");
            return;
        }
        
        if (!this.playerAttack) {
            try {
                this.playerAttack = new PlayerAttack(this, this.player);
                this.add.existing(this.playerAttack);
                this.playerAttackSystem = this.playerAttack;
                
                if (this.playerAttack.setActive) {
                    this.playerAttack.setActive(true);
                }
            } catch (error) {
                console.error("BaseGameScene: Failed to initialize PlayerAttack:", error);
            }
        } else {
            console.log("BaseGameScene: PlayerAttack system already exists");
        }
    }
    
    setupTestControls() {
        this.input.keyboard.on('keydown-T', () => {
            console.log("Debug: Trigger level up");
            if (this.playerLevelSystem) {
                this.playerLevelSystem.addExperience(100);
            }
        });
        
        this.input.keyboard.on('keydown-H', () => {
            console.log("Debug: Heal player");
            if (this.player) {
                this.player.heal(50);
            }
        });
        
        this.input.keyboard.on('keydown-Y', () => {
            console.log("Debug: Add gold");
            if (this.gameManager) {
                this.gameManager.gold += 100;
            }
        });
        
        this.input.keyboard.on('keydown-K', () => {
            console.log("Debug: Manual slash attack trigger");
            if (this.playerAttack) {
                this.playerAttack.attemptSlashAttack();
            } else {
                console.log("Debug: PlayerAttack not found");
            }
        });
    }
    
    trackEnemyKill(enemy) {
        this.enemiesKilled++;
        
        if (this.playerLevelSystem) {
            this.playerLevelSystem.addExperience(10);
        }
        
        if (this.gameManager) {
            this.gameManager.trackEnemyKill();
        }
    }
    
    removeZombie(zombie) {
        if (this.zombieGroup && zombie) {
            this.zombieGroup.remove(zombie);
        }
        
        if (this.enemies && zombie) {
            this.enemies.remove(zombie);
        }
    }
    
    addEnemyToGroups(enemy) {
        if (!enemy) return;
        
        if (this.enemies) {
            this.enemies.add(enemy);
        }
        
        if (this.zombieGroup && (enemy.isZombie || enemy.constructor.name.toLowerCase().includes('zombie'))) {
            this.zombieGroup.add(enemy);
        }
    }
    
    update(time, delta) {
        try {
            if (this.debugMode && this.upgradeDebugText) {
                this.updateDebugDisplay();
            }
            
        } catch (error) {
            console.error("Error in BaseGameScene update:", error);
        }
    }
    
    updateDebugDisplay() {
        if (!this.upgradeDebugText) return;
        
        try {
            const currentTime = Date.now() - this.gameStartTime;
            const stats = this.gameplayManager?.mobManager?.getStatistics() || {};
            const waveProgress = this.gameplayManager?.mobManager?.getWaveProgress() || {};
            
            const text = [
                `=== DEBUG INFO ===`,
                `Survival Time: ${this.gameManager ? this.gameManager.formatTime(currentTime / 1000) : this.formatTime(currentTime)}`,
                `Level: ${this.playerLevelSystem ? this.playerLevelSystem.getLevel() : 1}`,
                `XP: ${this.playerLevelSystem ? this.playerLevelSystem.experience : 0}/${this.playerLevelSystem ? this.playerLevelSystem.nextLevelExp : 100}`,
                `Gold: ${this.gameManager ? this.gameManager.gold : 0}`,
                ``,
                `WAVE SYSTEM:`,
                `Current Wave: ${stats.currentWave || 0}`,
                `Wave Active: ${stats.waveActive ? 'YES' : 'NO'}`,
                `Wave Progress: ${waveProgress.remaining || 0}/${waveProgress.total || 0}`,
                `Next Wave: ${waveProgress.nextWaveTime || 0}s`,
                ``,
                `MOB SYSTEM:`,
                `Active Mobs: ${stats.activeCount || 0}`,
                `Total Spawned: ${stats.totalSpawned || 0}`,
                `Total Killed: ${stats.totalKilled || this.enemiesKilled}`,
                ``,
                `Player Stats:`,
                `Health: ${this.player ? this.player.health?.toFixed(1) : 0}/${this.player ? this.player.maxHealth?.toFixed(1) : 100}`,
                `Damage: ${this.player ? this.player.damage?.toFixed(1) : 10}`,
                `Speed: ${this.player ? this.player.moveSpeed?.toFixed(1) : 150}`,
                ``,
                `Controls:`,
                `T - Trigger Wave | C - Auto-Collisions`,
                `H - Heal | Y - Add Gold | ESC - Exit`,
                `GameplayManager Debug Controls Active`
            ].join('\n');
            
            this.upgradeDebugText.setText(text);
        } catch (error) {
            console.error("Error updating debug display:", error);
        }
    }
    
    shutdown() {
        if (this.statsUpdateTimer) {
            this.statsUpdateTimer.destroy();
            this.statsUpdateTimer = null;
        }
        
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
            this.enemySpawnTimer = null;
        }
        
        window.removeEventListener('gameStateUpdated', this.updateStatsDisplay);
        window.removeEventListener('levelUp', this.updateStatsDisplay);
        
        if (this.gameplayManager) {
            this.gameplayManager.shutdown();
        }
        
        if (this.uiManager) {
            this.uiManager.shutdown();
        }
        
        if (this.powerUpManager) {
            this.powerUpManager.shutdown();
        }
        
        this.enemies = null;
        this.experienceOrbs = null;
        this.goldOrbs = null;
        this.zombieGroup = null;
        
        if (this.staticObstacles) {
            this.staticObstacles.clear(true, true);
            this.staticObstacles = null;
        }
        
        this.collisionLayers = [];
        this.input.keyboard.removeAllListeners();
        if (this.gameManager) {
            this.gameManager.saveGame();
            this.gameManager.currentWave = 0;
        }
        if (this.statsContainer) {
            this.statsContainer.destroy();
            this.statsContainer = null;
        }
        this.enemiesKilled = 0;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.gameStartTime = 0;
    }
    
    registerCollisionLayer(layer, name) {
        if (layer) {
            this.collisionLayers.push({ layer, name });
        }
    }
    
    registerStaticObstacle(obstacle, name) {
        if (obstacle && this.staticObstacles) {
            this.staticObstacles.add(obstacle);
        }
    }
    
    setupZombieObstacleCollisions() {
        if (this.zombieGroup && this.staticObstacles) {
            this.physics.add.collider(this.zombieGroup, this.staticObstacles);
        }
        
        this.collisionLayers.forEach(({ layer, name }) => {
            if (this.zombieGroup) {
                this.physics.add.collider(this.zombieGroup, layer);
            }
        });
    }
}