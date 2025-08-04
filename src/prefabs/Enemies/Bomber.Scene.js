// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Bomber extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x ?? 64, y ?? 64, texture || "Bomber_Activited_run_v01", frame ?? 0);

        /* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);
        this.body.setSize(28, 28, false);
        this.body.setOffset(18, 20);
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.damage = 35; 
        this.speed = 35;
        this.explosionRange = 80;
        this.triggerRange = 50; 
        this.explosionDelay = 1000; 
        this.isTriggered = false;
        this.triggerTime = 0;
        this.isDead = false;
        this.isMoving = false;
        this.lastDirection = 'down';
        this.flashTimer = 0;
        this.flashInterval = 200; 
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

    handleZombieCollision(zombie1, zombie2, bomber) {
        const distance = Phaser.Math.Distance.Between(
            zombie1.x, zombie1.y, zombie2.x, zombie2.y
        );

        if (distance < 28) {
            const angle = Phaser.Math.Angle.Between(
                zombie1.x, zombie1.y, zombie2.x, zombie2.y
            );

            const separationForce = 35;
            const pushX = Math.cos(angle) * separationForce;
            const pushY = Math.sin(angle) * separationForce;

            zombie2.body.velocity.x += pushX;
            zombie2.body.velocity.y += pushY;
            zombie1.body.velocity.x -= pushX;
            zombie1.body.velocity.y -= pushY;

            if (bomber) {
                bomber.body.velocity.x -= pushX * 0.4;
                bomber.body.velocity.y -= pushY * 0.4;
            }
        }
    }

    createAnimations() {
        if (!this.scene.anims.exists('Bomber Run')) {
            this.scene.anims.create({
                key: 'Bomber Run',
                frames: this.scene.anims.generateFrameNumbers('Bomber_Activited_run_v01', { start: 0, end: 7}),
                frameRate: 8,
                repeat: -1
            });
        }
        if (this.scene.textures.exists('bomber_explode') && !this.scene.anims.exists('Bomber Explode')) {
            this.scene.anims.create({
                key: 'Bomber Explode',
                frames: this.scene.anims.generateFrameNumbers('bomber_explode', { start: 0, end: 5}),
                frameRate: 15,
                repeat: 0 
            });
        }
       
        if (!this.scene.anims.exists('Bomber Idle')) {
            this.scene.anims.create({
                key: 'Bomber Idle',
                frames: [{ key: 'Bomber_Activited_run_v01', frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
        }
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 22, 35, 5, 0xff0000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(1);

        this.healthBarFg = this.scene.add.rectangle(
            this.x - 17.5, this.y - 22, 35, 5, 0x00ff00
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

        this.healthBarBg.setPosition(this.x, this.y - 15);
        this.healthBarFg.setPosition(this.x - 17.5, this.y - 15);

        const healthPercentage = this.health / this.maxHealth;
        this.healthBarFg.width = 35 * healthPercentage;
        if (this.isTriggered) {
            this.healthBarBg.setFillStyle(0xffaa00);
            this.healthBarFg.setFillStyle(0xff0000);
        }
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
            if (!this.isTriggered && distance <= this.triggerRange) {
                this.triggerExplosion(time);
            }
            if (this.isTriggered) {
                this.handleTriggeredState(time);
                if (time - this.triggerTime >= this.explosionDelay) {
                    this.explode();
                    return;
                }
            }
            const moveSpeed = this.isTriggered ? this.speed * 1.5 : this.speed;
            
            if (distance > 10) { 
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                const forceMultiplier = this.isTriggered ? 0.15 : 0.11;
                const forceX = Math.cos(angle) * moveSpeed * forceMultiplier;
                const forceY = Math.sin(angle) * moveSpeed * forceMultiplier;
                this.body.velocity.x += forceX;
                this.body.velocity.y += forceY;
                this.body.velocity.x *= 0.88; 
                this.body.velocity.y *= 0.88;
                
                if (!this.isTriggered) {
                    this.applyZombieAvoidance();
                }

                const maxSpeed = moveSpeed;
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
                this.isMoving = currentSpeed > 3;
            }

            this.updateAnimation();
            
            // Update shadow position
            this.updateShadowPosition();
        } catch (error) {
            console.error("Error in Bomber update:", error);
        }
    }

    triggerExplosion(time) {
        this.isTriggered = true;
        this.triggerTime = time;
        this.setTint(0xff6600);
        
        if (this.scene.sound && this.scene.sound.get('bomber_trigger')) {
            this.scene.sound.play('bomber_trigger');
        }
    }

    handleTriggeredState(time) {
        const timeLeft = this.explosionDelay - (time - this.triggerTime);
        const flashSpeed = Math.max(50, timeLeft * 0.2);
        
        if (time - this.flashTimer > flashSpeed) {
            if (this.tint === 0xffffff) {
                this.setTint(0xff0000); 
            } else {
                this.clearTint();
            }
            this.flashTimer = time;
        }
    }

    explode() {
        if (this.isDead) return;

        this.isDead = true;
        
        // Destroy shadow with animation
        if (this.shadow) {
        this.scene.tweens.add({
        targets: this.shadow,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        onComplete: () => {
        if (this.shadow) {
        this.shadow.destroy();
        this.shadow = null;
        }
        }
        });
        }
        
        this.body.enable = false;
        this.stop();
        this.createExplosionEffect();
        this.dealExplosionDamage();
        if (this.scene.sound && this.scene.sound.get('explosion')) {
            this.scene.sound.play('explosion');
        }

        if (this.scene.zombieGroup) {
            this.scene.zombieGroup.remove(this);
        }
        this.scene.tweens.add({
            targets: this,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => this.cleanupAndDestroy()
        });

        this.spawnRewards();
    }

    createExplosionEffect() {
        const explosionCircle = this.scene.add.circle(this.x, this.y, 0, 0xff4400, 0.7);
        explosionCircle.setDepth(100);

        this.scene.tweens.add({
            targets: explosionCircle,
            radius: this.explosionRange,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => explosionCircle.destroy()
        });
    }

    dealExplosionDamage() {
        const player = this.scene.player;
        if (player && player.active) {
            const playerDistance = Phaser.Math.Distance.Between(
                this.x, this.y, player.x, player.y
            );
            
            if (playerDistance <= this.explosionRange) {
                const damageMultiplier = 1 - (playerDistance / this.explosionRange);
                const finalDamage = Math.floor(this.damage * damageMultiplier);
                if (player.takeDamage) {
                    player.takeDamage(finalDamage);
                }
            }
        }
        if (this.scene.zombieGroup) {
            this.scene.zombieGroup.children.entries.forEach(enemy => {
                if (enemy === this || enemy.isDead || !enemy.active) return;
                
                const enemyDistance = Phaser.Math.Distance.Between(
                    this.x, this.y, enemy.x, enemy.y
                );
                
                if (enemyDistance <= this.explosionRange) {
                    const damageMultiplier = 1 - (enemyDistance / this.explosionRange);
                    const finalDamage = Math.floor(this.damage * 0.5 * damageMultiplier);
                    if (enemy.takeDamage) {
                        enemy.takeDamage(finalDamage);
                    }
                }
            });
        }
    }

    applyZombieAvoidance() {
        if (!this.scene.zombieGroup) return;

        const avoidanceRadius = 30;
        const avoidanceForce = 18;
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
            this.body.velocity.x += totalAvoidanceX * 0.07;
            this.body.velocity.y += totalAvoidanceY * 0.07;
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
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Bomber Run') {
                this.play('Bomber Run');
                if (this.isTriggered) {
                    this.anims.msPerFrame = 80; 
                }
            }

            if (this.lastDirection === 'right') {
                this.setFlipX(false);
            } else if (this.lastDirection === 'left') {
                this.setFlipX(true);
            }
        } else {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Bomber Idle') {
                this.play('Bomber Idle');
            }
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        this.updateHealthBar();

        this.setTint(0xff0000);
        this.scene.time.delayedCall(120, () => {
            if (this.active && !this.isTriggered) {
                this.clearTint();
            }
        });

        if (this.health <= 0) {
            this.explode(); 
        }
    }

    spawnRewards() {
        try {
            if (this.scene.spawnExperienceOrb) {
                const orbCount = Phaser.Math.Between(2, 4);

                for (let i = 0; i < orbCount; i++) {
                    const xOffset = Phaser.Math.Between(-20, 20);
                    const yOffset = Phaser.Math.Between(-20, 20);

                    this.scene.spawnExperienceOrb(
                        this.x + xOffset, 
                        this.y + yOffset, 
                        3 
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
    // Clean up shadow
    if (this.shadow) {
    this.shadow.destroy();
    this.shadow = null;
    }
    
    try {
    if (this.scene && this.updateListener) {
      this.scene.events.off('update', this.updateListener);
     this.updateListener = null;
     }
			if (this.scene && this.scene.zombieGroup && this.scene.zombieGroup.children) {
				this.scene.zombieGroup.remove(this);
			}
		} catch (error) {
			console.error("Error in destroy method:", error);
		}

        super.destroy(fromScene);
        }

	createShadow() {
		this.shadow = this.scene.add.graphics();
		this.shadow.setDepth(0);
		this.shadow.fillStyle(0x000000, 0.2);
		this.shadow.fillEllipse(0, -10, 24, 12);
		this.updateShadowPosition();
	}

	updateShadowPosition() {
		if (this.shadow && !this.isDead) {
			this.shadow.setPosition(this.x, this.y + 18);
			const baseScale = 1.0;
			const moveScale = this.isMoving ? 0.9 : 1.0;
			const triggerScale = this.isTriggered ? 1.2 : 1.0;
			this.shadow.setScale(baseScale * moveScale * triggerScale);
		}
	}

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here