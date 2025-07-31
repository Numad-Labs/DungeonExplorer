// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Wreacker extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x ?? 48, y ?? 48, texture || "WreackerRun", frame ?? 0);

        /* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);
        this.body.setSize(24, 24, false);
        this.body.setOffset(12, 24);

        // Wreacker stats - faster and more aggressive than BigDude
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.damage = 15;
        this.speed = 60; // Faster than BigDude
        this.attackRange = 30; // Medium range
        this.attackCooldown = 800; // Faster attacks
        this.lastAttackTime = 0;
        this.isDead = false;
        this.isMoving = false;

        this.lastDirection = 'down';
        this.createHealthBar();
        this.createAnimations();
        this.addToZombieGroup(scene);
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

    handleZombieCollision(zombie1, zombie2, wreacker) {
        const distance = Phaser.Math.Distance.Between(
            zombie1.x, zombie1.y, zombie2.x, zombie2.y
        );

        if (distance < 25) { // Medium collision radius for Wreacker
            const angle = Phaser.Math.Angle.Between(
                zombie1.x, zombie1.y, zombie2.x, zombie2.y
            );

            const separationForce = 30; // Medium push force
            const pushX = Math.cos(angle) * separationForce;
            const pushY = Math.sin(angle) * separationForce;

            zombie2.body.velocity.x += pushX;
            zombie2.body.velocity.y += pushY;
            zombie1.body.velocity.x -= pushX;
            zombie1.body.velocity.y -= pushY;

            if (wreacker) {
                wreacker.body.velocity.x -= pushX * 0.7; // Wreacker is moderately affected
                wreacker.body.velocity.y -= pushY * 0.7;
            }
        }
    }

    createAnimations() {
        // Create Wreacker Run animation using WreackerRun texture
        if (!this.scene.anims.exists('WreackerRun')) {
            this.scene.anims.create({
                key: 'WreackerRun',
                frames: this.scene.anims.generateFrameNumbers('WreackerRun', { start: 0, end: 7}),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Create attack animation if attack texture exists
        if (this.scene.textures.exists('WreackerAttack') && !this.scene.anims.exists('Wreacker Attack')) {
            this.scene.anims.create({
                key: 'Wreacker Attack',
                frames: this.scene.anims.generateFrameNumbers('WreackerAttack', { start: 0, end: 5}),
                frameRate: 10,
                repeat: 0 // Play once for attack
            });
        }
        
        // Create idle animation
        if (!this.scene.anims.exists('Wreacker Idle')) {
            this.scene.anims.create({
                key: 'Wreacker Idle',
                frames: [{ key: 'WreackerRun', frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
        }
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 20, 35, 5, 0xff0000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(1);

        this.healthBarFg = this.scene.add.rectangle(
            this.x - 17.5, this.y - 20, 35, 5, 0x00ff00
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

        this.healthBarBg.setPosition(this.x, this.y - 12);
        this.healthBarFg.setPosition(this.x - 17.5, this.y - 12);

        const healthPercentage = this.health / this.maxHealth;
        this.healthBarFg.width = 35 * healthPercentage;
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
                // Move towards player - Wreacker is more aggressive
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                const forceX = Math.cos(angle) * this.speed * 0.12; // Slightly more aggressive
                const forceY = Math.sin(angle) * this.speed * 0.12;
                this.body.velocity.x += forceX;
                this.body.velocity.y += forceY;
                this.body.velocity.x *= 0.88; // Less damping for snappier movement
                this.body.velocity.y *= 0.88;
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
                // Stop and attack
                this.body.velocity.x *= 0.75;
                this.body.velocity.y *= 0.75;
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
        } catch (error) {
            console.error("Error in Wreacker update:", error);
        }
    }

    applyZombieAvoidance() {
        if (!this.scene.zombieGroup) return;

        const avoidanceRadius = 30; // Medium avoidance radius
        const avoidanceForce = 18; // Medium avoidance force
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
            this.body.velocity.x += totalAvoidanceX * 0.1; // Standard avoidance effect
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
            // Use run animation when moving
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'WreackerRun') {
                this.play('WreackerRun');
            }
            // Handle flipping for direction
            if (this.lastDirection === 'right') {
                this.setFlipX(false);
            } else if (this.lastDirection === 'left') {
                this.setFlipX(true);
            }
        } else {
            // Use idle animation when not moving
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Wreacker Idle') {
                this.play('Wreacker Idle');
            }
        }
    }

    attackPlayer(player) {
        if (!player || !player.takeDamage) return;

        // Play attack animation if it exists, otherwise use a tint effect
        if (this.scene.anims.exists('Wreacker Attack')) {
            this.play('Wreacker Attack');
            
            // Deal damage after animation delay
            this.scene.time.delayedCall(250, () => {
                if (player && player.takeDamage && !this.isDead) {
                    player.takeDamage(this.damage);
                }
            });
        } else {
            // Fallback: immediate damage with visual effect
            player.takeDamage(this.damage);
        }

        this.setTint(0xff4400); // Red-orange tint for attack
        this.scene.time.delayedCall(150, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        this.lastAttackTime = this.scene.time.now;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        this.updateHealthBar();

        this.setTint(0xff0000);
        this.scene.time.delayedCall(120, () => {
            if (this.active) {
                this.clearTint();
            }
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
        this.stop();

        if (this.scene.zombieGroup) {
            this.scene.zombieGroup.remove(this);
        }

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.6,
            duration: 400,
            onComplete: () => this.cleanupAndDestroy()
        });

        this.spawnRewards();
    }

    spawnRewards() {
        try {
            if (this.scene.spawnExperienceOrb) {
                const orbCount = Phaser.Math.Between(2, 4); // Medium rewards

                for (let i = 0; i < orbCount; i++) {
                    const xOffset = Phaser.Math.Between(-12, 12);
                    const yOffset = Phaser.Math.Between(-12, 12);

                    this.scene.spawnExperienceOrb(
                        this.x + xOffset, 
                        this.y + yOffset, 
                        1.5 // Medium experience value
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
            if (this.scene && this.scene.zombieGroup && this.scene.zombieGroup.children) {
                this.scene.zombieGroup.remove(this);
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