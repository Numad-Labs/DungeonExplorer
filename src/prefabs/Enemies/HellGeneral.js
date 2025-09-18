// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class HellGeneral extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x ?? 64, y ?? 64, texture || "boss_hell_general_walk_body_only_V01", frame ?? 0);

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(32, 32, false);
    this.body.setOffset(16, 48);

    // Boss stats - much stronger than regular mobs
    this.maxHealth = 150;
    this.health = this.maxHealth;
    this.damage = 20;
    this.speed = 25;
    this.attackRange = 60;
    this.attackCooldown = 2000;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false;
    this.lastDirection = "down";
    this.isBoss = true;
    
    this.createAnimations();
    this.addToZombieGroup(scene);
    this.createShadow();
    this.createBossHealthBar();
    
    this.updateListener = this.update.bind(this);
    scene.events.on("update", this.updateListener);
    
    // Announce boss spawn
    this.announceBoss();
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

  handleZombieCollision(zombie1, zombie2, hellGeneral) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y
    );

    if (distance < 20) {
      const angle = Phaser.Math.Angle.Between(
        zombie1.x,
        zombie1.y,
        zombie2.x,
        zombie2.y
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
    if (!this.scene.anims.exists("HellGeneralRun")) {
      this.scene.anims.create({
        key: "HellGeneralRun",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_walk_body_only_V01", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    
    if (!this.scene.anims.exists("HellGeneralIdle")) {
      this.scene.anims.create({
        key: "HellGeneralIdle",
        frames: [{ key: "boss_hell_general_walk_body_only_V01", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
    
    if (!this.scene.anims.exists("HellGeneralDeath")) {
      this.scene.anims.create({
        key: "HellGeneralDeath",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_death", {
          start: 0,
          end: 8,
        }),
        frameRate: 6,
        repeat: 0,
        hideOnComplete: false,
      });
    }

    if (!this.scene.anims.exists("HellGeneralMainAttack")) {
      this.scene.anims.create({
        key: "HellGeneralMainAttack",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_attack", {
          start: 0,
          end: 5,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }
  }

  createBossHealthBar() {
    // Create boss health bar at top of screen
    const centerX = this.scene.cameras.main.width / 2;
    
    this.bossHealthBarBg = this.scene.add.rectangle(centerX, 30, 300, 12, 0x330000);
    this.bossHealthBarBg.setOrigin(0.5, 0.5);
    this.bossHealthBarBg.setDepth(100);
    this.bossHealthBarBg.setScrollFactor(0);
    
    this.bossHealthBarFg = this.scene.add.rectangle(centerX - 150, 30, 300, 12, 0xff0000);
    this.bossHealthBarFg.setOrigin(0, 0.5);
    this.bossHealthBarFg.setDepth(101);
    this.bossHealthBarFg.setScrollFactor(0);
    
    this.bossNameText = this.scene.add.text(centerX, 15, "HELL GENERAL", {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.bossNameText.setOrigin(0.5, 0.5);
    this.bossNameText.setDepth(102);
    this.bossNameText.setScrollFactor(0);

    this.on("destroy", () => {
      if (this.bossHealthBarBg) this.bossHealthBarBg.destroy();
      if (this.bossHealthBarFg) this.bossHealthBarFg.destroy();
      if (this.bossNameText) this.bossNameText.destroy();
    });

    this.updateBossHealthBar();
  }

  updateBossHealthBar() {
    if (!this.bossHealthBarFg) return;

    const healthPercentage = Math.max(0, this.health / this.maxHealth);
    this.bossHealthBarFg.width = 300 * healthPercentage;
    
    // Change color based on health
    if (healthPercentage > 0.6) {
      this.bossHealthBarFg.fillColor = 0xff0000; // Red
    } else if (healthPercentage > 0.3) {
      this.bossHealthBarFg.fillColor = 0xff6600; // Orange
    } else {
      this.bossHealthBarFg.fillColor = 0xffaa00; // Yellow
    }
  }

  announceBoss() {
    // Screen shake and warning
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(500, 0.02);
    }
    
    // Warning text
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const warningText = this.scene.add.text(centerX, centerY, "HELL GENERAL APPROACHES!", {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });
    warningText.setOrigin(0.5, 0.5);
    warningText.setDepth(200);
    warningText.setScrollFactor(0);
    
    // Fade out warning
    this.scene.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 2000,
      onComplete: () => warningText.destroy()
    });
  }

  update(time, delta) {
    if (this.isDead || !this.active) return;

    try {
      this.updateBossHealthBar();

      const player = this.scene.player;
      if (!player) return;

      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y
      );

      if (distance > this.attackRange) {
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
        this.body.velocity.x *= 0.8;
        this.body.velocity.y *= 0.8;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 5 && !this.isAttacking;

        if (
          time - this.lastAttackTime > this.attackCooldown &&
          !this.isAttacking
        ) {
          this.attackPlayer(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in HellGeneral update:", error);
    }
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup) return;

    const avoidanceRadius = 40;
    const avoidanceForce = 25;
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
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "HellGeneralMainAttack"
      ) {
        this.play("HellGeneralMainAttack");
      }
      // Don't change direction during attack animation
    } else if (this.isMoving) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "HellGeneralRun"
      ) {
        this.play("HellGeneralRun");
      }
      // Apply direction flipping only when moving
      if (this.lastDirection === "right") {
        this.setFlipX(false);
      } else if (this.lastDirection === "left") {
        this.setFlipX(true);
      }
    } else {
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== "HellGeneralIdle") {
        this.play("HellGeneralIdle");
      }
    }
  }

  attackPlayer(player) {
    if (!player || !player.takeDamage) return;

    this.isAttacking = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    this.play("HellGeneralMainAttack");
    this.once("animationcomplete", (animation) => {
      if (animation.key === "HellGeneralMainAttack") {
        this.isAttacking = false;
      }
    });
    
    this.scene.time.delayedCall(200, () => {
      if (player && player.takeDamage) {
        player.takeDamage(this.damage);
      }
    });

    // Enhanced attack effects for boss
    this.setTint(0xff4400);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });

    // Screen shake on attack
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(150, 0.008);
    }

    this.lastAttackTime = this.scene.time.now;
  }

  takeDamage(amount) {
    // Boss takes reduced damage
    const reducedDamage = Math.max(1, amount * 0.7);
    this.health -= reducedDamage;
    this.updateBossHealthBar();

    // Enhanced damage effects
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      this.clearTint();
    });

    // Screen flash on boss damage
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.flash(100, 255, 100, 100, false);
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

    if (this.scene.zombieGroup) {
      this.scene.zombieGroup.remove(this);
    }
    
    // Boss death effects
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(1000, 0.03);
      this.scene.cameras.main.flash(500, 255, 50, 50, false);
    }
    
    this.spawnRewards();
    this.stop();
    this.play("HellGeneralDeath", false);
    
    this.once("animationcomplete", (animation) => {
      if (animation.key === "HellGeneralDeath") {
        this.cleanupAndDestroy();
      }
    });
    
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    
    // Victory message
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const victoryText = this.scene.add.text(centerX, centerY, "HELL GENERAL DEFEATED!", {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    victoryText.setOrigin(0.5, 0.5);
    victoryText.setDepth(200);
    victoryText.setScrollFactor(0);
    
    this.scene.tweens.add({
      targets: victoryText,
      alpha: 0,
      y: centerY - 50,
      duration: 3000,
      onComplete: () => victoryText.destroy()
    });
  }

  spawnRewards() {
    try {
      if (this.scene.spawnExperienceOrb) {
        // Boss drops lots of XP
        const orbCount = Phaser.Math.Between(15, 25);

        for (let i = 0; i < orbCount; i++) {
          const angle = (i / orbCount) * Math.PI * 2;
          const radius = Phaser.Math.Between(20, 50);
          const xOffset = Math.cos(angle) * radius;
          const yOffset = Math.sin(angle) * radius;

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
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    
    if (this.bossHealthBarBg) {
      this.bossHealthBarBg.destroy();
      this.bossHealthBarBg = null;
    }
    
    if (this.bossHealthBarFg) {
      this.bossHealthBarFg.destroy();
      this.bossHealthBarFg = null;
    }
    
    if (this.bossNameText) {
      this.bossNameText.destroy();
      this.bossNameText = null;
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
    this.shadow.fillStyle(0x000000, 0.3);
    this.shadow.fillEllipse(0, 20, 40, 20);
    this.updateShadowPosition();
  }

  updateShadowPosition() {
    if (this.shadow && !this.isDead) {
      this.shadow.setPosition(this.x, this.y + 50);
      const baseScale = 1.2;
      const moveScale = this.isMoving ? 0.8 : 1.0;
      this.shadow.setScale(baseScale * moveScale);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here