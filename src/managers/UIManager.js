// UIManager.js - Complete version with persistent UI and health bar

import GameManager from "./GameManager";
import HealthBar from "../prefabs/HealthBar";
import PlayerLevel from "../prefabs/PlayerLevel";

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        
        this.healthBar = null;
        this.playerLevel = null;
        this.timerText = null;
        this.timerBg = null;
        this.timerLabel = null;
        this.gameTime = 0;
        this.uiContainer = null;
        this.isInitialized = false;
    }
    
    initialize() {
        try {
            console.log("Initializing UIManager...");
            
            if (!this.uiContainer || !this.uiContainer.active) {
                this.uiContainer = this.scene.add.container(0, 0);
                this.uiContainer.setScrollFactor(0);
                this.uiContainer.setDepth(1000);
            }
            
            if (!this.scene.healthBar || !this.scene.healthBar.active) {
                console.log("Creating new HealthBar...");
                this.healthBar = new HealthBar(this.scene, 320, 230, 200, 20);
                this.scene.healthBar = this.healthBar;
            } else {
                console.log("Using existing HealthBar...");
                this.healthBar = this.scene.healthBar;
            }
            
            if (!this.scene.playerLevelSystem || !this.scene.playerLevelSystem.active) {
                this.playerLevel = new PlayerLevel(this.scene, 320, 180);
                this.scene.add.existing(this.playerLevel);
                this.playerLevel.createProgressBar(0, 0, 204, 20);
                
                this.playerLevel.onLevelUp((newLevel) => {
                    
                    if (this.gameManager) {
                        this.gameManager.playerStats.level = newLevel;
                    }
                    
                    if (this.scene.powerUpManager) {
                        this.scene.powerUpManager.showPowerUpSelection();
                    } else if (this.scene.showLevelUpOptions) {
                        this.scene.showLevelUpOptions();
                    }
                });
                
                this.scene.playerLevelSystem = this.playerLevel;
            } else {
                this.playerLevel = this.scene.playerLevelSystem;
                if (this.playerLevel.updateText) {
                    this.playerLevel.updateText();
                }
            }
            
            this.createGameTimer();
            
            if (this.gameManager && this.gameManager.events) {
                this.gameManager.events.off('experienceUpdated');
                this.gameManager.events.off('levelUp');
                
                this.gameManager.events.on('experienceUpdated', (exp, nextLevel) => {
                    if (this.playerLevel && this.playerLevel.active) {
                        this.syncExperienceFromGameManager();
                    }
                });
                
                this.gameManager.events.on('levelUp', (newLevel) => {
                    if (this.playerLevel && this.playerLevel.active) {
                        this.playerLevel.level = newLevel;
                        if (this.playerLevel.updateText) {
                            this.playerLevel.updateText();
                        }
                    }
                });
            }
            
            this.syncExperienceFromGameManager();
            
            this.isInitialized = true;
            console.log("UI elements created and synced");
        } catch (error) {
            console.error("Error setting up UI:", error);
        }
    }
    
    syncExperienceFromGameManager() {
        if (!this.gameManager || !this.playerLevel) return;
        
        try {
            const { level, experience, nextLevelExp } = this.gameManager.playerStats;
            
            this.playerLevel.level = level;
            this.playerLevel.experience = experience;
            this.playerLevel.nextLevelExp = nextLevelExp;
            
            if (this.playerLevel.updateText) {
                this.playerLevel.updateText();
            }
            if (this.playerLevel.updateProgressBar) {
                this.playerLevel.updateProgressBar();
            }
            
            console.log(`Synced UI - Level: ${level}, Exp: ${experience}/${nextLevelExp}`);
        } catch (error) {
            console.error("Error syncing experience from GameManager:", error);
        }
    }
    
    createGameTimer() {
        try {
            if (this.timerText) {
                this.timerText.destroy();
            }
            if (this.timerBg) {
                this.timerBg.destroy();
            }
            if (this.timerLabel) {
                this.timerLabel.destroy();
            }
            
            const timerX = 890;
            const timerY = 210;
            
            this.timerBg = this.scene.add.rectangle(
                timerX,
                timerY,
                120,
                40,
                0x000000,
                0.7
            );
            this.timerBg.setStrokeStyle(2, 0xffffff);
            this.timerBg.setScrollFactor(0);
            this.timerBg.setDepth(900);
            
            this.timerLabel = this.scene.add.text(
                timerX,
                timerY - 20,
                "TIME",
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            this.timerLabel.setOrigin(0.5);
            this.timerLabel.setScrollFactor(0);
            this.timerLabel.setDepth(901);
            
            this.timerText = this.scene.add.text(
                timerX,
                timerY,
                "00:00",
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 3,
                    fontStyle: 'bold'
                }
            );
            this.timerText.setOrigin(0.5);
            this.timerText.setScrollFactor(0);
            this.timerText.setDepth(901);
            
            if (this.uiContainer) {
                this.uiContainer.add([this.timerBg, this.timerLabel, this.timerText]);
            }
            
            this.gameTime = 0;
            this.updateTimer(0);
            
            console.log("Game timer created successfully");
        } catch (error) {
            console.error("Error creating timer display:", error);
        }
    }
    
    updateTimer(delta) {
        if (!this.timerText || !this.timerText.active) return;
        
        try {
            const deltaSeconds = delta / 1000;
            this.gameTime += deltaSeconds;
            
            if (this.gameManager && this.gameManager.gameProgress) {
                this.gameManager.gameProgress.gameTime = this.gameTime;
            }
            
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = Math.floor(this.gameTime % 60);
            
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            this.timerText.setText(formattedTime);
            
            if (Math.floor(this.gameTime) % 60 === 0 && deltaSeconds > 0 && minutes > 0) {
                this.scene.tweens.add({
                    targets: this.timerText,
                    scale: 1.3,
                    duration: 200,
                    yoyo: true,
                    ease: 'Power2',
                    repeat: 1
                });
            }
        } catch (error) {
            console.error("Error updating timer:", error);
        }
    }
    
    handleExperienceCollection(amount) {
        if (this.playerLevel && this.playerLevel.active) {
            if (this.gameManager) {
                this.gameManager.addExperience(amount);
            }
            
            if (this.playerLevel.addExperience) {
                this.playerLevel.addExperience(amount);
            }
        }
    }
    
    updateHealthBar() {
        if (this.healthBar && this.scene.player) {
            const { health, maxHealth } = this.scene.player;
            this.healthBar.updateHealth(health, maxHealth);
        }
    }
    
    showDamageEffect() {
        if (this.healthBar && typeof this.healthBar.showDamageFlash === 'function') {
            this.healthBar.showDamageFlash();
        }
    }
    
    showHealEffect() {
        if (this.healthBar && typeof this.healthBar.showHealEffect === 'function') {
            this.healthBar.showHealEffect();
        }
    }
    
    updateExperienceBar() {
        if (this.playerLevel) {
            const { level, experience, nextLevelExp } = this.gameManager.playerStats;
            
            if (typeof this.playerLevel.setLevel === 'function') {
                this.playerLevel.setLevel(level);
            }
            
            if (typeof this.playerLevel.setExperience === 'function') {
                this.playerLevel.setExperience(experience, nextLevelExp);
            } else if (typeof this.playerLevel.updateText === 'function') {
                this.playerLevel.level = level;
                this.playerLevel.experience = experience;
                this.playerLevel.nextLevelExp = nextLevelExp;
                this.playerLevel.updateText();
            }
        }
    }
    
    showMessage(text, duration = 2000) {
        try {
            const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
            const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
            
            const messageText = this.scene.add.text(
                screenCenterX, 
                screenCenterY, 
                text, 
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            );
            messageText.setOrigin(0.5);
            messageText.setScrollFactor(0);
            messageText.setDepth(2000);
            
            this.scene.tweens.add({
                targets: messageText,
                y: screenCenterY - 50,
                alpha: 0,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    messageText.destroy();
                }
            });
            
            return messageText;
        } catch (error) {
            console.error("Error showing message:", error);
            return null;
        }
    }
    refreshUI() {
        try {
            this.syncExperienceFromGameManager();
            
            this.gameTime = 0;
            if (this.timerText && this.timerText.active) {
                this.updateTimer(0);
            }
        } catch (error) {
            console.error("Error refreshing UI:", error);
        }
    }
    
    update(time, delta) {
        if (this.scene.player && this.healthBar) {
            this.healthBar.updateHealth(this.scene.player.health, this.scene.player.maxHealth);
        }
        this.updateTimer(delta);
        
        if (this.playerLevel && !this.playerLevel.active) {
            this.initialize();
        }
    }
    
    shutdown() {
        if (this.gameManager && this.gameManager.events) {
            this.gameManager.events.off('experienceUpdated');
            this.gameManager.events.off('levelUp');
        }
        this.isInitialized = false;
    }
}