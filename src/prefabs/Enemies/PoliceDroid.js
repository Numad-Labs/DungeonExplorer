// You can write more code here

// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PoliceDroid extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x ?? 191, y ?? 94, texture || "Police run", frame ?? 0);

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(16, 16, false);
    this.body.setOffset(14, 32);

    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.damage = 10;
    this.speed = 50;
    this.attackRange = 120; // Increased range for shooting
    this.attackCooldown = 1500; // Slightly longer cooldown for shooting
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false;
    this.lastDirection = "down";
    this.createAnimations();
    this.addToZombieGroup(scene);
    this.createShadow();
    this.updateListener = this.update.bind(this);
    scene.events.on("update", this.updateListener);
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  addToZombieGroup(scene) {
    if (!scene.zombieGroup) {
      scene.zombieGroup = scene.physics.add.group();
      scene.physics.add.collider(
        scene.zombieGroup,
        scene.zombieGroup,
        this.handleZombieCollision,
        null,
        scene
      );
    }
    scene.zombieGroup.add(this);
  }

  handleZombieCollision(zombie1, zombie2, policeDroid) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y,
      policeDroid.x,
      policeDroid.y
    );

    if (distance < 20) {
      const angle = Phaser.Math.Angle.Between(
        zombie1.x,
        zombie1.y,
        zombie2.x,
        zombie2.y,
        policeDroid.x,
        policeDroid.y
      );

      const separationForce = 30;
      const pushX = Math.cos(angle) * separationForce;
      const pushY = Math.sin(angle) * separationForce;

      zombie2.body.velocity.x += pushX;
      zombie2.body.velocity.y += pushY;
      zombie1.body.velocity.x -= pushX;
      zombie1.body.velocity.y -= pushY;
      policeDroid.body.velocity.x -= pushX;
      policeDroid.body.velocity.y -= pushY;
    }
  }

  createAnimations() {
    if (!this.scene.anims.exists("PoliceDroid")) {
      this.scene.anims.create({
        key: "PoliceDroid",
        frames: this.scene.anims.generateFrameNumbers("Police run", {
          start: 0,
          end: 10,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.scene.anims.exists("PoliceDroidIdle")) {
      this.scene.anims.create({
        key: "PoliceDroidIdle",
        frames: [{ key: "Police run", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
    if (!this.scene.anims.exists("PoliceDeath")) {
      this.scene.anims.create({
        key: "PoliceDeath",
        frames: this.scene.anims.generateFrameNumbers("Police Death", {
          start: 0,
          end: 6,
        }),
        frameRate: 6,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("PoliceDroidShooter")) {
      this.scene.anims.create({
        key: "PoliceDroidShooter",
        frames: this.scene.anims.generateFrameNumbers("Police shooter", {
          start: 0,
          end: 8,
        }),
        frameRate: 10, // Slightly faster for more dynamic shooting
        repeat: 0,
      });
    }
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
        this.x,
        this.y,
        player.x,
        player.y
      );

      if (distance > this.attackRange) {
        // Move towards player
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          player.x,
          player.y
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
        // Stop and prepare to shoot
        this.body.velocity.x *= 0.8;
        this.body.velocity.y *= 0.8;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 5 && !this.isAttacking;

        // Face the player when shooting
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          player.x,
          player.y
        );
        this.updateDirection(angle);

        if (time - this.lastAttackTime > this.attackCooldown && !this.isAttacking) {
          this.shootAtPlayer(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();

      // Update shadow position
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in DroidPolice update:", error);
    }
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup) return;

    const avoidanceRadius = 25;
    const avoidanceForce = 15;
    let totalAvoidanceX = 0;
    let totalAvoidanceY = 0;
    let nearbyZombies = 0;

    this.scene.zombieGroup.children.entries.forEach((otherZombie) => {
      if (otherZombie === this || otherZombie.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        otherZombie.x,
        otherZombie.y
      );

      if (distance < avoidanceRadius && distance > 0) {
        const angle = Phaser.Math.Angle.Between(
          otherZombie.x,
          otherZombie.y,
          this.x,
          this.y
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
      this.lastDirection = "right";
    } else if (angleInDegrees >= 45 && angleInDegrees < 135) {
      this.lastDirection = "down";
    } else if (angleInDegrees >= 135 || angleInDegrees < -135) {
      this.lastDirection = "left";
    } else {
      this.lastDirection = "up";
    }
  }

  updateAnimation() {
    if (this.isAttacking) {
      // Attack animation takes priority
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "PoliceDroidShooter"
      ) {
        this.play("PoliceDroidShooter");
      }
    } else if (this.isMoving) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "PoliceDroid"
      ) {
        this.play("PoliceDroid");
      }
    } else {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "PoliceDroidIdle"
      ) {
        this.play("PoliceDroidIdle");
      }
    }

    // Update sprite direction
    if (this.lastDirection === "right") {
      this.setFlipX(false);
    } else if (this.lastDirection === "left") {
      this.setFlipX(true);
    }
  }

  // Enhanced shooting method with visual effects
  shootAtPlayer(player) {
    if (!player || !player.takeDamage) return;

    this.isAttacking = true;

    // Stop movement during attack
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    // Play shooting animation
    this.play("PoliceDroidShooter");

    // Create muzzle flash effect
    this.createMuzzleFlash();

    // Create bullet trail effect
    this.createBulletTrail(player);

    // Play shooting sound (if you have audio)
    // this.scene.sound.play('gunshot', { volume: 0.3 });

    // Listen for attack animation completion
    this.once('animationcomplete', (animation) => {
      if (animation.key === "PoliceDroidShooter") {
        this.isAttacking = false;
      }
    });

    // Deal damage after a short delay (bullet travel time)
    this.scene.time.delayedCall(300, () => {
      if (player && player.takeDamage) {
        player.takeDamage(this.damage);
        this.createHitEffect(player);
      }
    });

    // Brief red tint for shooting
    this.setTint(0xffaa00);
    this.scene.time.delayedCall(150, () => {
      this.clearTint();
    });

    this.lastAttackTime = this.scene.time.now;
  }

  // Create muzzle flash effect
  createMuzzleFlash() {
    const muzzleFlash = this.scene.add.graphics();
    
    // Position muzzle flash at the front of the droid
    let flashX = this.x;
    let flashY = this.y;
    
    switch(this.lastDirection) {
      case "right":
        flashX += 20;
        break;
      case "left":
        flashX -= 20;
        break;
      case "up":
        flashY -= 15;
        break;
      case "down":
        flashY += 15;
        break;
    }

    muzzleFlash.setPosition(flashX, flashY);
    muzzleFlash.fillCircle(0, 0, 8);
    muzzleFlash.fillCircle(0, 0, 4);
    this.scene.tweens.add({
      targets: muzzleFlash,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        muzzleFlash.destroy();
      }
    });
  }

  // Create bullet trail effect
  createBulletTrail(target) {
    const bulletTrail = this.scene.add.graphics();
    bulletTrail.lineStyle(2, 0xffff00, 0.8);
    bulletTrail.moveTo(this.x, this.y);
    bulletTrail.lineTo(target.x, target.y);

    // Fade out the trail
    this.scene.tweens.add({
      targets: bulletTrail,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        bulletTrail.destroy();
      }
    });
  }

  // Create hit effect on target
  createHitEffect(target) {
    const hitEffect = this.scene.add.graphics();
    hitEffect.setPosition(target.x, target.y);
    // hitEffect.fillStyle(0xff0000, 0.6);
    hitEffect.fillCircle(0, 0, 12);
    // hitEffect.fillStyle(0xffffff, 0.8);
    hitEffect.fillCircle(0, 0, 6);

    // Animate hit effect
    this.scene.tweens.add({
      targets: hitEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        hitEffect.destroy();
      }
    });
  }

  // Keep the old method name for compatibility
  attackPlayer(player) {
    this.shootAtPlayer(player);
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

    if (
      this.scene &&
      this.scene.zombieGroup &&
      this.scene.zombieGroup.children
    ) {
      this.scene.zombieGroup.remove(this);
    }
    this.stop();
    this.play("PoliceDeath", false); 
    this.once('animationcomplete', (animation) => {
      if (animation.key === "PoliceDeath") {
        this.cleanupAndDestroy();
      }
    })
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    this.spawnRewards();
  }

  spawnRewards() {
    try {
      if (this.scene.spawnExperienceOrb) {
        const orbCount = Phaser.Math.Between(1, 3);

        for (let i = 0; i < orbCount; i++) {
          const xOffset = Phaser.Math.Between(-10, 10);
          const yOffset = Phaser.Math.Between(-10, 10);

          this.scene.spawnExperienceOrb(this.x + xOffset, this.y + yOffset, 1);
        }
      }
    } catch (error) {
      console.error("Error spawning rewards:", error);
    }
  }

  cleanupAndDestroy() {
    try {
      if (this.scene && this.updateListener) {
        this.scene.events.off("update", this.updateListener);
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
        this.scene.events.off("update", this.updateListener);
        this.updateListener = null;
      }
      if (
        this.scene &&
        this.scene.zombieGroup &&
        this.scene.zombieGroup.children
      ) {
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
    this.shadow.fillEllipse(0, 0, 20, 10);
    this.updateShadowPosition();
  }

  updateShadowPosition() {
    if (this.shadow && !this.isDead) {
      this.shadow.setPosition(this.x, this.y + 18);
      const baseScale = 1.0;
      const moveScale = this.isMoving ? 0.95 : 1.0;
      this.shadow.setScale(baseScale * moveScale);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here