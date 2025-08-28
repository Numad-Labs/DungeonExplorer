// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BigDude extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x ?? 64, y ?? 64, texture || "run_2", frame ?? 0);

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(32, 32, false);
    this.body.setOffset(16, 32);
    this.maxHealth = 80;
    this.health = this.maxHealth;
    this.damage = 25;
    this.speed = 30;
    this.attackRange = 40;
    this.attackCooldown = 1500;
    this.lastAttackTime = 0;
    this.isDead = false;
    this.isMoving = false;
    this.isAttacking = false; // Add this flag
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

  handleZombieCollision(zombie1, zombie2, bigDude) {
    const distance = Phaser.Math.Distance.Between(
      zombie1.x,
      zombie1.y,
      zombie2.x,
      zombie2.y
    );

    if (distance < 30) {
      const angle = Phaser.Math.Angle.Between(
        zombie1.x,
        zombie1.y,
        zombie2.x,
        zombie2.y
      );

      const separationForce = 40;
      const pushX = Math.cos(angle) * separationForce;
      const pushY = Math.sin(angle) * separationForce;

      zombie2.body.velocity.x += pushX;
      zombie2.body.velocity.y += pushY;
      zombie1.body.velocity.x -= pushX;
      zombie1.body.velocity.y -= pushY;

      if (bigDude) {
        bigDude.body.velocity.x -= pushX * 0.5;
        bigDude.body.velocity.y -= pushY * 0.5;
      }
    }
  }

  createAnimations() {
    // Debug: List all available textures
    console.log("Available textures:", Object.keys(this.scene.textures.list));
    
    if (!this.scene.anims.exists("BigDude Run")) {
      this.scene.anims.create({
        key: "BigDude Run",
        frames: this.scene.anims.generateFrameNumbers("run_2", {
          start: 0,
          end: 7,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Try different possible texture names for Attack1
    const possibleAttack1Names = [
      "attack1", "attack_1", "BigDudeAttack1", "bigdude_attack1", 
      "attack1_2", "attack 1", "BigDude_Attack1"
    ];
    
    let attack1TextureName = null;
    for (const textureName of possibleAttack1Names) {
      if (this.scene.textures.exists(textureName)) {
        attack1TextureName = textureName;
        break;
      }
    }

    if (attack1TextureName && !this.scene.anims.exists("BigDude Attack1")) {
      console.log("Creating BigDude Attack1 with texture:", attack1TextureName);
      this.scene.anims.create({
        key: "BigDude Attack1",
        frames: this.scene.anims.generateFrameNumbers(attack1TextureName, {
          start: 0,
          end: 7, // Adjust based on your sprite sheet
        }),
        frameRate: 8,
        repeat: 0,
      });
    } else {
      console.log("BigDude Attack1 texture not found. Checked:", possibleAttack1Names);
    }

    // Second attack animation (keeping existing)
    if (
      this.scene.textures.exists("attack 2t") &&
      !this.scene.anims.exists("BigDude Attack2")
    ) {
      console.log("Creating BigDude Attack2 with texture: attack 2t");
      this.scene.anims.create({
        key: "BigDude Attack2",
        frames: this.scene.anims.generateFrameNumbers("attack 2t", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: 0,
      });
    } else {
      console.log("BigDude Attack2 texture 'attack 2t' not found");
    }

    if (!this.scene.anims.exists("BigDude Idle")) {
      this.scene.anims.create({
        key: "BigDude Idle",
        frames: [{ key: "run_2", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }
    
    if (!this.scene.anims.exists("bigDudeDeath")) {
      this.scene.anims.create({
        key: "bigDudeDeath",
        frames: this.scene.anims.generateFrameNumbers("Bidamaged and death", {
          start: 0,
          end: 6,
        }),
        frameRate: 6,
        repeat: 0,
      });
    }

    // Debug: List all created animations
    console.log("Created animations:", Object.keys(this.scene.anims.anims.entries));
  }

  createHealthBar() {
    this.healthBarBg = this.scene.add.rectangle(
      this.x,
      this.y - 25,
      40,
      6,
      0xff0000
    );
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.setDepth(1);

    this.healthBarFg = this.scene.add.rectangle(
      this.x - 20,
      this.y - 25,
      40,
      6,
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

    this.healthBarBg.setPosition(this.x, this.y - 15);
    this.healthBarFg.setPosition(this.x - 20, this.y - 15);

    const healthPercentage = this.health / this.maxHealth;
    this.healthBarFg.width = 40 * healthPercentage;
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
        this.body.velocity.x *= 0.85;
        this.body.velocity.y *= 0.85;
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
        this.body.velocity.x *= 0.7;
        this.body.velocity.y *= 0.7;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 5 && !this.isAttacking;

        if (time - this.lastAttackTime > this.attackCooldown && !this.isAttacking) {
          this.attackPlayer(player);
          this.lastAttackTime = time;
        }
      }

      this.updateAnimation();

      // Update shadow position
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in BigDude update:", error);
    }
  }

  applyZombieAvoidance() {
    if (!this.scene.zombieGroup) return;

    const avoidanceRadius = 35;
    const avoidanceForce = 20;
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
      this.body.velocity.x += totalAvoidanceX * 0.08;
      this.body.velocity.y += totalAvoidanceY * 0.08;
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
      // Don't change animation while attacking
      return;
    } else if (this.isMoving) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "BigDude Run"
      ) {
        this.play("BigDude Run");
      }

      if (this.lastDirection === "right") {
        this.setFlipX(false);
      } else if (this.lastDirection === "left") {
        this.setFlipX(true);
      }
    } else {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "BigDude Idle"
      ) {
        this.play("BigDude Idle");
      }
    }
  }

  attackPlayer(player) {
    if (!player || !player.takeDamage) return;
    
    this.isAttacking = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    
    // Get available attack animations
    const availableAttacks = [];
    if (this.scene.anims.exists("BigDude Attack1")) {
      availableAttacks.push("BigDude Attack1");
    }
    if (this.scene.anims.exists("BigDude Attack2")) {
      availableAttacks.push("BigDude Attack2");
    }
    
    console.log("Available attacks:", availableAttacks);
    
    let selectedAttack;
    let damageDelay;
    
    if (availableAttacks.length > 0) {
      // Randomly choose from available attacks
      selectedAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
      damageDelay = selectedAttack === "BigDude Attack1" ? 300 : 400;
      
      console.log("Playing attack:", selectedAttack);
      this.play(selectedAttack);
      
      // Handle animation completion
      this.once('animationcomplete', (animation) => {
        if (animation.key === selectedAttack) {
          this.isAttacking = false;
          console.log("Attack animation completed:", selectedAttack);
        }
      });
      
      // Apply damage with delay
      this.scene.time.delayedCall(damageDelay, () => {
        if (player && player.takeDamage && !this.isDead) {
          player.takeDamage(this.damage);
        }
      });
    } else {
      // No attack animations available, use immediate damage
      console.log("No attack animations found, applying immediate damage");
      player.takeDamage(this.damage);
      this.isAttacking = false;
    }

    // Visual feedback
    this.setTint(0xff8800);
    this.scene.time.delayedCall(200, () => {
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
    this.scene.time.delayedCall(150, () => {
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
    this.play("bigDudeDeath", false); 
    this.once('animationcomplete', (animation) => {
      if (animation.key === "bigDudeDeath") {
        this.cleanupAndDestroy();
      }
    })
       if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }


    if (this.scene.zombieGroup) {
      this.scene.zombieGroup.remove(this);
    }

    this.spawnRewards();
  }

  spawnRewards() {
    try {
      if (this.scene.spawnExperienceOrb) {
        const orbCount = Phaser.Math.Between(3, 6);

        for (let i = 0; i < orbCount; i++) {
          const xOffset = Phaser.Math.Between(-15, 15);
          const yOffset = Phaser.Math.Between(-15, 15);

          this.scene.spawnExperienceOrb(
            this.x + xOffset,
            this.y + yOffset,
            2 // Higher experience value
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
    this.shadow.fillEllipse(0, 0, 40, 20);
    this.updateShadowPosition();
  }

  updateShadowPosition() {
    if (this.shadow && !this.isDead) {
      this.shadow.setPosition(this.x, this.y + 20);
      const baseScale = 1.0;
      const moveScale = this.isMoving ? 0.9 : 1.0;
      this.shadow.setScale(baseScale * moveScale);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here