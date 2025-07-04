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
        
        // Scoreboard UI
        this.scoreboard = {
            container: null,
            background: null,
            title: null,
            stats: {
                wave: null,
                kills: null,
                gold: null
            }
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
            this.createScoreboard();
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
    
    createScoreboard() {
        const config = { x: 880, y: 490, width: 140, height: 90 };
        
        // Create container for scoreboard
        this.scoreboard.container = this.scene.add.container(config.x, config.y);
        this.scoreboard.container.setScrollFactor(0).setDepth(900);
        
        // Background
        this.scoreboard.background = this.scene.add.rectangle(
            0, 0, config.width, config.height, 0x000000, 0.7
        ).setStrokeStyle(2, 0xffffff);
        
        // Title
        this.scoreboard.title = this.scene.add.text(0, -35, "STATS", {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Stats text elements
        const statStyle = {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        };
        
        this.scoreboard.stats.wave = this.scene.add.text(-60, -15, "Wave: 0", statStyle);
        this.scoreboard.stats.kills = this.scene.add.text(-60, 0, "Kills: 0", statStyle);
        this.scoreboard.stats.gold = this.scene.add.text(-60, 15, "Gold: 0", statStyle);
        
        // Add all elements to container (removed level)
        this.scoreboard.container.add([
            this.scoreboard.background,
            this.scoreboard.title,
            this.scoreboard.stats.wave,
            this.scoreboard.stats.kills,
            this.scoreboard.stats.gold
        ]);
        
        // Add to main UI container
        this.uiContainer.add(this.scoreboard.container);
        
        console.log("Scoreboard created");
    }
    
    updateScoreboard() {
        if (!this.scoreboard.container) return;
        
        try {
            // Get current game statistics with better wave detection
            let currentWave = 0;
            
            // Try multiple sources for wave data
            if (this.gameManager && this.gameManager.currentWave) {
                currentWave = this.gameManager.currentWave;
            } else if (this.scene.gameplayManager?.mobManager) {
                const mobStats = this.scene.gameplayManager.mobManager.getStatistics();
                currentWave = mobStats.currentWave || 0;
            } else if (this.scene.currentWave !== undefined) {
                currentWave = this.scene.currentWave;
            }
            
            // Get kills from multiple sources
            let totalKills = 0;
            if (this.scene.gameplayManager?.mobManager) {
                const mobStats = this.scene.gameplayManager.mobManager.getStatistics();
                totalKills = mobStats.totalKilled || 0;
            } else if (this.scene.enemiesKilled !== undefined) {
                totalKills = this.scene.enemiesKilled;
            }
            
            const gold = this.gameManager?.gold || 0;
            
            // Update text elements
            this.scoreboard.stats.wave.setText(`Wave: ${currentWave}`);
            this.scoreboard.stats.kills.setText(`Kills: ${totalKills}`);
            this.scoreboard.stats.gold.setText(`Gold: ${gold}`);
            
            // Add visual effects for significant changes
            if (currentWave > (this.lastWave || 0)) {
                this.pulseScoreboardStat(this.scoreboard.stats.wave, 0x00ff00);
                this.lastWave = currentWave;
            }
            
        } catch (error) {
            console.error("Error updating scoreboard:", error);
        }
    }
    
    pulseScoreboardStat(textElement, color = 0xffffff) {
        if (!textElement) return;
        
        try {
            // Store original color
            const originalColor = textElement.style.color;
            
            // Change color and scale
            textElement.setColor(`#${color.toString(16).padStart(6, '0')}`);
            
            this.scene.tweens.add({
                targets: textElement,
                scale: 1.2,
                duration: 200,
                yoyo: true,
                repeat: 1,
                ease: 'Power2',
                onComplete: () => {
                    textElement.setColor(originalColor);
                }
            });
        } catch (error) {
            console.error("Error pulsing scoreboard stat:", error);
        }
    }
    
    showScoreboardUpdate(statType, value, color = 0x00ff00) {
        try {
            // Fixed coordinates - between health bar (220) and timer (890) at top UI level
            const centerX = 605; // Middle between health bar and timer
            const centerY = 150; // Higher up in the UI area, above the health bar
            
            // Create appropriate text based on stat type
            let displayText = '';
            switch(statType) {
                case 'kills':
                    displayText = `+${value} Kill${value > 1 ? 's' : ''}`;
                    break;
                case 'gold':
                    displayText = `+${value} Gold`;
                    break;
                case 'wave':
                    displayText = `Wave ${value} Started!`;
                    break;
                default:
                    displayText = `+${value}`;
            }
            
            // Create floating text for the update
            const updateText = this.scene.add.text(
                centerX, 
                centerY, 
                displayText, 
                {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    color: `#${color.toString(16).padStart(6, '0')}`,
                    stroke: '#000000',
                    strokeThickness: 2,
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
            
            // Animate the floating text
            this.scene.tweens.add({
                targets: updateText,
                y: centerY - 25,
                alpha: 0,
                scale: { from: 1.1, to: 0.9 },
                duration: 1200,
                ease: 'Power2',
                onComplete: () => {
                    updateText.destroy();
                }
            });
            
        } catch (error) {
            console.error("Error showing scoreboard update:", error);
        }
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
        this.gameManager.events.off('enemyKilled');
        this.gameManager.events.off('goldEarned');
        this.gameManager.events.off('waveStarted');
        
        this.gameManager.events.on('experienceUpdated', () => {
            this.syncWithGameManager();
        });
        
        this.gameManager.events.on('levelUp', (newLevel) => {
            this.handleLevelUp(newLevel);
        });
        
        // Listen for scoreboard updates
        this.gameManager.events.on('enemyKilled', (value) => {
            this.showScoreboardUpdate('kills', value || 1, 0xff0000);
        });
        
        this.gameManager.events.on('goldEarned', (value) => {
            this.showScoreboardUpdate('gold', value, 0xffff00);
        });
        
        this.gameManager.events.on('waveStarted', (waveNumber) => {
            this.showScoreboardUpdate('wave', 1, 0x00ff00);
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
            // Use the same positioning as scoreboard updates for consistency
            const centerX = 605; // Same as popup texts - between health bar and timer
            const centerY = 150; // Same Y position as other popup texts
            
            const message = this.scene.add.text(centerX, centerY, text, {
                fontFamily: 'Arial',
                fontSize: '16px', // Slightly larger for important messages
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
            
            this.scene.tweens.add({
                targets: message,
                y: centerY - 30,
                alpha: 0,
                scale: { from: 1.2, to: 0.8 },
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
        this.lastWave = 0;
        this.syncWithGameManager();
        this.updateScoreboard();
    }
    
    update(time, delta) {
        if (!this.isInitialized) return;
        
        try {
            this.updateHealthBar();
            this.updateTimer(delta);
            this.updateAttackCooldowns();
            this.updateScoreboard();
            
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
            this.gameManager.events.off('enemyKilled');
            this.gameManager.events.off('goldEarned');
            this.gameManager.events.off('waveStarted');
        }
        
        [
            this.timer.background,
            this.timer.label, 
            this.timer.text,
            this.scoreboard.container,
            this.attackCooldowns.container,
            this.uiContainer
        ].forEach(component => {
            if (component?.destroy) {
                component.destroy();
            }
        });
        
        this.isInitialized = false;
        this.timer = { text: null, background: null, label: null, elapsed: 0 };
        this.scoreboard = {
            container: null,
            background: null,
            title: null,
            stats: {
                wave: null,
                kills: null,
                gold: null
            }
        };
        this.attackCooldowns = {
            container: null,
            slash: { icon: null, cooldownBar: null, background: null },
            fire: { icon: null, cooldownBar: null, background: null },
            ice: { icon: null, cooldownBar: null, background: null }
        };
    }
}