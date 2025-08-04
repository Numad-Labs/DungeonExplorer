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
        this.isMoving = false;
        
        this.lastDirection = 'down';
        this.createHealthBar();
        this.createAnimations();
        this.addToZombieGroup(scene);
        this.createShadow();
        this.updateListener = this.update.bind(this);
		scene.events.on('update', this.updateListener);
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    addToZombieGroup(scene) {
        if (!scene.zombieGroup) {
            scene.zombieGroup = scene.physics.add.group();
            scene.physics.add.collider(scene.zombieGroup, scene.zombieGroup, 
                this.handleZombieCollision, null, scene);
        }
        scene.zombieGroup.add(this);
    }
    
    handleZombieCollision(zombie1, zombie2) {
        const distance = Phaser.Math.Distance.Between(
            zombie1.x, zombie1.y, zombie2.x, zombie2.y
        );
        
        if (distance < 20) {
            const angle = Phaser.Math.Angle.Between(
                zombie1.x, zombie1.y, zombie2.x, zombie2.y
            );
            
            const separationForce = 30;
            const pushX = Math.cos(angle) * separationForce;
            const pushY = Math.sin(angle) * separationForce;
            
            zombie2.body.velocity.x += pushX;
            zombie2.body.velocity.y += pushY;
            zombie1.body.velocity.x -= pushX;
            zombie1.body.velocity.y -= pushY;
        }
    }
    
    createAnimations() {
        if (!this.scene.anims.exists('zombieRunAni')) {
            this.scene.anims.create({
                key: 'zombieRunAni',
                frames: this.scene.anims.generateFrameNumbers('zombierun', { start: 0, end: 6}),
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.scene.anims.exists('zombieIdle')) {
            this.scene.anims.create({
                key: 'zombieIdle',
                frames: [{ key: 'zombierun', frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
        }
    }
    
    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 20, 30, 4, 0xff0000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(1);
        
        this.healthBarFg = this.scene.add.rectangle(
            this.x - 15, this.y - 20, 30, 4, 0x00ff00
        );
        this.healthBarFg.setOrigin(0, 0.5);
        this.healthBarFg.setDepth(20);
        
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
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                const forceX = Math.cos(angle) * this.speed * 0.1;
                const forceY = Math.sin(angle) * this.speed * 0.1;
                this.body.velocity.x += forceX;
                this.body.velocity.y += forceY;
                this.body.velocity.x *= 0.9;
                this.body.velocity.y *= 0.9;
                this.applyZombieAvoidance();
                
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
                this.isMoving = true;
                this.updateDirection(angle);
            } else {
                this.body.velocity.x *= 0.8;
                this.body.velocity.y *= 0.8;
                const currentSpeed = Math.sqrt(
                    this.body.velocity.x * this.body.velocity.x + 
                    this.body.velocity.y * this.body.velocity.y
                );
                this.isMoving = currentSpeed > 5; 
                
                if (time - this.lastAttackTime > this.attackCooldown) {
                    this.attackPlayer(player);
                    this.lastAttackTime = time;
                }
            }
            
            this.updateAnimation();
            this.updateShadowPosition();
        } catch (error) {
            console.error("Error in Zombie update:", error);
        }
    }
    
    applyZombieAvoidance() {
        if (!this.scene.zombieGroup) return;
        
        const avoidanceRadius = 25;
        const avoidanceForce = 15;
        let totalAvoidanceX = 0;
        let totalAvoidanceY = 0;
        let nearbyZombies = 0;
        
        this.scene.zombieGroup.children.entries.forEach(otherZombie => {
            if (otherZombie === this || otherZombie.isDead) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y, otherZombie.x, otherZombie.y
            );
            
            if (distance < avoidanceRadius && distance > 0) {
                const angle = Phaser.Math.Angle.Between(
                    otherZombie.x, otherZombie.y, this.x, this.y
                );
                
                const force = avoidanceForce * (1 - distance / avoidanceRadius);
                totalAvoidanceX += Math.cos(angle) * force;
                totalAvoidanceY += Math.sin(angle) * force;
                nearbyZombies++;
            }
        });
        
        if (nearbyZombies > 0) {
            this.body.velocity.x += totalAvoidanceX * 0.1;
            this.body.velocity.y += totalAvoidanceY * 0.1;
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
    
    updateAnimation() {
        if (this.isMoving) {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'zombieRunAni') {
                this.play('zombieRunAni');
            }
            if (this.lastDirection === 'right') {
                this.setFlipX(false);
            } else if (this.lastDirection === 'left') {
                this.setFlipX(true);
            }
        } else {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'zombieIdle') {
                this.play('zombieIdle');
            }
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
        
        // Destroy shadow with animation
        if (this.shadow) {
         this.scene.tweens.add({
          targets: this.shadow,
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
           if (this.shadow) {
            this.shadow.destroy();
            this.shadow = null;
           }
          }
         });
        }
        
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.enable = false;
        this.stop();
        
        if (this.scene.zombieGroup) {
            this.scene.zombieGroup.remove(this);
        }
        
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

	createShadow() {
		this.shadow = this.scene.add.graphics();
		this.shadow.setDepth(0);
		this.shadow.fillStyle(0x000000, 0.2);
		this.shadow.fillEllipse(0, 0, 12, 6);
        this.updateShadowPosition();
	}

	updateShadowPosition() {
		if (this.shadow && !this.isDead) {
			this.shadow.setPosition(this.x, this.y + 16);
			const baseScale = 1.0;
			const moveScale = this.isMoving ? 0.9 : 1.0;
			this.shadow.setScale(baseScale * moveScale);
		}
	}

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here