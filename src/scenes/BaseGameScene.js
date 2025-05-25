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
        
        // Timers
        this.enemySpawnTimer = null;
        this.orbSpawnTimer = null;
        this.difficultyTimer = null;
        
        // Stats tracking
        this.enemiesKilled = 0;
        this.gameStartTime = 0;
    }
    
    create() {
        console.log(`Creating BaseGameScene: ${this.scene.key} - FRESH START`);
        
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
        
        if (this.gameManager) {
            this.gameManager.startNewRun();
            console.log("Started fresh new run - all temporary progress reset");
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
            } else {
                console.warn("Player not available when initializing managers");
            }
            
            console.log("Game managers initialized");
        } catch (error) {
            console.error("Error initializing managers:", error);
        }
    }
    
    initializePlayer() {
        if (!this.player) {
            console.warn("No player to initialize");
            return;
        }
        
        console.log("Initializing player with GameManager upgrades");
        
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
        console.log("Starting enemy spawning with fresh difficulty");
        
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
            
            const zombie = new Zombie(this, spawnX, spawnY);
            this.enemies.add(zombie);
        } catch (error) {
            console.error("Error spawning enemy:", error);
        }
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
            
            // Z key to spawn zombie (debug)
            this.input.keyboard.on('keydown-Z', () => {
                if (this.gameManager && this.gameManager.debugMode) {
                    console.log("Debug: Spawning zombie");
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
                    // Ensure clean shutdown before returning to menu
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
                `Difficulty:`,
                `Current Level: ${this.gameManager.gameProgress.currentDifficulty}`,
                `Spawn Delay: ${this.enemySpawnTimer ? this.enemySpawnTimer.delay : 'N/A'}ms`,
                ``,
                `Controls:`,
                `Z - Spawn Zombie | X - Spawn XP`,
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
        console.log(`Shutting down ${this.scene.key} - preparing for fresh restart`);
        
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