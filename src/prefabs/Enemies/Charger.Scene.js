// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Charger extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(
      scene,
      x ?? 64,
      y ?? 64,
      texture || "Charger_run_32x32_v01",
      frame ?? 0
    );

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(32, 32, false);
    this.body.setOffset(0, 0);
    this.maxHealth = 60;
    this.health = this.maxHealth;
    this.damage = 35;
    this.speed = 50;
    this.chargeSpeed = 120;
    this.attackRange = 80; // Longer range to trigger charge
    this.chargeRange = 150; // Max charge distance
    this.attackCooldown = 2000;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isCharging = false;
    this.isAttacking = false; // New attack state
    this.chargeStartTime = 0;
    this.chargeDuration = 800; // How long charge lasts
    this.attackDuration = 400; // How long attack animation lasts
    this.chargeDirection = { x: 0, y: 0 };
    this.lastDirection = "down";
    // this.createHealthBar();
    this.createAnimations();
    this.addToChargerGroup(scene);
    this.createShadow();
    this.updateListener = this.update.bind(this);
    scene.events.on("update", this.updateListener);
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  addToChargerGroup(scene) {
    if (!scene.chargerGroup) {
      scene.chargerGroup = scene.physics.add.group();
      scene.physics.add.collider(
        scene.chargerGroup,
        scene.chargerGroup,
        this.handleChargerCollision,
        null,
        scene
      );
    }
    scene.chargerGroup.add(this);
  }

  handleChargerCollision(charger1, charger2) {
    const distance = Phaser.Math.Distance.Between(
      charger1.x,
      charger1.y,
      charger2.x,
      charger2.y
    );

    if (distance < 35) {
      const angle = Phaser.Math.Angle.Between(
        charger1.x,
        charger1.y,
        charger2.x,
        charger2.y
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
    if (!this.scene.anims.exists("Charger Run")) {
      this.scene.anims.create({
        key: "Charger Run",
        frames: this.scene.anims.generateFrameNumbers("Charger_run_32x32_v01", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("chargerDeath")) {
      this.scene.anims.create({
        key: "chargerDeath",
        frames: this.scene.anims.generateFrameNumbers("Charger_death_50x31_v01", {
          start: 0,
          end: 4,
        }),
        frameRate: 6,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("Charger Charge")) {
      this.scene.anims.create({
        key: "Charger Charge",
        frames: this.scene.anims.generateFrameNumbers("Charger_run_32x32_v01", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    // New attack animation
    if (!this.scene.anims.exists("chargerAttack")) {
      this.scene.anims.create({
        key: "chargerAttack",
        frames: this.scene.anims.generateFrameNumbers("chargerAttack", {
          start: 0,
          end: 9,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists("Charger Idle")) {
      this.scene.anims.create({
        key: "Charger Idle",
        frames: [{ key: "Charger_run_32x32_v01", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(
      this.x,
      this.y - 25,
      35,
      5,
      0xff0000
    );
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.setDepth(1);

    this.healthBarFg = this.scene.add.rectangle(
      this.x - 17.5,
      this.y - 25,
      35,
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
        this.x,
        this.y,
        player.x,
        player.y
      );

      // Handle attacking behavior
      if (this.isAttacking) {
        this.updateAttack(time);
      } else if (this.isCharging) {
        this.updateCharge(time);
      } else if (
        distance <= this.attackRange &&
        distance > 20 &&
        time - this.lastAttackTime > this.attackCooldown
      ) {
        // Start charge attack
        this.startCharge(player);
      } else if (distance > this.attackRange) {
        // Normal movement toward player
        this.moveTowardPlayer(player);
      } else {
        // Close to player but not charging - slow movement
        this.body.velocity.x *= 0.8;
        this.body.velocity.y *= 0.8;
        this.isMoving =
          Math.abs(this.body.velocity.x) > 5 ||
          Math.abs(this.body.velocity.y) > 5;
      }

      this.updateAnimation();

      // Update shadow position
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in Charger update:", error);
    }
  }

  startCharge(player) {
    this.isCharging = true;
    this.chargeStartTime = this.scene.time.now;
    this.lastAttackTime = this.scene.time.now;

    // Calculate charge direction
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

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
          this.x,
          this.y,
          player.x,
          player.y
        );

        if (distance < 25) {
          this.startAttack(player);
        }
      }
    } else {
      // End charge
      this.isCharging = false;
      this.body.velocity.x *= 0.3;
      this.body.velocity.y *= 0.3;
    }
  }

  startAttack(player) {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.isCharging = false;
    this.attackStartTime = this.scene.time.now;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.play("chargerAttack");
    this.once('animationcomplete', (animation) => {
      if (animation.key === "chargerAttack") {
        this.endAttack();
      }
    });
    this.hitPlayer(player);
  }

  updateAttack(time) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.isMoving = false;
    const attackTime = time - this.attackStartTime;
    if (attackTime > this.attackDuration) {
      this.endAttack();
    }
  }

  endAttack() {
    this.isAttacking = false;
    this.attackStartTime = 0;
  }

  moveTowardPlayer(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
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

    this.scene.chargerGroup.children.entries.forEach((otherCharger) => {
      if (otherCharger === this || otherCharger.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        otherCharger.x,
        otherCharger.y
      );

      if (distance < avoidanceRadius && distance > 0) {
        const angle = Phaser.Math.Angle.Between(
          otherCharger.x,
          otherCharger.y,
          this.x,
          this.y
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
      // Attack animation is handled by startAttack method
      // No need to change animation here during attack
    } else if (this.isCharging) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Charger Charge"
      ) {
        this.play("Charger Charge");
      }
    } else if (this.isMoving) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Charger Run"
      ) {
        this.play("Charger Run");
      }
    } else {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Charger Idle"
      ) {
        this.play("Charger Idle");
      }
    }

    // Handle sprite flipping (don't flip during attack to maintain attack direction)
    if (!this.isAttacking) {
      if (this.lastDirection === "right") {
        this.setFlipX(false);
      } else if (this.lastDirection === "left") {
        this.setFlipX(true);
      }
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

    // Don't end charge here anymore - let attack animation handle it
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

    // Interrupt charge and attack if damaged
    if (this.isCharging) {
      this.isCharging = false;
      this.body.velocity.x *= 0.5;
      this.body.velocity.y *= 0.5;
    }

    if (this.isAttacking) {
      this.endAttack();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;
    this.isCharging = false;
    this.isAttacking = false;

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.enable = false;

    if (
      this.scene &&
      this.scene.chargerGroup &&
      this.scene.chargerGroup.children
    ) {
      this.scene.chargerGroup.remove(this);
    }

    this.stop();
    this.play("chargerDeath", false); 
    this.once('animationcomplete', (animation) => {
      if (animation.key === "chargerDeath") {
        this.cleanupAndDestroy();
      }
    });

    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }

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
            1.5
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
        this.scene.chargerGroup &&
        this.scene.chargerGroup.children
      ) {
        this.scene.chargerGroup.remove(this);
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
    this.shadow.fillEllipse(0, -14, 20, 10);
    this.updateShadowPosition();
  }

  updateShadowPosition() {
    if (this.shadow && !this.isDead) {
      this.shadow.setPosition(this.x, this.y + 18);
      const baseScale = 1.0;
      const moveScale = this.isMoving ? 0.9 : 1.0;
      const chargeScale = this.isCharging ? 1.3 : 1.0;
      const attackScale = this.isAttacking ? 1.1 : 1.0;
      this.shadow.setScale(baseScale * moveScale * chargeScale * attackScale);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here