import GameManager from "../managers/GameManager";
import UIManager from "../managers/UIManager";
import GameplayManager from "../managers/GameplayManager";
import PowerUpManager from "../managers/PowerUpManager";
import PlayerAttack from "../prefabs/PlayerAttack";

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
        this.waveTimer = null;
        this.difficultyTimer = null;
        
        // Wave system
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        
        // Stats tracking
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
        
        this.enemies = this.physics.add.group();
        this.experienceOrbs = this.physics.add.group();
        
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
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveEnemiesRemaining = 0;
        
        if (this.waveTimer) {
            this.waveTimer.destroy();
            this.waveTimer = null;
        }
        
        this.waveTimer = this.time.addEvent({
            delay: 20000,
            callback: this.spawnWave,
            callbackScope: this,
            loop: true
        });
        
        console.log("Wave system started fresh - will begin from wave 1 in 60 seconds");
    }
    
    spawnWave() {
        if (!this.player || this.player.isDead || !this.gameplayManager) return;
        
        this.currentWave++;
        
        const swarmSize = Math.min(30 + (this.currentWave * 10), 80);
        
        this.waveEnemiesRemaining = swarmSize;
        this.isWaveActive = true;
        
        this.showSwarmAnnouncement(this.currentWave, swarmSize);
        
        for (let i = 0; i < swarmSize; i++) {
            this.time.delayedCall(i * 100, () => {
                this.spawnSwarmEnemy(i);
            });
        }
        
        if (this.gameManager) {
            this.gameManager.currentWave = this.currentWave;
        }
        
        console.log(`SWARM Wave ${this.currentWave}: ${swarmSize} enemies spawning!`);
    }
    
    spawnSwarmEnemy(index) {
        if (!this.player || !this.gameplayManager) return;
        
        const minDistance = 300;
        const maxDistance = 400;
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = Phaser.Math.FloatBetween(minDistance, maxDistance);
        
        const spawnX = this.player.x + Math.cos(angle) * distance;
        const spawnY = this.player.y + Math.sin(angle) * distance;
        
        let enemyType = 'zombie';
        const rand = Math.random();
        if (rand < 0.15) {
            enemyType = 'zombieBig';
        } else if (rand < 0.40) {
            enemyType = 'policeDroid';
        }
        
        const enemy = this.gameplayManager.spawnEnemy(spawnX, spawnY, enemyType);
        
        if (enemy) {
            enemy.isSwarmEnemy = true;
            enemy.waveNumber = this.currentWave;
            enemy.zombieType = enemyType;
            
            if (enemyType === 'zombieBig') {
                enemy.setTint(0xff4444);
            } else if (enemyType === 'policeDroid') {
                enemy.setTint(0x44ff44);
            }
            
            this.addZombie(enemy);
            
            const portal = this.add.circle(spawnX, spawnY, 20, 0x8800ff, 0.8);
            this.tweens.add({
                targets: portal,
                scale: { from: 0, to: 2 },
                alpha: { from: 0.8, to: 0 },
                duration: 500,
                onComplete: () => portal.destroy()
            });
            
        }
    }
    
    showSwarmAnnouncement(waveNumber, enemyCount) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        const announcement = this.add.text(centerX, centerY - 60, `SWARM INCOMING!`, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        announcement.setOrigin(0.5);
        announcement.setScrollFactor(0);
        announcement.setDepth(1000);
        
        const waveText = this.add.text(centerX, centerY - 10, `WAVE ${waveNumber} - ${enemyCount} ENEMIES`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 2
        });
        waveText.setOrigin(0.5);
        waveText.setScrollFactor(0);
        waveText.setDepth(1000);
        
        this.tweens.add({
            targets: [announcement, waveText],
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2500, () => {
                    this.tweens.add({
                        targets: [announcement, waveText],
                        alpha: 0,
                        duration: 800,
                        onComplete: () => {
                            announcement.destroy();
                            waveText.destroy();
                        }
                    });
                });
            }
        });
        
        const flash = this.add.rectangle(0, 0, this.cameras.main.width * 2, this.cameras.main.height * 2, 0xff0000, 0.3);
        flash.setScrollFactor(0);
        flash.setDepth(999);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });
    }
    
    trackEnemyKill(enemy) {
        if (this.gameManager) {
            this.gameManager.addEnemyKill();
            
            let expReward = enemy.expValue || 10;
            let goldReward = enemy.goldValue || 5;
            
            if (enemy.isSwarmEnemy) {
                expReward = Math.floor(expReward * 1.5);
                goldReward = Math.floor(goldReward * 1.5);
                
                if (enemy.zombieType === 'zombieBig') {
                    expReward *= 2;
                    goldReward *= 2;
                } else if (enemy.zombieType === 'policeDroid') {
                    expReward = Math.floor(expReward * 1.5);
                    goldReward = Math.floor(goldReward * 1.5);
                }
                
                this.waveEnemiesRemaining--;
                if (this.waveEnemiesRemaining <= 0 && this.isWaveActive) {
                    this.completeSwarm();
                }
            }
            
            this.gameManager.addExperience(expReward);
            this.gameManager.addGold(goldReward);
            
            if (this.player && this.player.damage) {
                this.gameManager.addDamageDealt(this.player.damage);
            }
            
            if (this.gameplayManager) {
                this.gameplayManager.spawnExperienceOrb(enemy.x, enemy.y, expReward);
            }
            
            console.log(`${enemy.zombieType || 'normal'} killed: +${expReward} XP, +${goldReward} gold${enemy.isSwarmEnemy ? ' (SWARM!)' : ''}`);
        }
        
        this.enemiesKilled++;
        this.removeZombie(enemy);
    }
    
    completeSwarm() {
        this.isWaveActive = false;
        
        const bonus = {
            exp: this.currentWave * 150,
            gold: this.currentWave * 75
        };
        
        if (this.gameManager) {
            this.gameManager.addExperience(bonus.exp);
            this.gameManager.addGold(bonus.gold);
        }
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        const message = this.add.text(centerX, centerY - 30, `SWARM SURVIVED!`, {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        });
        message.setOrigin(0.5);
        message.setScrollFactor(0);
        message.setDepth(1000);
        
        const bonusText = this.add.text(centerX, centerY + 20, `BONUS: +${bonus.exp} XP, +${bonus.gold} Gold`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        bonusText.setOrigin(0.5);
        bonusText.setScrollFactor(0);
        bonusText.setDepth(1000);
        
        this.tweens.add({
            targets: [message, bonusText],
            scale: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(3000, () => {
                    this.tweens.add({
                        targets: [message, bonusText],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            message.destroy();
                            bonusText.destroy();
                        }
                    });
                });
            }
        });

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
            
            this.input.keyboard.on('keydown-W', () => {
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
            
            this.input.keyboard.on('keydown-T', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    const destScene = this.scene.key === "FirstArea" ? "MainMapScene" : "FirstArea";
                    this.handleTeleport(this.player, null, destScene);
                }
            });
            
            this.input.keyboard.on('keydown-H', () => {
                if (this.player && this.player.heal && this.gameManager && this.gameManager.debugMode) {
                    this.player.heal(50);
                    console.log("Debug: Player healed");
                }
            });
            
            this.input.keyboard.on('keydown-L', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    const neededExp = this.gameManager.playerStats.nextLevelExp - this.gameManager.playerStats.experience;
                    this.gameManager.addExperience(neededExp);
                    console.log("Debug: Added level");
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
            const text = [
                `=== DEBUG INFO ===`,
                `Survival Time: ${this.gameManager.formatTime(currentTime)}`,
                `Level: ${this.gameManager.playerStats.level}`,
                `XP: ${this.gameManager.playerStats.experience}/${this.gameManager.playerStats.nextLevelExp}`,
                `Gold: ${this.gameManager.gold}`,
                ``,
                `WAVE SYSTEM:`,
                `Current Wave: ${this.currentWave}`,
                `Wave Active: ${this.isWaveActive}`,
                `Enemies Left: ${this.waveEnemiesRemaining}`,
                `Next Wave: ${this.waveTimer ? Math.ceil(this.waveTimer.getRemaining() / 1000) : 'N/A'}s`,
                ``,
                `Player Stats:`,
                `Health: ${this.player.health?.toFixed(1)}/${this.player.maxHealth?.toFixed(1)}`,
                `Damage: ${this.player.damage?.toFixed(1)}`,
                `Speed: ${this.player.moveSpeed?.toFixed(1)}`,
                ``,
                `Enemies Killed: ${this.enemiesKilled}`,
                `GameplayManager Enemies: ${this.gameplayManager?.enemies?.getChildren()?.length || 0}`,
                ``,
                `Controls:`,
                `W - Trigger Wave | C - Auto-Collisions`,
                `H - Heal | L - Level Up | T - Teleport`
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
        
        if (this.waveTimer) {
            this.waveTimer.destroy();
            this.waveTimer = null;
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
        
    }
}