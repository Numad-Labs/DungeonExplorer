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
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.damage = 15;
    this.speed = 60;
    this.attackRange = 30; 
    this.attackCooldown = 800;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false; // New attack state
    this.attackDuration = 600; // How long attack lasts

    this.lastDirection = "down";
    // this.createHealthBar();
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

  handleZombieCollision(zombie1, zombie2, wreacker) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y
    );

    if (distance < 25) {
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

      if (wreacker) {
        wreacker.body.velocity.x -= pushX * 0.7;
        wreacker.body.velocity.y -= pushY * 0.7;
      }
    }
  }

  createAnimations() {
    if (!this.scene.anims.exists("WreackerRun")) {
      this.scene.anims.create({
        key: "WreackerRun",
        frames: this.scene.anims.generateFrameNumbers("WreackerRun", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("WreackerDeath")) {
      this.scene.anims.create({
        key: "WreackerDeath",
        frames: this.scene.anims.generateFrameNumbers("WreackerDeath", {
          start: 0,
          end: 4,
        }),
        frameRate: 6,
        repeat: 0,
      });
    }

    // Improved WreackerAttack animation setup
    if (!this.scene.anims.exists("WreackerAttack")) {
      // Check if the attack sprite sheet exists, fallback to run frames if not
      const attackTexture = this.scene.textures.exists("WreackerAttack") ? "WreackerAttack" : "WreackerRun";
      
      this.scene.anims.create({
        key: "WreackerAttack",
        frames: this.scene.anims.generateFrameNumbers(attackTexture, {
          start: 0,
          end: attackTexture === "WreackerAttack" ? 5 : 3, // Adjust based on available frames
        }),
        frameRate: 8, // Slower frame rate to ensure full animation plays
        repeat: 0, // Play once
      });
      
      console.log("Created WreackerAttack animation with texture:", attackTexture); // Debug log
    }

    if (!this.scene.anims.exists("Wreacker Idle")) {
      this.scene.anims.create({
        key: "Wreacker Idle",
        frames: [{ key: "WreackerRun", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(
      this.x,
      this.y - 20,
      35,
      5,
      0xff0000
    );
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.setDepth(1);

    this.healthBarFg = this.scene.add.rectangle(
      this.x - 17.5,
      this.y - 20,
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
        this.x,
        this.y,
        player.x,
        player.y
      );

      // Handle attacking behavior
      if (this.isAttacking) {
        this.updateAttack(time);
      } else if (distance > this.attackRange) {
        // Move towards player - Wreacker is more aggressive
        this.moveTowardPlayer(player);
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
          this.startAttack(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();

      // Update shadow position
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in Wreacker update:", error);
    }
  }

  moveTowardPlayer(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
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
  }

  startAttack(player) {
    if (this.isAttacking) return;

    console.log("Starting Wreacker attack animation"); // Debug log

    this.isAttacking = true;
    this.attackStartTime = this.scene.time.now;

    // Stop movement during attack
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.isMoving = false;

    // Clear any existing animation listeners
    this.off('animationcomplete');

    // Play attack animation with force restart
    this.stop(); // Stop current animation
    this.play("WreackerAttack", true); // Force restart

    // Listen for animation complete to end attack
    this.once('animationcomplete', (animation) => {
      console.log("Animation completed:", animation.key); // Debug log
      if (animation.key === "WreackerAttack") {
        this.endAttack();
      }
    });

    // Backup timer in case animation doesn't fire complete event
    this.scene.time.delayedCall(this.attackDuration, () => {
      if (this.isAttacking) {
        console.log("Force ending attack via timer"); // Debug log
        this.endAttack();
      }
    });

    // Deal damage after a short delay (mid-animation)
    this.scene.time.delayedCall(250, () => {
      if (player && player.takeDamage && !this.isDead && this.isAttacking) {
        player.takeDamage(this.damage);
        
        // Flash effect when damage is dealt
        this.setTint(0xff4400);
        this.scene.time.delayedCall(150, () => {
          if (this.active) {
            this.clearTint();
          }
        });
      }
    });
  }

  updateAttack(time) {
    // Keep the wreacker stationary during attack
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.isMoving = false;

    // Check if attack duration has expired (backup in case animation doesn't complete)
    const attackTime = time - this.attackStartTime;
    if (attackTime > this.attackDuration) {
      this.endAttack();
    }
  }

  endAttack() {
    console.log("Ending Wreacker attack"); // Debug log
    this.isAttacking = false;
    this.attackStartTime = 0;
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup) return;

    const avoidanceRadius = 30; // Medium avoidance radius
    const avoidanceForce = 18; // Medium avoidance force
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
      this.body.velocity.x += totalAvoidanceX * 0.1; // Standard avoidance effect
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
      // During attack, ensure attack animation is playing
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== "WreackerAttack") {
        console.log("Force playing attack animation"); // Debug log
        this.play("WreackerAttack", true);
      }
    } else if (this.isMoving) {
      // Use run animation when moving
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "WreackerRun"
      ) {
        this.play("WreackerRun");
      }
      // Handle flipping for direction (don't flip during attack)
      if (this.lastDirection === "right") {
        this.setFlipX(false);
      } else if (this.lastDirection === "left") {
        this.setFlipX(true);
      }
    } else {
      // Use idle animation when not moving
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "Wreacker Idle"
      ) {
        this.play("Wreacker Idle");
      }
    }
  }

  // Remove the old attackPlayer method as it's replaced by startAttack
  attackPlayer(player) {
    // This method is deprecated - use startAttack instead
    this.startAttack(player);
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

    // Interrupt attack if damaged
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
    this.isAttacking = false;

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.enable = false;

    if (this.scene.zombieGroup) {
      this.scene.zombieGroup.remove(this);
    }
    this.stop();
    this.play("WreackerDeath", false); // false ensures it doesn't repeat
    
    // Listen for animation complete event (only once)
    this.once('animationcomplete', (animation) => {
      // Make sure it's the death animation that completed
      if (animation.key === "WreackerDeath") {
        // Immediately remove the mob after death animation
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
    this.shadow.fillEllipse(0, -10, 30, 15);
    this.updateShadowPosition();
  }

  updateShadowPosition() {
    if (this.shadow && !this.isDead) {
      this.shadow.setPosition(this.x, this.y + 18);
      const moveScale = this.isMoving ? 0.9 : 1.0;
      const attackScale = this.isAttacking ? 1.2 : 1.0;
      this.shadow.setScale(moveScale * attackScale);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here