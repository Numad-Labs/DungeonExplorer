import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";

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
        this.zombieGroup = null;
        this.staticObstacles = null;
        this.collisionLayers = [];
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
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
        
        if (this.gameManager) {
            this.gameManager.startNewRun();
            this.gameManager.currentWave = 0;
        }
        
        console.log("BaseGameScene create() completed - ready for new run");
    }
    
    initializeCollisionSystem() {
        try {
            this.zombieGroup = this.physics.add.group();
            this.staticObstacles = this.physics.add.staticGroup();
            this.collisionLayers = [];
            
            console.log("Universal collision system initialized");
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
            console.log(`Registered collision layer: ${name}`);
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
            console.log("Initializing managers with GameManager:", !!this.gameManager);
            if (!this.gameManager) {
                this.gameManager = GameManager.get();
            }
            
            if (GameplayManager) {
                this.gameplayManager = new GameplayManager(this);
                this.gameplayManager.initialize(this.player);
                
                this.enemies = this.gameplayManager.enemies;
                this.experienceOrbs = this.gameplayManager.expOrbs;
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
                console.log("Applying player stats from GameManager to player");
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
        
        console.log("Player initialized with stats:", {
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            damage: this.player.damage,
            moveSpeed: this.player.moveSpeed,
            armor: this.player.armor
        });
    }
    
    setupPlayerAttack() {
        try {
            if (PlayerAttack) {
                this.playerAttackSystem = new PlayerAttack(this, this.player);
                
                if (this.playerAttackSystem.updateStats) {
                    this.playerAttackSystem.updateStats();
                }
                console.log("Player attack system initialized");
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
        
        console.log(`Started wave ${this.currentWave} via MobManager`);
    }
    
    trackEnemyKill(enemy) {
        this.enemiesKilled++;
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
            
            console.log("Debug display created");
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
                    console.log("Debug: Triggering wave manually");
                    this.spawnWave();
                }
            });
            
            this.input.keyboard.on('keydown-C', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Auto-registering collisions");
                    this.autoRegisterCollisions();
                    this.setupZombieObstacleCollisions();
                }
            });
            
            this.input.keyboard.on('keydown-H', () => { 
                if (this.player && this.player.heal && this.gameManager && this.gameManager.debugMode) {
                    this.player.heal(50);
                    console.log("Debug: Player healed");
                }
            });
            
            this.input.keyboard.on('keydown-ESC', () => {
                console.log("ESC pressed - returning to menu");
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
            
            if (this.gameplayManager) {
                this.gameplayManager.update(time, delta);
            }
            
            if (this.uiManager) {
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
                `H - Heal | ESC - Exit`,
                `GameplayManager Debug Controls Active`
            ].join('\n');
            
            this.upgradeDebugText.setText(text);
        } catch (error) {
            console.error("Error updating debug display:", error);
        }
    }
    
    shutdown() {
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
        
        this.enemiesKilled = 0;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        this.gameStartTime = 0;
        
        console.log("BaseGameScene shutdown complete");
    }
}