// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class HealthOrb extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, frame) {
        const textureToUse = (texture || "Health_Potion_01");
        const textureExists = scene.textures.exists(textureToUse);
        
        super(scene, x ?? 16, y ?? 16, textureExists ? textureToUse : '__WHITE', frame);
        
        if (!textureExists) {
            this.setTint(0x00ff00);
        }

        /* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);
        
        this.body.setCircle(6);
        this.body.setCollideWorldBounds(false);
        
        this.body.setBounce(0, 0);
        this.body.setDrag(10, 10);
        
        this.healValue = 15;
        this.magneticRange = 100;
        this.magneticForce = 150;
        this.maxForce = 300;
        
        this.initialY = y;
        this.floatOffset = 5;
        this.floatSpeed = 1.5;
        this.floatTime = Math.random() * Math.PI * 2;
        
        this.isBeingCollected = false;
        this.isAttracted = false;
        
        this.updateListener = this.update.bind(this);
        scene.events.on('update', this.updateListener);
        
        this.setScale(0.25);
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    setHealValue(value) {
        this.healValue = value;
        const scale = 0.2 + (Math.min(value, 50) / 50 * 0.15);
        this.setScale(scale);
        
        if (!this.scene.textures.exists("Health_Potion_01")) {
            if (value >= 50) {
                this.setTint(0x00ff88);
            } else if (value >= 25) {
                this.setTint(0x00dd66);
            } else if (value >= 10) {
                this.setTint(0x00bb44);
            } else {
                this.setTint(0x00aa33);
            }
        }
        
        return this;
    }
    
    update(time, delta) {
        if (this.isBeingCollected || !this.active) return;

        try {
            const player = this.scene.player;
            if (!player) return;
            
            if (!this.isAttracted) {
                this.floatTime += delta / 1000;
                this.y = this.initialY + Math.sin(this.floatTime * this.floatSpeed) * this.floatOffset;
            }

            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                player.x, player.y
            );

            if (distance <= this.magneticRange) {
                this.isAttracted = true;
                
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                
                const length = Math.sqrt(dx * dx + dy * dy);
                const ndx = dx / length;
                const ndy = dy / length;
                
                const forceFactor = 1 - (distance / this.magneticRange);
                const speed = this.magneticForce + (this.maxForce - this.magneticForce) * forceFactor;
                
                this.body.velocity.x = ndx * speed;
                this.body.velocity.y = ndy * speed;
                
                this.initialY = this.y;
                
                if (distance < 15) {
                    this.collect();
                }
            } else {
                this.isAttracted = false;
                
                if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
                    this.body.velocity.x *= 0.95;
                    this.body.velocity.y *= 0.95;
                    
                    if (Math.abs(this.body.velocity.x) < 1) this.body.velocity.x = 0;
                    if (Math.abs(this.body.velocity.y) < 1) this.body.velocity.y = 0;
                }
            }
        } catch (error) {
            console.error("Error in HealthOrb update:", error);
            this.destroy();
        }
    }
    
    collect() {
        if (this.isBeingCollected) return this.healValue;
        
        this.isBeingCollected = true;
        
        try {
            const player = this.scene.player;
            
            if (player && player.heal) {
                player.heal(this.healValue);
            } else if (player && player.health !== undefined) {
                const maxHealth = player.maxHealth || 100;
                const oldHealth = player.health;
                player.health = Math.min(player.health + this.healValue, maxHealth);
                const actualHealing = player.health - oldHealth;
                
                if (this.scene.gameManager && this.scene.gameManager.updateHealthDisplay) {
                    this.scene.gameManager.updateHealthDisplay();
                }
                
                this.createFloatingText(`+${actualHealing} HP`);
            } else if (this.scene.gameManager && this.scene.gameManager.healPlayer) {
                this.scene.gameManager.healPlayer(this.healValue);
                this.createFloatingText(`+${this.healValue} HP`);
            } else {
                console.warn("No healing system found to heal player");
                this.createFloatingText(`+${this.healValue} HP`);
            }
            
            if (this.scene.sound && this.scene.sound.get('heal')) {
                this.scene.sound.play('heal', { volume: 0.4 });
            }
            
            this.scene.tweens.add({
                targets: this,
                scale: { from: this.scale, to: 0 },
                alpha: { from: 1, to: 0 },
                duration: 200,
                onComplete: () => {
                    this.cleanupAndDestroy();
                }
            });
            
        } catch (error) {
            console.error("Error collecting health orb:", error);
            this.cleanupAndDestroy();
        }
        
        return this.healValue;
    }
    
    createFloatingText(message) {
        try {
            const floatingText = this.scene.add.text(
                this.x,
                this.y - 20,
                message,
                {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    color: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            );
            floatingText.setOrigin(0.5);
            
            this.scene.tweens.add({
                targets: floatingText,
                y: floatingText.y - 40,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    floatingText.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating floating text:", error);
        }
    }
    
    cleanupAndDestroy() {
        try {
            if (this.scene && this.updateListener) {
                this.scene.events.off('update', this.updateListener);
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