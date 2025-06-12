import GameManager from "./GameManager";
import HealthBar from "../prefabs/HealthBar";
import PlayerLevel from "../prefabs/PlayerLevel";

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        
        // UI Components
        this.healthBar = null;
        this.playerLevel = null;
        this.timer = {
            text: null,
            background: null,
            label: null,
            elapsed: 0
        };
        
        // Attack Cooldown UI
        this.attackCooldowns = {
            container: null,
            slash: { icon: null, cooldownBar: null, background: null },
            fire: { icon: null, cooldownBar: null, background: null },
            ice: { icon: null, cooldownBar: null, background: null }
        };
        
        // Container for UI elements
        this.uiContainer = null;
        this.isInitialized = false;
    }
    
    initialize() {
        console.log("Initializing UIManager");
        
        try {
            this.createContainer();
            this.createHealthBar();
            this.createLevelSystem();
            this.createTimer();
            this.createAttackCooldownUI();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log("UIManager initialized successfully");
        } catch (error) {
            console.error("Error initializing UIManager:", error);
        }
    }
    
    createContainer() {
        if (!this.uiContainer || !this.uiContainer.active) {
            this.uiContainer = this.scene.add.container(0, 0);
            this.uiContainer.setScrollFactor(0).setDepth(1000);
        }
    }
    
    createHealthBar() {
        if (!this.healthBar || !this.healthBar.active) {
            this.healthBar = new HealthBar(this.scene, 320, 230, 200, 20);
            this.scene.healthBar = this.healthBar;
            console.log("Health bar created");
        }
    }
    
    createLevelSystem() {
        if (!this.playerLevel || !this.playerLevel.active) {
            this.playerLevel = new PlayerLevel(this.scene, 320, 180);
            this.scene.add.existing(this.playerLevel);
            this.playerLevel.createProgressBar(0, 0, 204, 20);
            
            this.playerLevel.onLevelUp((newLevel) => {
                this.handleLevelUp(newLevel);
            });
            
            this.scene.playerLevelSystem = this.playerLevel;
            this.syncWithGameManager();
            console.log("Level system created");
        }
    }
    
    createTimer() {
        const config = { x: 890, y: 210, width: 120, height: 40 };
        
        // Background
        this.timer.background = this.scene.add.rectangle(
            config.x, config.y, config.width, config.height, 0x000000, 0.7
        ).setStrokeStyle(2, 0xffffff).setScrollFactor(0).setDepth(900);
        
        // Label
        this.timer.label = this.scene.add.text(config.x, config.y - 20, "TIME", {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(901);
        
        // Timer text
        this.timer.text = this.scene.add.text(config.x, config.y, "00:00", {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(901);
        
        this.uiContainer.add([this.timer.background, this.timer.label, this.timer.text]);
        
        this.timer.elapsed = 0;
        console.log("Timer created");
    }
    
    createAttackCooldownUI() {
        this.attackCooldowns.container = this.scene.add.container(80, this.scene.cameras.main.height - 80);
        this.attackCooldowns.container.setScrollFactor(0).setDepth(950);
        
        const attacks = [
            { key: 'slash', color: 0x00ff00, x: 270, label: 'SLASH' },
            { key: 'fire', color: 0xff4400, x: 300, label: 'FIRE' },
            { key: 'ice', color: 0x00aaff, x: 330, label: 'ICE' }
        ];
        
        attacks.forEach(attack => {
            this.attackCooldowns[attack.key].background = this.scene.add.circle(
                attack.x, -120, 10, 0x000000, 0.8
            );
            this.attackCooldowns[attack.key].background.setStrokeStyle(2, attack.color, 1);
            
            this.attackCooldowns[attack.key].icon = this.scene.add.circle(
                attack.x, -120, 10, attack.color, 0.7
            );
            
            this.attackCooldowns[attack.key].cooldownBar = this.scene.add.graphics();
            
            const label = this.scene.add.text(attack.x, 35, attack.label, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5);
            
            this.attackCooldowns.container.add([
                this.attackCooldowns[attack.key].background,
                this.attackCooldowns[attack.key].icon,
                this.attackCooldowns[attack.key].cooldownBar,
                label
            ]);
        });
        
        console.log("Attack cooldown UI created");
    }
    
    updateAttackCooldowns() {
        if (!this.scene.playerAttackSystem || !this.attackCooldowns.container) return;
        
        const attackSystem = this.scene.playerAttackSystem;
        const currentTime = this.scene.time.now;
        
        const attacks = [
            {
                key: 'slash',
                lastTime: attackSystem.lastSlashTime,
                cooldown: attackSystem.slashCooldown,
                color: 0x00ff00,
                x: 270
            },
            {
                key: 'fire',
                lastTime: attackSystem.lastFireTime,
                cooldown: attackSystem.fireCooldown,
                color: 0xff4400,
                x: 300
            },
            {
                key: 'ice',
                lastTime: attackSystem.lastIceTime,
                cooldown: attackSystem.iceCooldown,
                color: 0x00aaff,
                x: 330
            }
        ];
        
        attacks.forEach(attack => {
            const timeSinceLastAttack = currentTime - attack.lastTime;
            const cooldownProgress = Math.min(timeSinceLastAttack / attack.cooldown, 1);
            
            this.attackCooldowns[attack.key].cooldownBar.clear();
            
            if (cooldownProgress < 1) {
                const fillAngle = cooldownProgress * Math.PI * 2;
                
                this.attackCooldowns[attack.key].cooldownBar.fillStyle(0x000000, 0.6);
                this.attackCooldowns[attack.key].cooldownBar.fillCircle(attack.x, -120, 11);
                this.attackCooldowns[attack.key].cooldownBar.fillStyle(attack.color, 0.8);
                this.attackCooldowns[attack.key].cooldownBar.beginPath();
                this.attackCooldowns[attack.key].cooldownBar.moveTo(attack.x, -120);
                this.attackCooldowns[attack.key].cooldownBar.arc(attack.x, -120, 11, -Math.PI / 2, -Math.PI / 2 + fillAngle, false);
                this.attackCooldowns[attack.key].cooldownBar.closePath();
                this.attackCooldowns[attack.key].cooldownBar.fillPath();
                
                this.attackCooldowns[attack.key].icon.setAlpha(0.3);
            } else {
                this.attackCooldowns[attack.key].icon.setAlpha(1);
            }
        });
    }
    
    setupEventListeners() {
        if (!this.gameManager?.events) return;
        
        this.gameManager.events.off('experienceUpdated');
        this.gameManager.events.off('levelUp');
        
        this.gameManager.events.on('experienceUpdated', () => {
            this.syncWithGameManager();
        });
        
        this.gameManager.events.on('levelUp', (newLevel) => {
            this.handleLevelUp(newLevel);
        });
    }
    
    handleLevelUp(newLevel) {
        console.log(`Level up: ${newLevel}`);
        
        if (this.gameManager) {
            this.gameManager.playerStats.level = newLevel;
        }
        
        if (this.playerLevel) {
            this.playerLevel.level = newLevel;
            this.playerLevel.updateText?.();
        }
        
        if (this.scene.powerUpManager) {
            this.scene.powerUpManager.showPowerUpSelection();
        }
    }
    
    syncWithGameManager() {
        if (!this.gameManager || !this.playerLevel) return;
        
        try {
            const { level, experience, nextLevelExp } = this.gameManager.playerStats;
            
            Object.assign(this.playerLevel, { level, experience, nextLevelExp });
            
            this.playerLevel.updateText?.();
            this.playerLevel.updateProgressBar?.();
            
        } catch (error) {
            console.error("Error syncing with GameManager:", error);
        }
    }
    
    updateTimer(delta) {
        if (!this.timer.text?.active) return;
        
        this.timer.elapsed += delta / 1000;
        
        if (this.gameManager?.gameProgress) {
            this.gameManager.gameProgress.gameTime = this.timer.elapsed;
        }
        
        const minutes = Math.floor(this.timer.elapsed / 60);
        const seconds = Math.floor(this.timer.elapsed % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timer.text.setText(timeString);
        
        if (Math.floor(this.timer.elapsed) % 60 === 0 && delta > 0 && minutes > 0) {
            this.pulseTimer();
        }
    }
    
    pulseTimer() {
        this.scene.tweens.add({
            targets: this.timer.text,
            scale: 1.3,
            duration: 200,
            yoyo: true,
            repeat: 1,
            ease: 'Power2'
        });
    }
    
    updateHealthBar() {
        if (this.healthBar && this.scene.player) {
            const { health, maxHealth } = this.scene.player;
            this.healthBar.updateHealth(health, maxHealth);
        }
    }
    
    showDamageEffect() {
        this.healthBar?.showDamageFlash?.();
    }
    
    showHealEffect() {
        this.healthBar?.showHealEffect?.();
    }
    
    addExperience(amount) {
        if (this.gameManager) {
            this.gameManager.addExperience(amount);
        }
    }
    
    showMessage(text, duration = 2000) {
        try {
            const cam = this.scene.cameras.main;
            const centerX = cam.worldView.x + cam.width / 2;
            const centerY = cam.worldView.y + cam.height / 2;
            
            const message = this.scene.add.text(centerX, centerY, text, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
            
            this.scene.tweens.add({
                targets: message,
                y: centerY - 50,
                alpha: 0,
                duration: duration,
                ease: 'Power2',
                onComplete: () => message.destroy()
            });
            
        } catch (error) {
            console.error("Error showing message:", error);
        }
    }
    
    reset() {
        console.log("Resetting UI");
        this.timer.elapsed = 0;
        this.syncWithGameManager();
    }
    
    update(time, delta) {
        if (!this.isInitialized) return;
        
        try {
            this.updateHealthBar();
            this.updateTimer(delta);
            this.updateAttackCooldowns();
            
            if (this.playerLevel && !this.playerLevel.active) {
                this.createLevelSystem();
            }
        } catch (error) {
            console.error("Error in UI update:", error);
        }
    }
    
    shutdown() {
        console.log("Shutting down UIManager");
        
        if (this.gameManager?.events) {
            this.gameManager.events.off('experienceUpdated');
            this.gameManager.events.off('levelUp');
        }
        
        [
            this.timer.background,
            this.timer.label, 
            this.timer.text,
            this.attackCooldowns.container,
            this.uiContainer
        ].forEach(component => {
            if (component?.destroy) {
                component.destroy();
            }
        });
        
        this.isInitialized = false;
        this.timer = { text: null, background: null, label: null, elapsed: 0 };
        this.attackCooldowns = {
            container: null,
            slash: { icon: null, cooldownBar: null, background: null },
            fire: { icon: null, cooldownBar: null, background: null },
            ice: { icon: null, cooldownBar: null, background: null }
        };
    }
}