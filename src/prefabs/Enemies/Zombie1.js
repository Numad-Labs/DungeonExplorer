// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Zombie extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x ?? 32, y ?? 32, texture || "zombierun", frame ?? 0);

        /* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);
        this.body.setSize(16, 16, false);
        this.body.setOffset(14, 32);
        
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.damage = 10;
        this.speed = 50;
        this.attackRange = 5;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;
        this.isDead = false;
        
        this.lastDirection = 'down';
        this.createHealthBar();
        
        this.updateListener = this.update.bind(this);
        scene.events.on('update', this.updateListener);
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 20, 30, 4, 0xff0000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(1);
        
        this.healthBarFg = this.scene.add.rectangle(
            this.x - 15, this.y - 20, 30, 4, 0x00ff00
        );
        this.healthBarFg.setOrigin(0, 0.5);
        this.healthBarFg.setDepth(1);
        
        this.on('destroy', () => {
            if (this.healthBarBg) this.healthBarBg.destroy();
            if (this.healthBarFg) this.healthBarFg.destroy();
        });
        
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        if (!this.healthBarFg || !this.healthBarBg) return;
        
        this.healthBarBg.setPosition(this.x - 10, this.y - 10);
        this.healthBarFg.setPosition(this.x - 25, this.y - 10);
        
        const healthPercentage = this.health / this.maxHealth;
        
        this.healthBarFg.width = 30 * healthPercentage;
    }
    
    update(time, delta) {
        if (this.isDead || !this.active) return;
        
        try {
            this.updateHealthBar();
            
            const player = this.scene.player;
            
            if (!player) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                player.x, player.y
            );
            
            if (distance > this.attackRange) {
                // Get angle to player
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                
                // Use forces instead of direct velocity setting for better physics interaction
                const forceX = Math.cos(angle) * this.speed * 0.1;
                const forceY = Math.sin(angle) * this.speed * 0.1;
                
                // Apply force instead of setting velocity directly
                this.body.velocity.x += forceX;
                this.body.velocity.y += forceY;
                
                // Apply drag to prevent excessive speed
                this.body.velocity.x *= 0.9;
                this.body.velocity.y *= 0.9;
                
                // Cap max speed
                const maxSpeed = this.speed;
                const currentSpeed = Math.sqrt(
                    this.body.velocity.x * this.body.velocity.x + 
                    this.body.velocity.y * this.body.velocity.y
                );
                
                if (currentSpeed > maxSpeed) {
                    const scale = maxSpeed / currentSpeed;
                    this.body.velocity.x *= scale;
                    this.body.velocity.y *= scale;
                }
                
                // Update animation direction based on movement
                this.updateDirection(angle);
            } else {
                // When in attack range, slow down
                this.body.velocity.x *= 0.8;
                this.body.velocity.y *= 0.8;
                
                if (time - this.lastAttackTime > this.attackCooldown) {
                    this.attackPlayer(player);
                    this.lastAttackTime = time;
                }
            }
            
            this.updateFrame();
        } catch (error) {
            console.error("Error in Zombie update:", error);
        }
    }
    
    updateDirection(angle) {
        const angleInDegrees = Phaser.Math.RadToDeg(angle);
        
        if (angleInDegrees >= -45 && angleInDegrees < 45) {
            this.lastDirection = 'right';
        } else if (angleInDegrees >= 45 && angleInDegrees < 135) {
            this.lastDirection = 'down';
        } else if (angleInDegrees >= 135 || angleInDegrees < -135) {
            this.lastDirection = 'left';
        } else {
            this.lastDirection = 'up';
        }
    }
    
    updateFrame() {
        switch (this.lastDirection) {
            case 'right':
                this.setFrame(2);
                break;
            case 'left':
                this.setFrame(1);
                break;
            case 'up':
                this.setFrame(3);
                break;
            case 'down':
                this.setFrame(0);
                break;
        }
    }
    
    attackPlayer(player) {
        if (!player || !player.takeDamage) return;
        
        player.takeDamage(this.damage);
        
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });
        
        this.lastAttackTime = this.scene.time.now;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();
        
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        
        this.body.enable = false;
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.8,
            duration: 300,
            onComplete: () => this.cleanupAndDestroy()
        });
        
        this.spawnRewards();
    }
    
    spawnRewards() {
        try {
            if (this.scene.spawnExperienceOrb) {
                const orbCount = Phaser.Math.Between(1, 3);
                
                for (let i = 0; i < orbCount; i++) {
                    const xOffset = Phaser.Math.Between(-10, 10);
                    const yOffset = Phaser.Math.Between(-10, 10);
                    
                    this.scene.spawnExperienceOrb(
                        this.x + xOffset, 
                        this.y + yOffset, 
                        1
                    );
                }
            }
        } catch (error) {
            console.error("Error spawning rewards:", error);
        }
    }
    
    cleanupAndDestroy() {
        try {
            if (this.scene && this.updateListener) {
                this.scene.events.off('update', this.updateListener);
                this.updateListener = null;
            }
        } catch (error) {
            console.error("Error removing update listener:", error);
        }
        
        this.destroy();
    }
    
    destroy(fromScene) {
        try {
            if (this.scene && this.updateListener) {
                this.scene.events.off('update', this.updateListener);
                this.updateListener = null;
            }
        } catch (error) {
            console.error("Error in destroy method:", error);
        }
        
        super.destroy(fromScene);
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here