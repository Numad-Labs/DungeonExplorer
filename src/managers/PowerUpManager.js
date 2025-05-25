import PowerUpSelection from "../prefabs/PowerUpSelection";

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerUps = {
            speed: 0,
            damage: 0,
            health: 0,
            fireRate: 0,
            range: 0,
            magnet: 0
        };
        
        this.gameManager = scene.gameManager || 
            (scene.game && scene.game.registry ? scene.game.registry.get('gameManager') : null);
        
        this.selectionContainer = null;
        this.overlay = null;
        this.gameWasPaused = false;
        this.playerMovementEnabled = true;
        this.isSelectionActive = false;
        this.pendingLevelUps = 0;
        
        scene.powerUpManager = this;
    }
    
    initialize() {
        this.createPlaceholderTextures();
        console.log("PowerUpManager initialized - starting fresh with no power-ups:", { ...this.powerUps });
    }
    
    createPlaceholderTextures() {
        try {
            if (!this.scene.textures.exists('blank cards7')) {
                const cardGraphics = this.scene.add.graphics();
                cardGraphics.fillStyle(0x333333, 1);
                cardGraphics.fillRoundedRect(0, 0, 200, 300, 16);
                cardGraphics.lineStyle(4, 0xffffff, 1);
                cardGraphics.strokeRoundedRect(0, 0, 200, 300, 16);
                cardGraphics.generateTexture('blank cards7', 200, 300);
                cardGraphics.destroy();
            }

            const powerUpTypes = ['speed', 'damage', 'health', 'fireRate', 'range', 'magnet'];
            const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];

            powerUpTypes.forEach((type, index) => {
                const textureName = `${type}_icon`;
                if (!this.scene.textures.exists(textureName)) {
                    const graphics = this.scene.add.graphics();
                    graphics.fillStyle(colors[index], 1);
                    graphics.fillCircle(32, 32, 32);
                    graphics.fillStyle(0xffffff, 1);

                    switch (type) {
                        case 'speed':
                            graphics.fillTriangle(20, 15, 32, 30, 25, 32);
                            graphics.fillTriangle(25, 32, 44, 50, 32, 30);
                            break;
                        case 'damage':
                            graphics.fillRect(20, 20, 24, 4);
                            graphics.fillTriangle(44, 20, 44, 24, 52, 22);
                            break;
                        case 'health':
                            graphics.fillRect(22, 30, 20, 4);
                            graphics.fillRect(30, 22, 4, 20);
                            break;
                        case 'fireRate':
                            graphics.fillTriangle(25, 45, 32, 15, 39, 45);
                            break;
                        case 'range':
                            graphics.lineStyle(3, 0xffffff, 1);
                            graphics.strokeCircle(32, 32, 15);
                            graphics.fillCircle(32, 32, 5);
                            break;
                        case 'magnet':
                            graphics.fillRect(22, 20, 7, 24);
                            graphics.fillRect(35, 20, 7, 24);
                            graphics.fillRect(22, 20, 20, 7);
                            break;
                    }

                    graphics.generateTexture(textureName, 64, 64);
                    graphics.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating placeholder textures:", error);
        }
    }
    
    showPowerUpSelection() {
        console.log("Attempting to show power-up selection");
        
        if (this.isSelectionActive) {
            console.log("Level-up queued, selection already active");
            this.pendingLevelUps++;
            return;
        }
        
        this.isSelectionActive = true;
        console.log("Showing power-up selection, active =", this.isSelectionActive);
        
        this.gameWasPaused = this.scene.scene.isPaused();
        
        if (this.scene.player && this.scene.player.body) {
            this.originalVelocityX = this.scene.player.body.velocity.x;
            this.originalVelocityY = this.scene.player.body.velocity.y;
            
            this.scene.player.body.velocity.x = 0;
            this.scene.player.body.velocity.y = 0;
            this.scene.player.body.enable = false;
        }
        
        if (this.scene.enemySpawnTimer) this.scene.enemySpawnTimer.paused = true;
        if (this.scene.orbSpawnTimer) this.scene.orbSpawnTimer.paused = true;
        if (this.scene.difficultyTimer) this.scene.difficultyTimer.paused = true;
        
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy.body) {
                    enemy._storedVelocityX = enemy.body.velocity.x;
                    enemy._storedVelocityY = enemy.body.velocity.y;
                    enemy.body.velocity.x = 0;
                    enemy.body.velocity.y = 0;
                    enemy.body.enable = false;
                }
            });
        }
        
        const cameraWidth = this.scene.cameras.main.width;
        const cameraHeight = this.scene.cameras.main.height;
        
        this.overlay = this.scene.add.rectangle(
            cameraWidth / 2,
            cameraHeight / 2,
            cameraWidth,
            cameraHeight,
            0x000000,
            0.7
        );
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(1000);
        
        const titleText = this.scene.add.text(
            cameraWidth / 2,
            100,
            "LEVEL UP! Choose a Power-Up",
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);
        titleText.setDepth(1001);
        
        this.selectionContainer = this.scene.add.container(0, 0);
        this.selectionContainer.setDepth(1001);
        this.selectionContainer.setScrollFactor(0);
        
        const options = this.getRandomPowerUpOptions(3);
        
        const positions = [
            { x: cameraWidth / 2 - 220, y: cameraHeight / 2 },
            { x: cameraWidth / 2, y: cameraHeight / 2 },
            { x: cameraWidth / 2 + 220, y: cameraHeight / 2 }
        ];
        
        this.powerUpCards = [];
        
        options.forEach((option, index) => {
            const pos = positions[index];
            const level = this.powerUps[option] + 1;
            
            console.log(`Creating power-up card at position: ${pos.x}, ${pos.y} for ${option}`);
            
            const card = new PowerUpSelection(this.scene, pos.x, pos.y, option, level);
            card.setScale(0.7);
            
            card.setScrollFactor(0);
            card.setDepth(1002);
            
            card.setOnSelectCallback((type, level) => {
                console.log(`PowerUp Selected: ${type} level ${level}`);
                this.onPowerUpSelected(type, level);
            });
            card.setInteractive({ useHandCursor: true });
            this.selectionContainer.add(card);
            this.powerUpCards.push(card);
        });
        
        this.originalUpdate = this.scene.update;
        this.scene.update = () => {
            // Empty update function effectively pauses gameplay
            // but still allows input processing for the power-up cards
        };
        
        this.cleanupElements = [
            this.overlay,
            titleText,
            this.selectionContainer
        ];
    }
    
    onPowerUpSelected(type, level) {
        console.log(`Power-up selected: ${type} at level ${level}`);
        
        this.powerUps[type] = level;
        
        this.applyPowerUp(type, level);
        
        this.scene.tweens.add({
            targets: this.cleanupElements,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.cleanupElements.forEach(element => {
                    if (element && element.destroy) {
                        element.destroy();
                    }
                });
                
                this.cleanupElements = [];
                this.selectionContainer = null;
                this.overlay = null;
                
                if (this.originalUpdate) {
                    this.scene.update = this.originalUpdate;
                    this.originalUpdate = null;
                }
                
                if (this.scene.player && this.scene.player.body) {
                    this.scene.player.body.enable = true;
                    
                    if (this.originalVelocityX !== undefined) {
                        this.scene.player.body.velocity.x = this.originalVelocityX;
                        this.scene.player.body.velocity.y = this.originalVelocityY;
                    }
                }
                
                if (this.scene.enemySpawnTimer) this.scene.enemySpawnTimer.paused = false;
                if (this.scene.orbSpawnTimer) this.scene.orbSpawnTimer.paused = false;
                if (this.scene.difficultyTimer) this.scene.difficultyTimer.paused = false;
                
                if (this.scene.enemies) {
                    this.scene.enemies.getChildren().forEach(enemy => {
                        if (enemy.body) {
                            enemy.body.enable = true;
                            
                            if (enemy._storedVelocityX !== undefined) {
                                enemy.body.velocity.x = enemy._storedVelocityX;
                                enemy.body.velocity.y = enemy._storedVelocityY;
                                delete enemy._storedVelocityX;
                                delete enemy._storedVelocityY;
                            }
                        }
                    });
                }
                
                this.isSelectionActive = false;
                console.log("Selection completed, active =", this.isSelectionActive);
                
                if (this.pendingLevelUps > 0) {
                    console.log("Processing queued level-up, remaining:", this.pendingLevelUps-1);
                    this.pendingLevelUps--;
                    
                    this.scene.time.delayedCall(500, () => {
                        this.showPowerUpSelection();
                    });
                }
            }
        });
    }
    
    applyPowerUp(type, level) {
        console.log(`Applying in-game power-up: ${type} at level ${level} (separate from menu upgrades)`);
        
        const player = this.scene.player;
        if (!player) {
            console.warn("Player not found for applying power-up");
            return;
        }
        
        const baseBoost = this.getPowerUpBaseValue(type);
        const scaledBoost = baseBoost * (1 + (level - 1) * 0.5);
        
        switch (type) {
            case 'speed':
                if (player.moveSpeed) {
                    const oldSpeed = player.moveSpeed;
                    player.moveSpeed *= (1 + scaledBoost / 100);
                    console.log(`Speed increased from ${oldSpeed.toFixed(1)} to ${player.moveSpeed.toFixed(1)}`);
                }
                break;
                
            case 'damage':
                if (player.damage) {
                    const oldDamage = player.damage;
                    player.damage *= (1 + scaledBoost / 100);
                    console.log(`Damage increased from ${oldDamage.toFixed(1)} to ${player.damage.toFixed(1)}`);
                }
                if (this.scene.playerAttackSystem && this.scene.playerAttackSystem.updateStats) {
                    this.scene.playerAttackSystem.updateStats();
                }
                break;
                
            case 'health':
                if (player.maxHealth) {
                    const oldMax = player.maxHealth;
                    const oldCurrent = player.health;
                    player.maxHealth += 50;
                    player.health += 50; // Give immediate health boost
                    console.log(`Health increased from ${oldCurrent}/${oldMax} to ${player.health}/${player.maxHealth}`);
                }
                break;
                
            case 'fireRate':
                if (player.fireRate) {
                    const oldRate = player.fireRate;
                    player.fireRate *= (1 + scaledBoost / 100);
                    console.log(`Fire rate increased from ${oldRate.toFixed(2)} to ${player.fireRate.toFixed(2)}`);
                }
                if (this.scene.playerAttackSystem && this.scene.playerAttackSystem.updateStats) {
                    this.scene.playerAttackSystem.updateStats();
                }
                break;
                
            case 'range':
                if (player.attackRange) {
                    const oldRange = player.attackRange;
                    player.attackRange *= (1 + scaledBoost / 100);
                    console.log(`Attack range increased from ${oldRange.toFixed(1)} to ${player.attackRange.toFixed(1)}`);
                }
                if (this.scene.playerAttackSystem && this.scene.playerAttackSystem.updateStats) {
                    this.scene.playerAttackSystem.updateStats();
                }
                break;
                
            case 'magnet':
                if (player.pickupRange) {
                    const oldRange = player.pickupRange;
                    player.pickupRange *= (1 + scaledBoost / 100);
                    console.log(`Pickup range increased from ${oldRange.toFixed(1)} to ${player.pickupRange.toFixed(1)}`);
                }
                break;
        }
        
        this.showPowerUpFeedback(type, scaledBoost);
    }
    
    showPowerUpFeedback(type, value) {
        const player = this.scene.player;
        if (!player) return;
        
        let message;
        switch (type) {
            case 'health':
                message = `Max Health +50`;
                break;
            default:
                message = `${type.charAt(0).toUpperCase() + type.slice(1)} +${value.toFixed(0)}%`;
                break;
        }
        
        const feedbackText = this.scene.add.text(
            player.x,
            player.y - 50,
            message,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        );
        feedbackText.setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: feedbackText,
            y: feedbackText.y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }
    
    getPowerUpBaseValue(type) {
        const baseValues = {
            speed: 20,
            damage: 15,
            health: 10,
            fireRate: 10,
            range: 15,
            magnet: 20
        };
        
        return baseValues[type] || 10;
    }
    
    getRandomPowerUpOptions(count) {
        const allTypes = Object.keys(this.powerUps);
        const shuffled = [...allTypes].sort(() => 0.5 - Math.random());
        
        return shuffled.slice(0, count);
    }
    
    shutdown() {
        if (this.selectionContainer) {
            this.selectionContainer.destroy();
            this.selectionContainer = null;
        }
        
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        
        console.log("PowerUpManager shut down");
    }
}