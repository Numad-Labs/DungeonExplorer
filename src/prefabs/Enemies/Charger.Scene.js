// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Charger extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x ?? 64, y ?? 64, texture || "Charger_run_32x32_v01", frame ?? 0);

        /* START-USER-CTR-CODE */
        scene.physics.add.existing(this, false);
        this.body.setSize(32, 32, false);
        this.body.setOffset(0, 0);
        this.maxHealth = 60;
        this.health = this.maxHealth;
        this.damage = 35;
        this.speed = 50;
        this.chargeSpeed = 120; // Speed during charge attack
        this.attackRange = 80; // Longer range to trigger charge
        this.chargeRange = 150; // Max charge distance
        this.attackCooldown = 2000;
        this.lastAttackTime = 0;
        this.isDead = false;
        this.isMoving = false;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.chargeDuration = 800; // How long charge lasts
        this.chargeDirection = { x: 0, y: 0 };
        this.lastDirection = 'down';
        this.createHealthBar();
        this.createAnimations();
        this.addToChargerGroup(scene);
        this.updateListener = this.update.bind(this);
        scene.events.on('update', this.updateListener);
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */

    addToChargerGroup(scene) {
        if (!scene.chargerGroup) {
            scene.chargerGroup = scene.physics.add.group();
            scene.physics.add.collider(scene.chargerGroup, scene.chargerGroup, 
                this.handleChargerCollision, null, scene);
        }
        scene.chargerGroup.add(this);
    }

    handleChargerCollision(charger1, charger2) {
        const distance = Phaser.Math.Distance.Between(
            charger1.x, charger1.y, charger2.x, charger2.y
        );

        if (distance < 35) {
            const angle = Phaser.Math.Angle.Between(
                charger1.x, charger1.y, charger2.x, charger2.y
            );

            const separationForce = 50;
            const pushX = Math.cos(angle) * separationForce;
            const pushY = Math.sin(angle) * separationForce;

            charger2.body.velocity.x += pushX;
            charger2.body.velocity.y += pushY;
            charger1.body.velocity.x -= pushX;
            charger1.body.velocity.y -= pushY;
        }
    }

    createAnimations() {
        if (!this.scene.anims.exists('Charger Run')) {
            this.scene.anims.create({
                key: 'Charger Run',
                frames: this.scene.anims.generateFrameNumbers('Charger_run_32x32_v01', { start: 0, end: 7}),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('Charger Charge')) {
            this.scene.anims.create({
                key: 'Charger Charge',
                frames: this.scene.anims.generateFrameNumbers('Charger_run_32x32_v01', { start: 0, end: 7}),
                frameRate: 12, // Faster animation during charge
                repeat: -1
            });
        }
       
        if (!this.scene.anims.exists('Charger Idle')) {
            this.scene.anims.create({
                key: 'Charger Idle',
                frames: [{ key: 'Charger_run_32x32_v01', frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
        }
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 25, 35, 5, 0xff0000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.healthBarBg.setDepth(1);

        this.healthBarFg = this.scene.add.rectangle(
            this.x - 17.5, this.y - 25, 35, 5, 0x00ff00
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

        this.healthBarBg.setPosition(this.x, this.y - 20);
        this.healthBarFg.setPosition(this.x - 17.5, this.y - 20);

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

            // Handle charging behavior
            if (this.isCharging) {
                this.updateCharge(time);
            } else if (distance <= this.attackRange && distance > 20 && 
                      time - this.lastAttackTime > this.attackCooldown) {
                // Start charge attack
                this.startCharge(player);
            } else if (distance > this.attackRange) {
                // Normal movement toward player
                this.moveTowardPlayer(player);
            } else {
                // Close to player but not charging - slow movement
                this.body.velocity.x *= 0.8;
                this.body.velocity.y *= 0.8;
                this.isMoving = Math.abs(this.body.velocity.x) > 5 || Math.abs(this.body.velocity.y) > 5;
            }

            this.updateAnimation();
        } catch (error) {
            console.error("Error in Charger update:", error);
        }
    }

    startCharge(player) {
        this.isCharging = true;
        this.chargeStartTime = this.scene.time.now;
        this.lastAttackTime = this.scene.time.now;

        // Calculate charge direction
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            player.x, player.y
        );

        this.chargeDirection.x = Math.cos(angle);
        this.chargeDirection.y = Math.sin(angle);
        this.updateDirection(angle);

        // Visual effect for charge start
        this.setTint(0xffaa00);
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.clearTint();
            }
        });
    }

    updateCharge(time) {
        const chargeTime = time - this.chargeStartTime;
        
        if (chargeTime < this.chargeDuration) {
            // Apply charge velocity
            this.body.velocity.x = this.chargeDirection.x * this.chargeSpeed;
            this.body.velocity.y = this.chargeDirection.y * this.chargeSpeed;
            this.isMoving = true;

            // Check for collision with player during charge
            const player = this.scene.player;
            if (player) {
                const distance = Phaser.Math.Distance.Between(
                    this.x, this.y, player.x, player.y
                );
                
                if (distance < 25) {
                    this.hitPlayer(player);
                }
            }
        } else {
            // End charge
            this.isCharging = false;
            this.body.velocity.x *= 0.3;
            this.body.velocity.y *= 0.3;
        }
    }

    moveTowardPlayer(player) {
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            player.x, player.y
        );
        const forceX = Math.cos(angle) * this.speed * 0.1;
        const forceY = Math.sin(angle) * this.speed * 0.1;
        
        this.body.velocity.x += forceX;
        this.body.velocity.y += forceY;
        this.body.velocity.x *= 0.85; 
        this.body.velocity.y *= 0.85;
        
        this.applyChargerAvoidance();

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
    }

    applyChargerAvoidance() {
        if (!this.scene.chargerGroup) return;

        const avoidanceRadius = 40; 
        const avoidanceForce = 25; 
        let totalAvoidanceX = 0;
        let totalAvoidanceY = 0;
        let nearbyChargers = 0;

        this.scene.chargerGroup.children.entries.forEach(otherCharger => {
            if (otherCharger === this || otherCharger.isDead) return;

            const distance = Phaser.Math.Distance.Between(
                this.x, this.y, otherCharger.x, otherCharger.y
            );

            if (distance < avoidanceRadius && distance > 0) {
                const angle = Phaser.Math.Angle.Between(
                    otherCharger.x, otherCharger.y, this.x, this.y
                );

                const force = avoidanceForce * (1 - distance / avoidanceRadius);
                totalAvoidanceX += Math.cos(angle) * force;
                totalAvoidanceY += Math.sin(angle) * force;
                nearbyChargers++;
            }
        });

        if (nearbyChargers > 0) {
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
        if (this.isCharging) {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Charger Charge') {
                this.play('Charger Charge');
            }
        } else if (this.isMoving) {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Charger Run') {
                this.play('Charger Run');
            }
        } else {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'Charger Idle') {
                this.play('Charger Idle');
            }
        }

        // Handle sprite flipping
        if (this.lastDirection === 'right') {
            this.setFlipX(false);
        } else if (this.lastDirection === 'left') {
            this.setFlipX(true);
        }
    }

    hitPlayer(player) {
        if (!player || !player.takeDamage || this.isDead) return;
        
        player.takeDamage(this.damage);

        // Flash effect
        this.setTint(0xff4400);
        this.scene.time.delayedCall(200, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        // End charge early after hitting
        this.isCharging = false;
        this.body.velocity.x *= 0.2;
        this.body.velocity.y *= 0.2;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        this.updateHealthBar();

        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        // Interrupt charge if damaged
        if (this.isCharging) {
            this.isCharging = false;
            this.body.velocity.x *= 0.5;
            this.body.velocity.y *= 0.5;
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.isCharging = false;

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.enable = false;
        this.stop();

        if (this.scene.chargerGroup) {
            this.scene.chargerGroup.remove(this);
        }

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.8,
            duration: 400,
            onComplete: () => this.cleanupAndDestroy()
        });

        this.spawnRewards();
    }

    spawnRewards() {
        try {
            if (this.scene.spawnExperienceOrb) {
                const orbCount = Phaser.Math.Between(2, 5);

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
            if (this.scene.chargerGroup) {
                this.scene.chargerGroup.remove(this);
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