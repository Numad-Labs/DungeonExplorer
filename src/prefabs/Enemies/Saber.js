// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Saber extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(
      scene,
      x ?? 64,
      y ?? 64,
      texture || "saber_run_53x53_v01",
      frame ?? 0
    );

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(36, 36, false);
    this.body.setOffset(8, 8);
    this.maxHealth = 60;
    this.health = this.maxHealth;
    this.damage = 20;
    this.speed = 55; // Fastest enemy
    this.attackRange = 35;
    this.attackCooldown = 600; // Very fast attacks
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false;
    this.lastDirection = "down";
    this.dashCooldown = 3000; // Dash ability every 3 seconds
    this.lastDashTime = 0;
    this.dashSpeed = 120;
    this.dashDuration = 300;
    this.isDashing = false;
    this.dashStartTime = 0;
    // this.createHealthBar();
    this.createAnimations();
    this.addToZombieGroup(scene);
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

  handleZombieCollision(zombie1, zombie2, saber) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y
    );

    if (distance < 32) {
      const angle = Phaser.Math.Angle.Between(
        zombie1.x,
        zombie1.y,
        zombie2.x,
        zombie2.y
      );

      const separationForce = 25; // Less separation force for agile enemy
      const pushX = Math.cos(angle) * separationForce;
      const pushY = Math.sin(angle) * separationForce;

      zombie2.body.velocity.x += pushX;
      zombie2.body.velocity.y += pushY;
      zombie1.body.velocity.x -= pushX;
      zombie1.body.velocity.y -= pushY;

      if (saber && !saber.isDashing) {
        // Don't affect dash movement
        saber.body.velocity.x -= pushX * 0.2;
        saber.body.velocity.y -= pushY * 0.2;
      }
    }
  }

  createAnimations() {
    if (!this.scene.anims.exists("Saber Run")) {
      this.scene.anims.create({
        key: "Saber Run",
        frames: this.scene.anims.generateFrameNumbers("saber_run_53x53_v01", {
          start: 0,
          end: 7,
        }),
        frameRate: 12, // Fast animation
        repeat: -1,
      });
    }

    // Check if attack animation exists
    if (
      this.scene.textures.exists("saber_attack") &&
      !this.scene.anims.exists("Saber Attack")
    ) {
      this.scene.anims.create({
        key: "Saber Attack",
        frames: this.scene.anims.generateFrameNumbers("saber_attack", {
          start: 0,
          end: 5,
        }),
        frameRate: 15,
        repeat: 0,
      });
    }

    // Check if dash animation exists
    if (
      this.scene.textures.exists("saber_dash") &&
      !this.scene.anims.exists("Saber Dash")
    ) {
      this.scene.anims.create({
        key: "Saber Dash",
        frames: this.scene.anims.generateFrameNumbers("saber_dash", {
          start: 0,
          end: 3,
        }),
        frameRate: 20,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("Saber Idle")) {
      this.scene.anims.create({
        key: "Saber Idle",
        frames: [{ key: "saber_run_53x53_v01", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(
      this.x,
      this.y - 25,
      38,
      5,
      0xff0000
    );
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.setDepth(1);

    this.healthBarFg = this.scene.add.rectangle(
      this.x - 19,
      this.y - 25,
      38,
      5,
      0x00ff00
    );
    this.healthBarFg.setOrigin(0, 0.5);
    this.healthBarFg.setDepth(20);

    this.on("destroy", () => {
      if (this.healthBarBg) this.healthBarBg.destroy();
      if (this.healthBarFg) this.healthBarFg.destroy();
    });

    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBarFg || !this.healthBarBg) return;

    this.healthBarBg.setPosition(this.x, this.y - 18);
    this.healthBarFg.setPosition(this.x - 19, this.y - 18);

    const healthPercentage = this.health / this.maxHealth;
    this.healthBarFg.width = 38 * healthPercentage;

    // Change color when dashing
    if (this.isDashing) {
      this.healthBarBg.setFillStyle(0x00aaff); // Blue background when dashing
      this.healthBarFg.setFillStyle(0x00ffff); // Cyan foreground when dashing
    } else {
      this.healthBarBg.setFillStyle(0xff0000);
      this.healthBarFg.setFillStyle(0x00ff00);
    }
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

      // Handle dash ability
      if (
        !this.isDashing &&
        time - this.lastDashTime > this.dashCooldown &&
        distance > 80 &&
        distance < 200
      ) {
        this.startDash(player, time);
      }

      // Handle dash movement
      if (this.isDashing) {
        this.handleDash(time);
        return; // Skip normal movement while dashing
      }

      // Normal movement and combat
      if (distance > this.attackRange) {
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          player.x,
          player.y
        );
        const forceX = Math.cos(angle) * this.speed * 0.14; // More aggressive than others
        const forceY = Math.sin(angle) * this.speed * 0.14;
        this.body.velocity.x += forceX;
        this.body.velocity.y += forceY;
        this.body.velocity.x *= 0.92; // Less friction for agile movement
        this.body.velocity.y *= 0.92;
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
        this.isAttacking = false;
        this.updateDirection(angle);
      } else {
        this.body.velocity.x *= 0.85;
        this.body.velocity.y *= 0.85;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 4;

        if (time - this.lastAttackTime > this.attackCooldown) {
          this.attackPlayer(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();
    } catch (error) {
      console.error("Error in Saber update:", error);
    }
  }

  startDash(player, time) {
    this.isDashing = true;
    this.dashStartTime = time;
    this.lastDashTime = time;

    // Calculate dash direction toward player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

    // Set dash velocity
    this.body.velocity.x = Math.cos(angle) * this.dashSpeed;
    this.body.velocity.y = Math.sin(angle) * this.dashSpeed;

    // Visual effect
    this.setTint(0x00ffff); // Cyan tint during dash

    // Play dash sound if available
    if (this.scene.sound && this.scene.sound.get("saber_dash")) {
      this.scene.sound.play("saber_dash");
    }

    this.updateDirection(angle);
  }

  handleDash(time) {
    if (time - this.dashStartTime >= this.dashDuration) {
      // End dash
      this.isDashing = false;
      this.clearTint();
      this.body.velocity.x *= 0.3; // Slow down after dash
      this.body.velocity.y *= 0.3;
    }

    // Dash doesn't avoid other zombies - it goes through them
    this.isMoving = true;
    this.updateAnimation();
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup || this.isDashing) return;

    const avoidanceRadius = 28; // Smaller avoidance for agile enemy
    const avoidanceForce = 12;
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
      this.body.velocity.x += totalAvoidanceX * 0.05;
      this.body.velocity.y += totalAvoidanceY * 0.05;
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
    if (this.isDashing) {
      if (this.scene.anims.exists("Saber Dash")) {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Saber Dash"
        ) {
          this.play("Saber Dash");
        }
      } else {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Saber Run"
        ) {
          this.play("Saber Run");
        }
      }
    } else if (this.isAttacking) {
      if (this.scene.anims.exists("Saber Attack")) {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Saber Attack"
        ) {
          this.play("Saber Attack");
        }
      }
    } else if (this.isMoving) {
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== "Saber Run") {
        this.play("Saber Run");
      }
    } else {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Saber Idle"
      ) {
        this.play("Saber Idle");
      }
    }

    // Handle flipping
    if (this.lastDirection === "right") {
      this.setFlipX(false);
    } else if (this.lastDirection === "left") {
      this.setFlipX(true);
    }
  }

  attackPlayer(player) {
    if (!player || !player.takeDamage) return;

    this.isAttacking = true;

    if (this.scene.anims.exists("Saber Attack")) {
      this.play("Saber Attack");
      this.scene.time.delayedCall(200, () => {
        // Fast attack timing
        if (player && player.takeDamage && !this.isDead) {
          player.takeDamage(this.damage);
        }
        this.isAttacking = false;
      });
    } else {
      player.takeDamage(this.damage);
      this.scene.time.delayedCall(300, () => {
        this.isAttacking = false;
      });
    }

    this.setTint(0xffff00); // Yellow flash for slash attack
    this.scene.time.delayedCall(100, () => {
      if (this.active && !this.isDashing) {
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
    this.scene.time.delayedCall(100, () => {
      if (this.active && !this.isDashing && !this.isAttacking) {
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
      rotation: this.rotation + Math.PI, // Spin on death
      duration: 450,
      ease: "Power2",
      onComplete: () => this.cleanupAndDestroy(),
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
            2 // Good experience value
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
        this.scene.events.off("update", this.updateListener);
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

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
