// UIManager.js - Complete version with timer

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
        
        this.gameTime = 0;
        
        this.uiContainer = null;
    }
    
    initialize() {
        try {
            this.uiContainer = this.scene.add.container(0, 0);
            
            if (!this.scene.healthBar) {
                this.healthBar = new HealthBar(this.scene, 320, 230, 200, 20);
                this.scene.healthBar = this.healthBar; 
            } else {
                this.healthBar = this.scene.healthBar;
            }
            
            if (!this.scene.playerLevelSystem) {
                this.playerLevel = new PlayerLevel(this.scene, 320, 180);
                this.scene.add.existing(this.playerLevel);
                this.playerLevel.createProgressBar(0, 0, 204, 20);
                
                this.playerLevel.onLevelUp((newLevel) => {
                    console.log(`Player reached level ${newLevel}!`);
                    
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
            }
            
            this.createGameTimer();
            
            if (this.gameManager && this.gameManager.events) {
                this.gameManager.events.on('experienceUpdated', (exp, nextLevel) => {
                    if (this.playerLevel) {
                        this.playerLevel.setExperience(exp, nextLevel);
                    }
                });
                
                this.gameManager.events.on('levelUp', (newLevel) => {
                    if (this.playerLevel) {
                        this.playerLevel.setLevel(newLevel);
                    }
                });
            }
            
            this.patchExpOrbCollect();
            
            console.log("UI elements created");
        } catch (error) {
            console.error("Error setting up UI:", error);
        }
    }
    
    createGameTimer() {
        try {
            const screenWidth = this.scene.cameras.main.width;
            
            const timerX = 890;
            const timerY = 210;
            
            const timerBg = this.scene.add.rectangle(
                timerX,
                timerY,
                120,
                40,
                0x000000,
                0.7
            );
            timerBg.setStrokeStyle(2, 0xffffff);
            timerBg.setScrollFactor(0);
            timerBg.setDepth(900);
            this.uiContainer.add(timerBg);
            
            const timerLabel = this.scene.add.text(
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
            timerLabel.setOrigin(0.5);
            timerLabel.setScrollFactor(0);
            timerLabel.setDepth(901);
            this.uiContainer.add(timerLabel);
            
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
            this.uiContainer.add(this.timerText);
            
            this.gameTime = 0;
            
            if (this.gameManager && this.gameManager.gameProgress && 
                typeof this.gameManager.gameProgress.gameTime !== 'undefined') {
                this.gameTime = this.gameManager.gameProgress.gameTime;
            }
            
            this.updateTimer(0);
            
            console.log("Game timer created successfully");
        } catch (error) {
            console.error("Error creating timer display:", error);
        }
    }
    
    updateTimer(delta) {
        if (!this.timerText) return;
        
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
    
    patchExpOrbCollect() {
        try {
            const ExpOrb = this.scene.spawnExperienceOrb?.constructor;
            
            if (!ExpOrb || !ExpOrb.prototype) {
                console.log("Cannot patch ExpOrb.collect: prototype not found");
                return;
            }
            
            const originalCollect = ExpOrb.prototype.collect;
            
            ExpOrb.prototype.collect = function() {
                if (originalCollect) {
                    originalCollect.call(this);
                }
                
                const scene = this.scene;
                if (scene.playerLevelSystem && typeof scene.playerLevelSystem.addExperience === 'function') {
                    console.log(`Adding ${this.expValue} experience to playerLevelSystem`);
                    scene.playerLevelSystem.addExperience(this.expValue);
                }
            };
            
            console.log("ExpOrb.collect patched for experience tracking");
        } catch (error) {
            console.error("Error patching ExpOrb.collect:", error);
        }
    }
    
    updateHealthBar() {
        if (this.healthBar && this.scene.player) {
            const { health, maxHealth } = this.scene.player;
            this.healthBar.updateHealth(health, maxHealth);
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
            messageText.setDepth(1000);
            
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

    showGameOver() {
        try {
            const cam = this.scene.cameras.main;
            const screenCenterX = cam.worldView.x + cam.width / 2;
            const screenCenterY = cam.worldView.y + cam.height / 2;

            console.log(`Showing game over at center: ${screenCenterX}, ${screenCenterY}`);

            const gameOverContainer = this.scene.add.container(screenCenterX, screenCenterY);
            gameOverContainer.setDepth(9000);
            gameOverContainer.setScrollFactor(0);

            const gameOverBg = this.scene.add.rectangle(
                0, 0,
                400, 300,
                0x000000,
                0.8
            );
            gameOverBg.setStrokeStyle(4, 0xff0000);
            gameOverContainer.add(gameOverBg);

            const gameOverText = this.scene.add.text(
                0, -80,
                'GAME OVER', 
                {
                    fontFamily: 'Arial',
                    fontSize: '48px',
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            );
            gameOverText.setOrigin(0.5);
            gameOverContainer.add(gameOverText);

            const minutes = Math.floor(this.gameTime / 60);
            const seconds = Math.floor(this.gameTime % 60);

            const survivedLabel = this.scene.add.text(
                0, -10,
                "YOU SURVIVED",
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            survivedLabel.setOrigin(0.5);
            gameOverContainer.add(survivedLabel);

            const timeText = this.scene.add.text(
                0, 30,
                `${minutes}m ${seconds}s`,
                {
                    fontFamily: 'Arial',
                    fontSize: '36px',
                    color: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 5,
                    fontStyle: 'bold'
                }
            );
            timeText.setOrigin(0.5);
            gameOverContainer.add(timeText);

            const restartText = this.scene.add.text(
                0, 90,
                'Press R to restart',
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            );
            restartText.setOrigin(0.5);
            gameOverContainer.add(restartText);

            this.uiContainer.add(gameOverContainer);

            this.scene.tweens.add({
                targets: timeText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });

            const centerDot = this.scene.add.circle(screenCenterX, screenCenterY, 10, 0xff0000);
            centerDot.setDepth(9001);
            centerDot.setScrollFactor(0);

            this.scene.input.keyboard.once('keydown-R', () => {
                gameOverContainer.destroy();
                centerDot.destroy();

                if (this.gameManager) {
                    this.gameManager.resetGameState();
                }

                this.scene.scene.restart();
            });

            console.log("Game Over screen created successfully");
        } catch (error) {
            console.error("Error showing game over screen:", error);
        }
    }
    
    update(time, delta) {
        if (this.scene.player && this.healthBar) {
            this.healthBar.updateHealth(this.scene.player.health, this.scene.player.maxHealth);
        }
        this.updateTimer(delta);
    }
    
    shutdown() {
        if (this.gameManager && this.gameManager.events) {
            this.gameManager.events.off('experienceUpdated');
            this.gameManager.events.off('levelUp');
        }
    }
}