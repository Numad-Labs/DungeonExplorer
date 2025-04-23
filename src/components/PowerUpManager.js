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
        
        this.selectionContainer = null;
        this.overlay = null;
        this.gameWasPaused = false;
        this.playerMovementEnabled = true;
        this.isSelectionActive = false;
        this.pendingLevelUps = 0;
        
        scene.powerUpManager = this;
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
        
        this.selectionContainer = this.scene.add.container(0, 0);
        this.selectionContainer.setDepth(1001);
        this.selectionContainer.setScrollFactor(0);
        
        const options = this.getRandomPowerUpOptions(3);
        
        const positions = [
            { x: 440, y: 350 },
            { x: 640, y: 350 },
            { x: 840, y: 350 }
        ];
        
        options.forEach((option, index) => {
            const pos = positions[index];
            const level = this.powerUps[option] + 1;
            
            console.log(`Creating power-up card at position: ${pos.x}, ${pos.y} for ${option}`);
            
            const card = new PowerUpSelection(this.scene, pos.x, pos.y, option, level);
            card.setScale(0.6); 

            const hitArea = this.scene.add.rectangle(pos.x, pos.y, 200, 300, 0xffffff, 0.0);
            hitArea.setInteractive({ useHandCursor: true });
            hitArea.setScale(0.6);
            hitArea.setScrollFactor(0);
            hitArea.setDepth(1002);
            
            hitArea.cardType = option;
            hitArea.cardLevel = level;
            
            hitArea.on('pointerover', () => {
                card.onPointerOver();
            });
            
            hitArea.on('pointerout', () => {
                card.onPointerOut();
            });
            
            hitArea.on('pointerdown', () => {
                console.log(`Card clicked via hitbox: ${option}`);
                card.onPointerDown();
                this.onPowerUpSelected(option, level);
            });
            
            card.setOnSelectCallback((type, level) => {
                console.log(`PowerUpSelection direct callback: ${type}, ${level}`);
                this.onPowerUpSelected(type, level);
            });
            
            this.selectionContainer.add([card, hitArea]);
        });
        
        this.originalUpdate = this.scene.update;
        this.scene.update = () => {
            // Empty update function effectively pauses gameplay
            // but still allows input processing for the power-up cards
        };
        
        this.cleanupElements = [
            this.overlay,
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
        console.log(`Applying power-up: ${type} at level ${level}`);
        
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
                    player.moveSpeed *= (1 + scaledBoost / 100);
                }
                break;
                
            case 'damage':
                if (player.damage) {
                    player.damage *= (1 + scaledBoost / 100);
                }
                if (this.scene.playerAttack) {
                    this.scene.playerAttack.updateStats();
                }
                break;
                
            case 'health':
                if (player.maxHealth) {
                    const oldMax = player.maxHealth;
                    player.maxHealth *= (1 + scaledBoost / 100);
                    if (player.health) {
                        player.health += (player.maxHealth - oldMax);
                    }
                    player.updateHealthBar();
                }
                break;
                
            case 'fireRate':
                if (player.fireRate) {
                    player.fireRate *= (1 + scaledBoost / 100);
                }
                if (this.scene.playerAttack) {
                    this.scene.playerAttack.updateStats();
                }
                break;
                
            case 'range':
                if (player.attackRange) {
                    player.attackRange *= (1 + scaledBoost / 100);
                }
                if (this.scene.playerAttack) {
                    this.scene.playerAttack.updateStats();
                }
                break;
                
            case 'magnet':
                if (this.scene.orbMagnetRange) {
                    this.scene.orbMagnetRange *= (1 + scaledBoost / 100);
                }
                break;
        }
        
        this.showPowerUpFeedback(type, scaledBoost);
        this.createPowerUpEffect(player, type);
    }
    
    showPowerUpFeedback(type, value) {
        const player = this.scene.player;
        if (!player) return;
        
        const message = `${type.charAt(0).toUpperCase() + type.slice(1)} +${value.toFixed(0)}%`;
        
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
    
    createPowerUpEffect(player, type) {
        const colors = {
            speed: 0x00ff00,
            damage: 0xff0000,
            health: 0x0000ff,
            fireRate: 0xffff00,
            range: 0x00ffff,
            magnet: 0xff00ff
        };
        const color = colors[type] || 0xffffff;
        
        player.setTint(color);
        this.scene.time.delayedCall(300, () => {
            player.clearTint();
        });
    }
}