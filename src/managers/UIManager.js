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
            
            // Set up level up callback
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
        
        // Add to container
        this.uiContainer.add([this.timer.background, this.timer.label, this.timer.text]);
        
        this.timer.elapsed = 0;
        console.log("Timer created");
    }
    
    setupEventListeners() {
        if (!this.gameManager?.events) return;
        
        // Clean up existing listeners
        this.gameManager.events.off('experienceUpdated');
        this.gameManager.events.off('levelUp');
        
        // Set up new listeners
        this.gameManager.events.on('experienceUpdated', () => {
            this.syncWithGameManager();
        });
        
        this.gameManager.events.on('levelUp', (newLevel) => {
            this.handleLevelUp(newLevel);
        });
    }
    
    handleLevelUp(newLevel) {
        console.log(`Level up: ${newLevel}`);
        
        // Update GameManager
        if (this.gameManager) {
            this.gameManager.playerStats.level = newLevel;
        }
        
        // Update level display
        if (this.playerLevel) {
            this.playerLevel.level = newLevel;
            this.playerLevel.updateText?.();
        }
        
        // Show power-up selection
        if (this.scene.powerUpManager) {
            this.scene.powerUpManager.showPowerUpSelection();
        }
    }
    
    syncWithGameManager() {
        if (!this.gameManager || !this.playerLevel) return;
        
        try {
            const { level, experience, nextLevelExp } = this.gameManager.playerStats;
            
            // Update level system
            Object.assign(this.playerLevel, { level, experience, nextLevelExp });
            
            // Update displays
            this.playerLevel.updateText?.();
            this.playerLevel.updateProgressBar?.();
            
        } catch (error) {
            console.error("Error syncing with GameManager:", error);
        }
    }
    
    updateTimer(delta) {
        if (!this.timer.text?.active) return;
        
        this.timer.elapsed += delta / 1000;
        
        // Update GameManager if available
        if (this.gameManager?.gameProgress) {
            this.gameManager.gameProgress.gameTime = this.timer.elapsed;
        }
        
        // Format and display time
        const minutes = Math.floor(this.timer.elapsed / 60);
        const seconds = Math.floor(this.timer.elapsed % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timer.text.setText(timeString);
        
        // Pulse effect every minute
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
    
    // Simplified effect methods
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
                strokeThickness: 4
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
            
            // Reinitialize if components became inactive
            if (this.playerLevel && !this.playerLevel.active) {
                this.createLevelSystem();
            }
        } catch (error) {
            console.error("Error in UI update:", error);
        }
    }
    
    shutdown() {
        console.log("Shutting down UIManager");
        
        // Remove event listeners
        if (this.gameManager?.events) {
            this.gameManager.events.off('experienceUpdated');
            this.gameManager.events.off('levelUp');
        }
        
        // Clean up components
        [
            this.timer.background,
            this.timer.label, 
            this.timer.text,
            this.uiContainer
        ].forEach(component => {
            if (component?.destroy) {
                component.destroy();
            }
        });
        
        // Reset state
        this.isInitialized = false;
        this.timer = { text: null, background: null, label: null, elapsed: 0 };
    }
}