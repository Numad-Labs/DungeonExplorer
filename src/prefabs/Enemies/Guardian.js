// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Guardian extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(
      scene,
      x ?? 64,
      y ?? 64,
      texture || "guradian_walk224x45",
      frame ?? 0
    );

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(60, 40, false);
    this.body.setOffset(82, 25);
    this.maxHealth = 200;
    this.health = this.maxHealth;
    this.damage = 35;
    this.speed = 25;
    this.attackRange = 60;
    this.attackCooldown = 2000;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false;
    this.lastDirection = "down";

    this.chargeAbilityCooldown = 8000;
    this.lastChargeTime = 0;
    this.isCharging = false;
    this.chargeSpeed = 100;
    this.chargeDuration = 1000;
    this.chargeStartTime = 0;
    this.chargeDistance = 150;

    this.shieldAbilityCooldown = 12000;
    this.lastShieldTime = 0;
    this.isShielded = false;
    this.shieldDuration = 4000;
    this.shieldStartTime = 0;

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

  handleZombieCollision(zombie1, zombie2, guardian) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y
    );

    if (distance < 50) {
      const angle = Phaser.Math.Angle.Between(
        zombie1.x,
        zombie1.y,
        zombie2.x,
        zombie2.y
      );

      const separationForce = 60;
      const pushX = Math.cos(angle) * separationForce;
      const pushY = Math.sin(angle) * separationForce;

      if (guardian === zombie1) {
        zombie2.body.velocity.x += pushX * 2;
        zombie2.body.velocity.y += pushY * 2;
        guardian.body.velocity.x -= pushX * 0.1;
        guardian.body.velocity.y -= pushY * 0.1;
      } else if (guardian === zombie2) {
        zombie1.body.velocity.x -= pushX * 2;
        zombie1.body.velocity.y -= pushY * 2;
        guardian.body.velocity.x += pushX * 0.1;
        guardian.body.velocity.y += pushY * 0.1;
      } else {
        zombie2.body.velocity.x += pushX;
        zombie2.body.velocity.y += pushY;
        zombie1.body.velocity.x -= pushX;
        zombie1.body.velocity.y -= pushY;
      }
    }
  }

  createAnimations() {
    if (!this.scene.anims.exists("Guardian Run")) {
      this.scene.anims.create({
        key: "Guardian Run",
        frames: this.scene.anims.generateFrameNumbers("guradian_walk224x45", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (
      this.scene.textures.exists("guardian_attack") &&
      !this.scene.anims.exists("Guardian Attack")
    ) {
      this.scene.anims.create({
        key: "Guardian Attack",
        frames: this.scene.anims.generateFrameNumbers("guardian_attack", {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (
      this.scene.textures.exists("guardian_charge") &&
      !this.scene.anims.exists("Guardian Charge")
    ) {
      this.scene.anims.create({
        key: "Guardian Charge",
        frames: this.scene.anims.generateFrameNumbers("guardian_charge", {
          start: 0,
          end: 3,
        }),
        frameRate: 15,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("Guardian Idle")) {
      this.scene.anims.create({
        key: "Guardian Idle",
        frames: [{ key: "guradian_walk224x45", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(
      this.x,
      this.y - 30,
      60,
      8,
      0x660000
    );
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.setDepth(1);

    this.healthBarFg = this.scene.add.rectangle(
      this.x - 30,
      this.y - 30,
      60,
      8,
      0x00ff00
    );
    this.healthBarFg.setOrigin(0, 0.5);
    this.healthBarFg.setDepth(20);

    this.shieldIndicator = this.scene.add.rectangle(
      this.x,
      this.y - 40,
      60,
      4,
      0x00aaff
    );
    this.shieldIndicator.setOrigin(0.5, 0.5);
    this.shieldIndicator.setDepth(21);
    this.shieldIndicator.setVisible(false);

    this.on("destroy", () => {
      if (this.healthBarBg) this.healthBarBg.destroy();
      if (this.healthBarFg) this.healthBarFg.destroy();
      if (this.shieldIndicator) this.shieldIndicator.destroy();
    });

    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBarFg || !this.healthBarBg) return;

    this.healthBarBg.setPosition(this.x, this.y - 20);
    this.healthBarFg.setPosition(this.x - 30, this.y - 20);

    if (this.shieldIndicator) {
      this.shieldIndicator.setPosition(this.x, this.y - 30);
      this.shieldIndicator.setVisible(this.isShielded);
    }

    const healthPercentage = this.health / this.maxHealth;
    this.healthBarFg.width = 60 * healthPercentage;

    if (healthPercentage > 0.6) {
      this.healthBarFg.setFillStyle(0x00ff00);
    } else if (healthPercentage > 0.3) {
      this.healthBarFg.setFillStyle(0xffaa00);
    } else {
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
        this.x,
        this.y,
        player.x,
        player.y
      );

      if (
        !this.isShielded &&
        time - this.lastShieldTime > this.shieldAbilityCooldown &&
        this.health < this.maxHealth * 0.5
      ) {
        this.activateShield(time);
      }

      if (
        this.isShielded &&
        time - this.shieldStartTime >= this.shieldDuration
      ) {
        this.deactivateShield();
      }

      if (
        !this.isCharging &&
        time - this.lastChargeTime > this.chargeAbilityCooldown &&
        distance > 100 &&
        distance < 300
      ) {
        this.startCharge(player, time);
      }

      if (this.isCharging) {
        this.handleCharge(time);
        return;
      }
      if (distance > this.attackRange) {
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          player.x,
          player.y
        );
        const forceX = Math.cos(angle) * this.speed * 0.08;
        const forceY = Math.sin(angle) * this.speed * 0.08;
        this.body.velocity.x += forceX;
        this.body.velocity.y += forceY;
        this.body.velocity.x *= 0.8;
        this.body.velocity.y *= 0.8;
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
        this.body.velocity.x *= 0.6;
        this.body.velocity.y *= 0.6;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 3;

        if (time - this.lastAttackTime > this.attackCooldown) {
          this.attackPlayer(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();
    } catch (error) {
      console.error("Error in Guardian update:", error);
    }
  }

  activateShield(time) {
    this.isShielded = true;
    this.shieldStartTime = time;
    this.lastShieldTime = time;
    this.setTint(0x4488ff);
    if (this.scene.sound && this.scene.sound.get("guardian_shield")) {
      this.scene.sound.play("guardian_shield");
    }
  }

  deactivateShield() {
    this.isShielded = false;
    this.clearTint();
  }

  startCharge(player, time) {
    this.isCharging = true;
    this.chargeStartTime = time;
    this.lastChargeTime = time;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.body.velocity.x = Math.cos(angle) * this.chargeSpeed;
    this.body.velocity.y = Math.sin(angle) * this.chargeSpeed;

    this.setTint(0xff4400);
    if (this.scene.sound && this.scene.sound.get("guardian_charge")) {
      this.scene.sound.play("guardian_charge");
    }

    this.updateDirection(angle);
  }

  handleCharge(time) {
    if (time - this.chargeStartTime >= this.chargeDuration) {
      // End charge
      this.isCharging = false;
      if (!this.isShielded) {
        this.clearTint();
      }
      this.body.velocity.x *= 0.2;
      this.body.velocity.y *= 0.2;
    }
    const player = this.scene.player;
    if (player && player.active) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y
      );

      if (distance < 40) {
        if (player.takeDamage) {
          player.takeDamage(this.damage * 1.5);
        }
        this.isCharging = false;
        if (!this.isShielded) {
          this.clearTint();
        }
      }
    }

    this.isMoving = true;
    this.updateAnimation();
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup || this.isCharging) return;

    const avoidanceRadius = 40;
    const avoidanceForce = 8;
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
      this.body.velocity.x += totalAvoidanceX * 0.03;
      this.body.velocity.y += totalAvoidanceY * 0.03;
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
    if (this.isCharging) {
      if (this.scene.anims.exists("Guardian Charge")) {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Guardian Charge"
        ) {
          this.play("Guardian Charge");
        }
      } else {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Guardian Run"
        ) {
          this.play("Guardian Run");
        }
      }
    } else if (this.isAttacking) {
      if (this.scene.anims.exists("Guardian Attack")) {
        if (
          !this.anims.isPlaying ||
          this.anims.currentAnim.key !== "Guardian Attack"
        ) {
          this.play("Guardian Attack");
        }
      }
    } else if (this.isMoving) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Guardian Run"
      ) {
        this.play("Guardian Run");
      }
    } else {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Guardian Idle"
      ) {
        this.play("Guardian Idle");
      }
    }
    if (this.lastDirection === "right") {
      this.setFlipX(false);
    } else if (this.lastDirection === "left") {
      this.setFlipX(true);
    }
  }

  attackPlayer(player) {
    if (!player || !player.takeDamage) return;

    this.isAttacking = true;

    if (this.scene.anims.exists("Guardian Attack")) {
      this.play("Guardian Attack");
      this.scene.time.delayedCall(500, () => {
        if (player && player.takeDamage && !this.isDead) {
          player.takeDamage(this.damage);
        }
        this.isAttacking = false;
      });
    } else {
      player.takeDamage(this.damage);
      this.scene.time.delayedCall(600, () => {
        this.isAttacking = false;
      });
    }

    this.setTint(0xff6600);
    this.scene.time.delayedCall(200, () => {
      if (this.active && !this.isCharging && !this.isShielded) {
        this.clearTint();
      }
    });

    this.lastAttackTime = this.scene.time.now;
  }

  takeDamage(amount) {
    if (this.isDead) return;
    if (this.isShielded) {
      amount = Math.floor(amount * 0.3);
    }
    this.health -= amount;
    this.updateHealthBar();
    if (!this.isShielded && !this.isCharging) {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(150, () => {
        if (this.active && !this.isShielded && !this.isCharging) {
          this.clearTint();
        }
      });
    }

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
      scale: 1.2,
      duration: 800,
      ease: "Power2",
      onComplete: () => this.cleanupAndDestroy(),
    });

    this.spawnRewards();
  }

  spawnRewards() {
    try {
      if (this.scene.spawnExperienceOrb) {
        const orbCount = Phaser.Math.Between(8, 12);

        for (let i = 0; i < orbCount; i++) {
          const xOffset = Phaser.Math.Between(-30, 30);
          const yOffset = Phaser.Math.Between(-30, 30);

          this.scene.spawnExperienceOrb(this.x + xOffset, this.y + yOffset, 5);
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
