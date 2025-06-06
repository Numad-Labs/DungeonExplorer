import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";
import Zombie from "../prefabs/Enemies/Zombie1";

export default class BaseGameScene extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
        
        // Game managers
        this.gameManager = null;
        this.uiManager = null;
        this.gameplayManager = null;
        this.powerUpManager = null;
        this.playerAttackSystem = null;
        
        // Player reference
        this.player = null;
        
        // Scene state
        this.isTeleporting = false;
        this.debugMode = false;
        
        // Game objects
        this.enemies = null;
        this.experienceOrbs = null;
        
        // Collision groups - Universal for all scenes
        this.zombieGroup = null;
        this.staticObstacles = null;
        this.collisionLayers = [];
        
        // Timers
        this.enemySpawnTimer = null;
        this.orbSpawnTimer = null;
        this.difficultyTimer = null;
        
        // Stats tracking
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
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
        
        this.enemies = this.physics.add.group();
        this.experienceOrbs = this.physics.add.group();
        
        this.initializeCollisionSystem();
        
        if (this.gameManager) {
            this.gameManager.startNewRun();
        }
    }
    
    initializeCollisionSystem() {
        try {
            this.zombieGroup = this.physics.add.group();
            this.staticObstacles = this.physics.add.staticGroup();
            this.physics.add.collider(this.zombieGroup, this.zombieGroup, 
            this.handleZombieCollision, null, this);
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
            this.physics.add.collider(this.zombieGroup, layer);
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
            
            // Auto-register common static objects
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
            if (this.staticObstacles && this.zombieGroup) {
                this.physics.add.collider(this.zombieGroup, this.staticObstacles, 
                this.handleZombieObstacleCollision, null, this);
            }
        } catch (error) {
            console.error("Error setting up zombie-obstacle collisions:", error);
        }
    }
    
    handleZombieCollision(zombie1, zombie2) {
        try {
            const distance = Phaser.Math.Distance.Between(
                zombie1.x, zombie1.y, zombie2.x, zombie2.y
            );
            
            if (distance < 20) {
                const angle = Phaser.Math.Angle.Between(
                    zombie1.x, zombie1.y, zombie2.x, zombie2.y
                );
                
                const separationForce = 30;
                const pushX = Math.cos(angle) * separationForce;
                const pushY = Math.sin(angle) * separationForce;
                
                zombie2.body.velocity.x += pushX;
                zombie2.body.velocity.y += pushY;
                zombie1.body.velocity.x -= pushX;
                zombie1.body.velocity.y -= pushY;
            }
        } catch (error) {
            console.error("Error in zombie collision handler:", error);
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
    
    // Method to add a zombie to the collision system
    addZombie(zombie) {
        if (this.zombieGroup && zombie) {
            this.zombieGroup.add(zombie);
        }
    }
    
    removeZombie(zombie) {
        if (this.zombieGroup && zombie) {
            this.zombieGroup.remove(zombie);
        }
    }
    
    initializeManagers() {
        try {
            console.log("Initializing managers with GameManager:", !!this.gameManager);
            if (!this.gameManager) {
                this.gameManager = GameManager.get();
            }
            
            if (UIManager) {
                this.uiManager = new UIManager(this);
                this.uiManager.initialize();
            }
            
            if (GameplayManager) {
                this.gameplayManager = new GameplayManager(this);
                this.gameplayManager.initialize(this.player);
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
    
    startEnemySpawning() {
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
            this.enemySpawnTimer = null;
        }
        if (this.difficultyTimer) {
            this.difficultyTimer.destroy();
            this.difficultyTimer = null;
        }
        
        this.enemySpawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnRandomEnemy,
            callbackScope: this,
            loop: true
        });
        
        this.difficultyTimer = this.time.addEvent({
            delay: 30000,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnRandomEnemy() {
        if (!this.player || this.player.isDead) return;
        
        try {
            const spawnDistance = 400;
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const spawnX = this.player.x + Math.cos(angle) * spawnDistance;
            const spawnY = this.player.y + Math.sin(angle) * spawnDistance;
            const testTextures = ['zombierun', 'zombie', 'player', 'enemy'];
            testTextures.forEach(tex => {
                const exists = this.textures.exists(tex);
                console.log(`- ${tex}: ${exists}`);
                if (exists) {
                    const texture = this.textures.get(tex);
                    console.log(`  Frames: ${texture.frameTotal}`);
                }
            });
            
            let zombieTexture = 'zombierun';
            if (!this.textures.exists('zombierun')) {
                zombieTexture = this.findValidTexture();
            }
            
            const zombie = new Zombie(this, spawnX, spawnY, zombieTexture, 0);
            this.validateZombieImmediately(zombie);
            
            this.enemies.add(zombie);
            this.addZombie(zombie);
        } catch (error) {
            console.error("Error spawning enemy:", error);
        }
    }
    
    findValidTexture() {
        const fallbackTextures = ['player', 'zombie', 'enemy', 'sprite'];
        
        for (const texture of fallbackTextures) {
            if (this.textures.exists(texture)) {
                console.log(`Found valid fallback texture: ${texture}`);
                return texture;
            }
        }
        
        this.createEmergencyTexture();
        return 'emergency_zombie';
    }
    
    createEmergencyTexture() {
        if (!this.textures.exists('emergency_zombie')) {
            const canvas = this.textures.createCanvas('emergency_zombie', 32, 32);
            const context = canvas.getContext();
            context.fillStyle = '#ff0000';
            context.fillRect(0, 0, 32, 32);
            context.fillStyle = '#ffffff';
            context.fillRect(8, 8, 16, 16);
            canvas.refresh();
        }
    }
    
    validateZombieImmediately(zombie) {
        try {
            if (!zombie.texture || zombie.texture.key === '__MISSING') {
                this.createEmergencyTexture();
                zombie.setTexture('emergency_zombie');
            }
            
            zombie.setVisible(true);
            zombie.setAlpha(1);
            zombie.setScale(1, 1);
            zombie.setDepth(5);
            
            if (!this.children.exists(zombie)) {
                this.add.existing(zombie);
                console.log("Added zombie to display list");
            }
            
            zombie.setPosition(zombie.x, zombie.y);
        } catch (error) {
            console.error("Error in immediate validation:", error);
        }
    }
    
    fixZombieAssets(zombie) {
        try {
            if (!zombie.texture || zombie.texture.key === '__MISSING' || zombie.texture.key === 'null') {
                if (this.textures.exists('zombierun')) {
                    zombie.setTexture('zombierun', 0);
                } else {
                    this.createFallbackTexture();
                    zombie.setTexture('zombie_fallback');
                }
            }
            
            zombie.setVisible(true);
            zombie.setAlpha(1);
            zombie.setScale(1, 1);
            zombie.setDepth(10);
            
            if (!this.children.exists(zombie)) {
                this.add.existing(zombie);
                console.log("Added zombie to display list");
            }
            
            zombie.setPosition(zombie.x, zombie.y);
        } catch (error) {
            console.error("Error fixing zombie assets:", error);
        }
    }
    
    createFallbackTexture() {
        if (!this.textures.exists('zombie_fallback')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xff0000); // Red color
            graphics.fillRect(0, 0, 32, 32);
            graphics.generateTexture('zombie_fallback', 32, 32);
            graphics.destroy();
            console.log("Created zombie_fallback texture");
        }
    }
    
    validateZombieAssets(zombie) {
        return this.fixZombieAssets(zombie);
    }
    
    increaseDifficulty() {
        if (this.enemySpawnTimer && !this.player.isDead) {
            this.enemySpawnTimer.delay = Math.max(1000, this.enemySpawnTimer.delay * 0.9);
            console.log("Difficulty increased, spawn delay:", this.enemySpawnTimer.delay);
        }
    }
    
    spawnExperienceOrb(x, y, value) {
        try {
            const orb = this.add.circle(x, y, 6, 0x00ffff);
            orb.expValue = value || 5;
            this.physics.add.existing(orb);
            orb.body.setCircle(6);
            this.experienceOrbs.add(orb);
            
            const moveToPlayer = () => {
                if (!this.player || this.player.isDead || !orb.body) return;
                
                const distance = Phaser.Math.Distance.Between(
                    orb.x, orb.y, this.player.x, this.player.y
                );
                
                if (distance < (this.player.pickupRange || 50)) {
                    const angle = Phaser.Math.Angle.Between(
                        orb.x, orb.y, this.player.x, this.player.y
                    );
                    
                    const speed = 200;
                    orb.body.setVelocity(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    );
                }
            };
            
            const updateEvent = this.time.addEvent({
                delay: 50,
                callback: moveToPlayer,
                repeat: -1
            });
            
            orb.on('destroy', () => {
                updateEvent.destroy();
            });
            
            this.physics.add.overlap(this.player, orb, (player, orb) => {
                this.collectExperienceOrb(orb);
            });
            
            this.time.delayedCall(30000, () => {
                if (orb && orb.active) {
                    orb.destroy();
                }
            });
            
        } catch (error) {
            console.error("Error spawning experience orb:", error);
        }
    }
    
    collectExperienceOrb(orb) {
        try {
            if (this.gameManager) {
                this.gameManager.addExperience(orb.expValue);
            }
            
            const expText = this.add.text(orb.x, orb.y - 20, `+${orb.expValue} XP`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#88ff88',
                stroke: '#000000',
                strokeThickness: 1
            });
            expText.setOrigin(0.5);
            
            this.tweens.add({
                targets: expText,
                y: expText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => expText.destroy()
            });
            
            orb.destroy();
        } catch (error) {
            console.error("Error collecting experience orb:", error);
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
                onComplete: () => {
                    flash.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating teleport effect:", error);
        }
    }
    
    trackEnemyKill(enemy) {
        if (this.gameManager) {
            this.gameManager.addEnemyKill();
            
            const expReward = enemy.expValue || 10;
            const goldReward = enemy.goldValue || 5;
            
            this.gameManager.addExperience(expReward);
            this.gameManager.addGold(goldReward);
            
            if (this.player && this.player.damage) {
                this.gameManager.addDamageDealt(this.player.damage);
            }
            
            console.log(`Enemy killed: +${expReward} XP, +${goldReward} gold`);
        }
        
        this.enemiesKilled++;
        this.removeZombie(enemy);
    }
    
    showRewardEffect(x, y, exp, gold) {
        try {
            const expText = this.add.text(x - 20, y - 40, `+${exp} XP`, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#88ff88',
                stroke: '#000000',
                strokeThickness: 2
            });
            expText.setOrigin(0.5);
            
            const goldText = this.add.text(x + 20, y - 40, `+${gold} G`, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            });
            goldText.setOrigin(0.5);
            
            [expText, goldText].forEach(text => {
                this.tweens.add({
                    targets: text,
                    y: text.y - 50,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => text.destroy()
                });
            });
        } catch (error) {
            console.error("Error creating reward effect:", error);
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
            
            // Z key to spawn zombie (debug) - this one works correctly
            this.input.keyboard.on('keydown-Z', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Spawning zombie manually");
                    
                    // Use the SAME method as natural spawning to test
                    this.spawnRandomEnemy();
                }
            });
            
            // X key to spawn XP orb (debug)
            this.input.keyboard.on('keydown-X', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Spawning XP orb");
                    this.spawnExperienceOrb(this.player.x + 50, this.player.y, 25);
                }
            });
            
            // C key to auto-register collisions (debug)
            this.input.keyboard.on('keydown-C', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Auto-registering collisions");
                    this.autoRegisterCollisions();
                    this.setupZombieObstacleCollisions();
                }
            });
            
            // T key to test teleportation
            this.input.keyboard.on('keydown-T', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    const destScene = this.scene.key === "FirstArea" ? "MainMapScene" : "FirstArea";
                    this.handleTeleport(this.player, null, destScene);
                }
            });
            
            // H key to heal player
            this.input.keyboard.on('keydown-H', () => {
                if (this.player && this.player.heal && this.gameManager && this.gameManager.debugMode) {
                    this.player.heal(50);
                    console.log("Debug: Player healed");
                }
            });
            
            // D key to damage player
            this.input.keyboard.on('keydown-D', () => {
                if (this.player && this.player.takeDamage && this.gameManager && this.gameManager.debugMode) {
                    this.player.takeDamage(20, "Debug Damage");
                    console.log("Debug: Player damaged");
                }
            });
            
            // K key to kill player (debug death)
            this.input.keyboard.on('keydown-K', () => {
                if (this.player && this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Triggering player death");
                    this.player.takeDamage(999, "Debug Kill");
                }
            });
            
            // L key to add a level (for testing power-ups)
            this.input.keyboard.on('keydown-L', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    // Add enough XP to level up immediately
                    const neededExp = this.gameManager.playerStats.nextLevelExp - this.gameManager.playerStats.experience;
                    this.gameManager.addExperience(neededExp);
                    console.log("Debug: Added level");
                }
            });
            
            // P key to show power-up selection (for testing)
            this.input.keyboard.on('keydown-P', () => {
                if (this.powerUpManager && this.gameManager && this.gameManager.debugMode) {
                    this.powerUpManager.showPowerUpSelection();
                    console.log("Debug: Showing power-up selection");
                }
            });
            
            // G key to add gold (for testing)
            this.input.keyboard.on('keydown-G', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    this.gameManager.addGold(100);
                    console.log(`Debug: Added 100 gold, total: ${this.gameManager.gold}`);
                }
            });
            
            // U key to test upgrade application (debug)
            this.input.keyboard.on('keydown-U', () => {
                if (this.gameManager && this.gameManager.debugMode && this.player) {
                    console.log("Debug: Reapplying upgrades to player");
                    console.log("Current upgrades:", this.gameManager.passiveUpgrades);
                    this.gameManager.applyPlayerStats(this.player);
                    console.log("Player stats after reapply:", {
                        health: this.player.health,
                        maxHealth: this.player.maxHealth,
                        damage: this.player.damage,
                        moveSpeed: this.player.moveSpeed
                    });
                }
            });
            
            // R key to restart scene (for testing fresh starts)
            this.input.keyboard.on('keydown-R', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Restarting scene for fresh start test");
                    this.scene.restart();
                }
            });
            
            // ESC key to return to menu
            this.input.keyboard.on('keydown-ESC', () => {
                console.log("ESC pressed - returning to menu and resetting for next run");
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
            const text = [
                `=== DEBUG INFO ===`,
                `Survival Time: ${this.gameManager.formatTime(currentTime)}`,
                `Level: ${this.gameManager.playerStats.level}`,
                `XP: ${this.gameManager.playerStats.experience}/${this.gameManager.playerStats.nextLevelExp}`,
                `Gold: ${this.gameManager.gold}`,
                ``,
                `Player Stats:`,
                `Health: ${this.player.health?.toFixed(1)}/${this.player.maxHealth?.toFixed(1)}`,
                `Damage: ${this.player.damage?.toFixed(1)}`,
                `Speed: ${this.player.moveSpeed?.toFixed(1)}`,
                `Armor: ${this.player.armor?.toFixed(0)}`,
                `Crit: ${((this.player.critChance || 0) * 100).toFixed(1)}%`,
                ``,
                `Run Stats:`,
                `Enemies: ${this.gameManager.currentRunStats.enemiesKilled}`,
                `Damage Dealt: ${this.gameManager.formatNumber(this.gameManager.currentRunStats.damageDealt)}`,
                `Damage Taken: ${this.gameManager.formatNumber(this.gameManager.currentRunStats.damageTaken)}`,
                ``,
                `Collision System:`,
                `Zombies: ${this.zombieGroup ? this.zombieGroup.children.size : 0}`,
                `Obstacles: ${this.staticObstacles ? this.staticObstacles.children.size : 0}`,
                `Layers: ${this.collisionLayers.length}`,
                ``,
                `Difficulty:`,
                `Current Level: ${this.gameManager.gameProgress.currentDifficulty}`,
                `Spawn Delay: ${this.enemySpawnTimer ? this.enemySpawnTimer.delay : 'N/A'}ms`,
                ``,
                `Controls:`,
                `Z - Spawn Zombie | X - Spawn XP`,
                `C - Auto-Register Collisions`,
                `H - Heal | D - Damage | K - Kill`,
                `L - Level Up | G - Add Gold`,
                `U - Reapply Upgrades | R - Restart`
            ].join('\n');
            
            this.upgradeDebugText.setText(text);
        } catch (error) {
            console.error("Error updating debug display:", error);
        }
    }
    
    shutdown() {
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
            this.enemySpawnTimer = null;
        }
        
        if (this.orbSpawnTimer) {
            this.orbSpawnTimer.destroy();
            this.orbSpawnTimer = null;
        }
        
        if (this.difficultyTimer) {
            this.difficultyTimer.destroy();
            this.difficultyTimer = null;
        }
        
        if (this.enemies) {
            this.enemies.clear(true, true);
        }
        
        if (this.experienceOrbs) {
            this.experienceOrbs.clear(true, true);
        }
        
        if (this.zombieGroup) {
            this.zombieGroup.clear(true, true);
            this.zombieGroup = null;
        }
        
        if (this.staticObstacles) {
            this.staticObstacles.clear(true, true);
            this.staticObstacles = null;
        }
        
        this.collisionLayers = [];
        
        if (this.gameplayManager) {
            this.gameplayManager.shutdown();
        }
        
        if (this.uiManager) {
            this.uiManager.shutdown();
        }
        
        if (this.powerUpManager) {
            this.powerUpManager.shutdown();
        }
        
        this.input.keyboard.removeAllListeners();
        
        if (this.gameManager) {
            this.gameManager.saveGame();
        }
        
        if (this.upgradeDebugText) {
            this.upgradeDebugText.destroy();
            this.upgradeDebugText = null;
        }
        
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
    }
}