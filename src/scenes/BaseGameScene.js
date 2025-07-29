import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import { EventBus } from '../game/EventBus';

export default class BaseGameScene extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
        
        this.gameManager = null;
        this.uiManager = null;
        this.gameplayManager = null;
        this.powerUpManager = null;
        this.playerAttackSystem = null;
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
        console.log("BaseGameScene create() called - initializing fresh run");
        
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
        
        this.initializeCollisionSystem();
        this.createStatsDisplay();
        this.setupUIEventListeners();
        
        if (this.gameManager) {
            this.gameManager.startNewRun();
            this.gameManager.currentWave = 0;
        }
        
        console.log("BaseGameScene create() completed - ready for new run");
        
        // Emit scene ready event
        EventBus.emit('current-scene-ready', this);
    }
    
    createStatsDisplay() {
        try {
            // Create stats container in top-right corner
            this.statsContainer = this.add.container(this.cameras.main.width - 20, 20);
            this.statsContainer.setScrollFactor(0);
            this.statsContainer.setDepth(1000);
            
            // Create background for stats
            this.statsBackground = this.add.rectangle(0, 0, 220, 140, 0x000000, 0.8);
            this.statsBackground.setOrigin(1, 0);
            this.statsBackground.setStrokeStyle(2, 0x444444, 1);
            this.statsContainer.add(this.statsBackground);
            
            // Create text elements with proper spacing
            this.waveText = this.add.text(-10, 10, 'Wave: 0', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                fontWeight: 'bold'
            });
            this.waveText.setOrigin(1, 0);
            this.statsContainer.add(this.waveText);
            
            this.killsText = this.add.text(-10, 30, 'Kills: 0', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ff6666',
                fontWeight: 'bold'
            });
            this.killsText.setOrigin(1, 0);
            this.statsContainer.add(this.killsText);
            
            this.goldText = this.add.text(-10, 50, 'Gold: 0', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#FFD700',
                fontWeight: 'bold'
            });
            this.goldText.setOrigin(1, 0);
            this.statsContainer.add(this.goldText);
            
            this.timeText = this.add.text(-10, 70, 'Time: 00:00', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#88ff88',
                fontWeight: 'bold'
            });
            this.timeText.setOrigin(1, 0);
            this.statsContainer.add(this.timeText);
            
            this.levelText = this.add.text(-10, 90, 'Level: 1', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffaa00',
                fontWeight: 'bold'
            });
            this.levelText.setOrigin(1, 0);
            this.statsContainer.add(this.levelText);
            
            this.expText = this.add.text(-10, 110, 'EXP: 0/100', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#8888ff',
                fontWeight: 'bold'
            });
            this.expText.setOrigin(1, 0);
            this.statsContainer.add(this.expText);
            
        } catch (error) {
            console.error("Error creating stats display:", error);
        }
    }
    
    setupUIEventListeners() {
        try {
            // Listen for game state updates
            window.addEventListener('gameStateUpdated', (event) => {
                this.updateStatsDisplay();
            });
            
            // Listen for level up events
            window.addEventListener('levelUp', (event) => {
                this.updateStatsDisplay();
            });
            
            // Set up periodic updates
            this.statsUpdateTimer = this.time.addEvent({
                delay: 100, // Update every 100ms
                callback: () => this.updateStatsDisplay(),
                loop: true
            });
            
        } catch (error) {
            console.error("Error setting up UI event listeners:", error);
        }
    }
    
    updateStatsDisplay() {
        if (!this.gameManager || !this.statsContainer) return;
        
        try {
            // Update wave information
            const waveInfo = this.gameplayManager?.mobManager?.getStatistics();
            const currentWave = waveInfo?.currentWave || 0;
            this.waveText.setText(`Wave: ${currentWave}`);
            
            // Update kills
            const kills = this.gameManager.currentRunStats?.enemiesKilled || 0;
            this.killsText.setText(`Kills: ${kills}`);
            
            // FIXED: Get actual current total gold from GameManager
            const totalGold = this.gameManager.getGold() || 0;
            this.goldText.setText(`Gold: ${totalGold}`);
            
            // Update survival time
            const survivalTime = this.gameManager.getCurrentSurvivalTime();
            const formattedTime = this.gameManager.formatTime(survivalTime);
            this.timeText.setText(`Time: ${formattedTime}`);
            
            // Update level and experience
            const level = this.gameManager.playerStats?.level || 1;
            const exp = this.gameManager.playerStats?.experience || 0;
            const nextExp = this.gameManager.playerStats?.nextLevelExp || 100;
            this.levelText.setText(`Level: ${level}`);
            this.expText.setText(`EXP: ${exp}/${nextExp}`);
            
        } catch (error) {
            console.error("Error updating stats display:", error);
        }
    }
    
    initializeCollisionSystem() {
        try {
            this.zombieGroup = this.physics.add.group();
            this.staticObstacles = this.physics.add.staticGroup();
            this.collisionLayers = [];
        } catch (error) {
            console.error("Error initializing collision system:", error);
        }
    }
    
    registerCollisionLayer(layer, name = 'Unknown Layer') {
        if (!layer) return;
        
        try {
            layer.setCollisionBetween(0, 10000);
            
            if (this.gameplayManager?.mobManager?.mobGroup) {
                this.physics.add.collider(this.gameplayManager.mobManager.mobGroup, layer);
            }
            
            this.collisionLayers.push({ layer, name });
        } catch (error) {
            console.error(`Error registering collision layer ${name}:`, error);
        }
    }
    
    registerStaticObstacle(gameObject, name = 'Unknown Object') {
        if (!gameObject) return;
        
        try {
            if (!gameObject.body) {
                this.physics.add.existing(gameObject, true);
            }
            
            this.staticObstacles.add(gameObject);
        } catch (error) {
            console.error(`Error registering static obstacle ${name}:`, error);
        }
    }
    
    autoRegisterCollisions() {
        try {
            const commonCollisionLayerNames = [
                'collision', 'walls', 'wall', 'obstacles', 'solid',
                'Map_Col', 'BackGround', 'Wall_Upper', 'Wall_down', 'Wall_RU', 'Wall_RD',
                'Bed', 'Vase_AC', 'Map_', 'platform', 'ground'
            ];
            
            this.children.list.forEach(child => {
                if (child instanceof Phaser.Tilemaps.TilemapLayer) {
                    const layerName = child.layer?.name || 'Unknown';
                    
                    const shouldHaveCollision = commonCollisionLayerNames.some(name => 
                        layerName.toLowerCase().includes(name.toLowerCase())
                    );
                    
                    if (shouldHaveCollision) {
                        this.registerCollisionLayer(child, layerName);
                    }
                }
            });
            
            this.autoRegisterStaticObjects();
            
        } catch (error) {
            console.error("Error in auto-registration:", error);
        }
    }
    
    autoRegisterStaticObjects() {
        try {
            const commonObstacleNames = [
                'torch', 'statue', 'pillar', 'column', 'tree', 'rock', 'stone',
                'barrel', 'crate', 'wall', 'fence', 'door'
            ];
            
            this.children.list.forEach(child => {
                if (child instanceof Phaser.GameObjects.Sprite || 
                    child instanceof Phaser.GameObjects.Image) {
                    
                    const texture = child.texture?.key || '';
                    const childName = child.name || '';
                    
                    const shouldBeObstacle = commonObstacleNames.some(name => 
                        texture.toLowerCase().includes(name) || 
                        childName.toLowerCase().includes(name)
                    );
                    
                    if (shouldBeObstacle) {
                        this.registerStaticObstacle(child, childName || texture);
                    }
                }
            });
            
        } catch (error) {
            console.error("Error auto-registering static objects:", error);
        }
    }
    
    setupZombieObstacleCollisions() {
        try {
            if (this.staticObstacles && this.gameplayManager?.mobManager?.mobGroup) {
                this.physics.add.collider(
                    this.gameplayManager.mobManager.mobGroup, 
                    this.staticObstacles,
                    this.handleZombieObstacleCollision, 
                    null, 
                    this
                );
            }
        } catch (error) {
            console.error("Error setting up zombie-obstacle collisions:", error);
        }
    }
    
    handleZombieObstacleCollision(zombie, obstacle) {
        try {
            const angle = Phaser.Math.Angle.Between(
                obstacle.x, obstacle.y, zombie.x, zombie.y
            );
            
            const bounceForce = 50;
            zombie.body.velocity.x += Math.cos(angle) * bounceForce;
            zombie.body.velocity.y += Math.sin(angle) * bounceForce;
        } catch (error) {
            console.error("Error in zombie-obstacle collision handler:", error);
        }
    }
    
    addZombie(zombie) {
        if (this.gameplayManager?.mobManager?.mobGroup && zombie) {
            this.gameplayManager.mobManager.mobGroup.add(zombie);
        }
    }
    
    removeZombie(zombie) {
        if (this.gameplayManager?.mobManager?.mobGroup && zombie) {
            this.gameplayManager.mobManager.mobGroup.remove(zombie);
        }
    }
    
    initializeManagers() {
        try {
            if (!this.gameManager) {
                this.gameManager = GameManager.get();
            }
            
            if (GameplayManager) {
                this.gameplayManager = new GameplayManager(this);
                this.gameplayManager.initialize(this.player);
                
                this.enemies = this.gameplayManager.enemies;
                this.experienceOrbs = this.gameplayManager.expOrbs;
                this.goldOrbs = this.gameplayManager.goldOrbs;
                this.zombieGroup = this.gameplayManager.mobManager.mobGroup;
            }
            
            if (UIManager) {
                this.uiManager = new UIManager(this);
                this.uiManager.initialize();
            }
            
            if (PowerUpManager) {
                this.powerUpManager = new PowerUpManager(this);
                this.powerUpManager.initialize();
            }
            
            if (this.player && this.gameManager) {
                this.gameManager.applyPlayerStats(this.player);
                
                if (this.gameManager.debugMode) {
                    this.createUpgradeDebugDisplay();
                }
            }
        } catch (error) {
            console.error("Error initializing managers:", error);
        }
    }
    
    initializePlayer() {
        if (!this.player) {
            console.warn("No player to initialize");
            return;
        }
        
        if (this.gameManager) {
            this.gameManager.applyPlayerStats(this.player);
        }
        
        if (!this.player.armor) this.player.armor = 0;
        if (!this.player.critChance) this.player.critChance = 0.05;
        if (!this.player.critDamage) this.player.critDamage = 1.5;
        if (!this.player.pickupRange) this.player.pickupRange = 50;
    }
    
    setupPlayerAttack() {
        try {
            if (PlayerAttack) {
                this.playerAttackSystem = new PlayerAttack(this, this.player);
                
                if (this.playerAttackSystem.updateStats) {
                    this.playerAttackSystem.updateStats();
                }
            }
        } catch (error) {
            console.error("Error setting up player attack:", error);
        }
    }
    
    spawnWave() {
        if (!this.gameplayManager?.mobManager) return;
        
        this.currentWave++;
        this.gameplayManager.mobManager.startWave(this.currentWave);
        
        if (this.gameManager) {
            this.gameManager.currentWave = this.currentWave;
        }
    }
    
    trackEnemyKill(enemy) {
        this.enemiesKilled++;
        
        // Update game manager
        if (this.gameManager) {
            this.gameManager.addEnemyKill();
        }
        
        // Force UI update
        this.updateStatsDisplay();
    }
    
    spawnExperienceOrb(x, y, value) {
        if (this.gameplayManager?.spawnExperienceOrb) {
            return this.gameplayManager.spawnExperienceOrb(x, y, value);
        }
        
        try {
            const orb = this.add.circle(x, y, 6, 0x00ffff);
            orb.expValue = value || 5;
            this.physics.add.existing(orb);
            orb.body.setCircle(6);
            
            this.physics.add.overlap(this.player, orb, (player, orb) => {
                if (this.gameManager) {
                    this.gameManager.addExperience(orb.expValue);
                }
                orb.destroy();
            });
            
            return orb;
        } catch (error) {
            console.error("Error spawning experience orb:", error);
            return null;
        }
    }
    
    spawnGoldOrb(x, y, value) {
        if (this.gameplayManager?.spawnGoldOrb) {
            return this.gameplayManager.spawnGoldOrb(x, y, value);
        }
        
        try {
            const goldOrb = this.add.circle(x, y, 8, 0xFFD700);
            goldOrb.goldValue = value || 1;
            this.physics.add.existing(goldOrb);
            goldOrb.body.setCircle(8);
            
            this.physics.add.overlap(this.player, goldOrb, (player, goldOrb) => {
                if (this.gameManager) {
                    this.gameManager.addGold(goldOrb.goldValue);
                }
                goldOrb.destroy();
            });
            
            return goldOrb;
        } catch (error) {
            console.error("Error spawning gold orb:", error);
            return null;
        }
    }
    
    handleTeleport(player, teleportZone, destScene) {
        if (this.isTeleporting) return;
        
        const targetScene = destScene || "MainMapScene";
        this.isTeleporting = true;
        
        this.createTeleportEffect(player.x, player.y);
        
        if (this.gameManager) {
            this.gameManager.handleSceneTransition(this, targetScene);
        }
        
        this.time.delayedCall(500, () => {
            this.scene.start(targetScene);
            this.isTeleporting = false;
        });
    }
    
    createTeleportEffect(x, y) {
        try {
            const flash = this.add.circle(x, y, 50, 0xffffff, 0.8);
            
            this.tweens.add({
                targets: flash,
                scale: 2,
                alpha: 0,
                duration: 500,
                onComplete: () => flash.destroy()
            });
        } catch (error) {
            console.error("Error creating teleport effect:", error);
        }
    }
    
    createUpgradeDebugDisplay() {
        try {
            if (this.upgradeDebugText) {
                this.upgradeDebugText.destroy();
            }
            
            const debugText = this.add.text(10, 10, "", {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 }
            });
            debugText.setScrollFactor(0);
            debugText.setDepth(1000);
            
            this.upgradeDebugText = debugText;
            
        } catch (error) {
            console.error("Error creating debug display:", error);
        }
    }
    
    setupTestControls() {
        try {
            this.input.keyboard.on('keydown-BACKTICK', () => {
                if (this.gameManager) {
                    const isDebug = this.gameManager.toggleDebugMode();
                    
                    if (isDebug) {
                        this.createUpgradeDebugDisplay();
                    } else {
                        if (this.upgradeDebugText) {
                            this.upgradeDebugText.destroy();
                            this.upgradeDebugText = null;
                        }
                    }
                }
            });
            
            this.input.keyboard.on('keydown-T', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    this.spawnWave();
                }
            });
            
            this.input.keyboard.on('keydown-C', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    this.autoRegisterCollisions();
                    this.setupZombieObstacleCollisions();
                }
            });
            
            this.input.keyboard.on('keydown-H', () => { 
                if (this.player && this.player.heal && this.gameManager && this.gameManager.debugMode) {
                    this.player.heal(50);
                }
            });
            
            this.input.keyboard.on('keydown-Y', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    this.gameManager.addGold(100);
                }
            });
            
            this.input.keyboard.on('keydown-ESC', () => {
                if (window.returnToMenu) {
                    this.shutdown();
                    window.returnToMenu();
                }
            });
        } catch (error) {
            console.error("Error setting up test controls:", error);
        }
    }
    
    update(time, delta) {
    try {
    if (this.player && this.player.isDead) {
    return;
    }
    
    // Only update gameplayManager if it exists and has update method
    if (this.gameplayManager && typeof this.gameplayManager.update === 'function') {
    this.gameplayManager.update(time, delta);
    }
    
    if (this.uiManager && typeof this.uiManager.update === 'function') {
    this.uiManager.update(time, delta);
    }
            
            if (this.playerAttackSystem && this.playerAttackSystem.update) {
                this.playerAttackSystem.update();
            }
            
            if (this.playerAttackSystem && this.playerAttackSystem.updateStats) {
                this.playerAttackSystem.updateStats();
            }
            
            if (this.gameManager && this.gameManager.isGameRunning) {
                this.gameManager.updateDifficulty(delta);
            }
            
            if (this.gameManager && this.gameManager.debugMode && this.upgradeDebugText) {
                this.updateDebugDisplay();
            }
            
        } catch (error) {
            console.error(`Error in ${this.scene.key} update:`, error);
        }
    }
    
    updateDebugDisplay() {
        if (!this.upgradeDebugText || !this.player || !this.gameManager) return;
        
        try {
            const currentTime = this.gameManager.getCurrentSurvivalTime();
            const stats = this.gameplayManager?.mobManager?.getStatistics() || {};
            const waveProgress = this.gameplayManager?.mobManager?.getWaveProgress() || {};
            
            const text = [
                `=== DEBUG INFO ===`,
                `Survival Time: ${this.gameManager.formatTime(currentTime)}`,
                `Level: ${this.gameManager.playerStats.level}`,
                `XP: ${this.gameManager.playerStats.experience}/${this.gameManager.playerStats.nextLevelExp}`,
                `Gold: ${this.gameManager.gold}`,
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
                `Total Killed: ${stats.totalKilled || 0}`,
                ``,
                `Player Stats:`,
                `Health: ${this.player.health?.toFixed(1)}/${this.player.maxHealth?.toFixed(1)}`,
                `Damage: ${this.player.damage?.toFixed(1)}`,
                `Speed: ${this.player.moveSpeed?.toFixed(1)}`,
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
        // Clean up UI update timer
        if (this.statsUpdateTimer) {
            this.statsUpdateTimer.destroy();
            this.statsUpdateTimer = null;
        }
        
        // Clean up event listeners
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
        
        if (this.upgradeDebugText) {
            this.upgradeDebugText.destroy();
            this.upgradeDebugText = null;
        }
        
        // Clean up stats display
        if (this.statsContainer) {
            this.statsContainer.destroy();
            this.statsContainer = null;
        }
    
        this.enemiesKilled = 0;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.gameStartTime = 0;
        
        console.log("BaseGameScene shutdown complete");
    }
}