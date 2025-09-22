// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class HellGeneral extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x ?? 64, y ?? 64, texture || "boss_hell_general_walk_body_only_V01", frame ?? 0);

    /* START-USER-CTR-CODE */
    scene.physics.add.existing(this, false);
    this.body.setSize(320, 320, false);
    this.body.setOffset(16, 48);
    this.maxHealth = 1500;
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
    this.slamAttackDamage = 9;
    this.slamAttackRange = 100;
    this.slamAttackCooldown = 3000; 
    this.lastSlamAttackTime = 0;
    this.isSlamAttacking = false;
    
    // Spin attack properties
    this.spinAttackDamage = 3;
    this.spinAttackRange = 140; // AOE radius
    this.isSpinAttacking = false;
    
    // Arrow attack properties
    this.arrowAttackDamage = 12;
    this.arrowAttackRange = 200; // Long range attack
    this.arrowAttackCooldown = 2500;
    this.lastArrowAttackTime = 0;
    this.isArrowAttacking = false;
    this.arrowSpeed = 150;
    
    // Random attack system - now includes arrow attack
    this.attackTypes = ['main', 'slam', 'arrow'];
    this.slamAttackChance = 0.4; // 40% chance for slam attack
    this.arrowAttackChance = 0.3; // 30% chance for arrow attack
    // Main attack gets remaining 30%
    
    this.createAnimations();
    this.addToZombieGroup(scene);
    this.createShadow();
    this.createBossHealthBar();
    
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

    // Add spin attack animation
    if (!this.scene.anims.exists("hellGeneralSpin")) {
      this.scene.anims.create({
        key: "hellGeneralSpin",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_spin", {
          start: 0,
          end: 7, // Adjust based on your sprite frames
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    // Add slam attack animation
    if (!this.scene.anims.exists("hellGeneralSlam")) {
      this.scene.anims.create({
        key: "hellGeneralSlam",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_slam", {
          start: 0,
          end: 7, // Adjust based on your sprite frames
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // Add arrow attack animation
    if (!this.scene.anims.exists("hellGeneralArrow")) {
      this.scene.anims.create({
        key: "hellGeneralArrow",
        frames: this.scene.anims.generateFrameNumbers("boss_hell_general_arrow", {
          start: 0,
          end: 7, // Adjust based on your sprite frames
        }),
        frameRate: 10,
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

      // Different behavior based on distance and attack state
      if (distance > this.attackRange && !this.isSlamAttacking && !this.isSpinAttacking && !this.isArrowAttacking) {
        // Move towards player if far away
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
      } else if (!this.isSlamAttacking && !this.isSpinAttacking && !this.isArrowAttacking) {
        // Stop moving and consider attacks
        this.body.velocity.x *= 0.8;
        this.body.velocity.y *= 0.8;
        const currentSpeed = Math.sqrt(
          this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );
        this.isMoving = currentSpeed > 5 && !this.isAttacking;

        // Attack selection when in range or at medium range for arrows
        if (this.canAttack(time)) {
          this.chooseRandomAttack(player, distance);
        }
      }

      this.updateAnimation();
      this.updateShadowPosition();
    } catch (error) {
      console.error("Error in HellGeneral update:", error);
    }
  }

  canAttack(currentTime) {
    const mainAttackReady = currentTime - this.lastAttackTime > this.attackCooldown;
    const slamAttackReady = currentTime - this.lastSlamAttackTime > this.slamAttackCooldown;
    const arrowAttackReady = currentTime - this.lastArrowAttackTime > this.arrowAttackCooldown;
    
    return !this.isAttacking && 
           !this.isSlamAttacking && 
           !this.isSpinAttacking &&
           !this.isArrowAttacking &&
           (mainAttackReady || slamAttackReady || arrowAttackReady);
  }

  chooseRandomAttack(player, distance) {
    const currentTime = this.scene.time.now;
    const mainAttackReady = currentTime - this.lastAttackTime > this.attackCooldown;
    const slamAttackReady = currentTime - this.lastSlamAttackTime > this.slamAttackCooldown;
    const arrowAttackReady = currentTime - this.lastArrowAttackTime > this.arrowAttackCooldown;
    
    // Create array of available attacks
    const availableAttacks = [];
    
    if (mainAttackReady && distance <= this.attackRange) {
      availableAttacks.push('main');
    }
    
    if (slamAttackReady && distance <= this.attackRange) {
      availableAttacks.push('slam');
    }
    
    if (arrowAttackReady && distance <= this.arrowAttackRange) {
      availableAttacks.push('arrow');
    }
    
    // If no attacks are available, return
    if (availableAttacks.length === 0) return;
    
    // If only one attack is available, use it
    if (availableAttacks.length === 1) {
      switch (availableAttacks[0]) {
        case 'main':
          this.attackPlayer(player);
          break;
        case 'slam':
          this.performSlamAttack(player.x, player.y);
          break;
        case 'arrow':
          this.performArrowAttack(player.x, player.y);
          break;
      }
      return;
    }
    
    // Multiple attacks available - choose based on probabilities and distance
    const randomChoice = Math.random();
    
    // Prefer arrow attack at longer distances
    if (distance > this.attackRange && arrowAttackReady) {
      console.log("Hell General chooses ARROW ATTACK!");
      this.performArrowAttack(player.x, player.y);
      return;
    }
    
    // At close range, choose between available attacks
    if (randomChoice < this.slamAttackChance && availableAttacks.includes('slam')) {
      console.log("Hell General chooses SLAM ATTACK!");
      this.performSlamAttack(player.x, player.y);
    } else if (randomChoice < this.slamAttackChance + this.arrowAttackChance && availableAttacks.includes('arrow')) {
      console.log("Hell General chooses ARROW ATTACK!");
      this.performArrowAttack(player.x, player.y);
    } else if (availableAttacks.includes('main')) {
      console.log("Hell General chooses MAIN ATTACK!");
      this.attackPlayer(player);
    } else {
      // Fallback to any available attack
      const attack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
      switch (attack) {
        case 'slam':
          this.performSlamAttack(player.x, player.y);
          break;
        case 'arrow':
          this.performArrowAttack(player.x, player.y);
          break;
        default:
          this.attackPlayer(player);
      }
    }
  }

  performArrowAttack(targetX, targetY) {
    if (this.isArrowAttacking) return;

    this.isArrowAttacking = true;
    this.isAttacking = true;
    this.lastArrowAttackTime = this.scene.time.now;
    
    // Stop movement
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    
    // Store target position (player's last known position)
    this.arrowTargetX = targetX;
    this.arrowTargetY = targetY;
    
    // Play arrow attack animation
    this.play("hellGeneralArrow");
    
    // Create anticipation effect
    this.setTint(0x00ff88);
    
    // Fire arrow after animation delay
    this.scene.time.delayedCall(500, () => {
      this.fireArrow(this.arrowTargetX, this.arrowTargetY);
    });
    
    // Listen for animation complete
    this.once("animationcomplete-hellGeneralArrow", () => {
      this.isArrowAttacking = false;
      this.isAttacking = false;
      this.clearTint();
    });
    
    console.log(`Hell General performs ARROW ATTACK targeting (${targetX}, ${targetY})!`);
  }

  fireArrow(targetX, targetY) {
    // Calculate angle to target position
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    
    // Create arrow projectile
    const arrow = this.scene.physics.add.sprite(this.x, this.y, "arrow"); // You'll need an arrow sprite
    if (!arrow.body) {
      console.warn("Arrow sprite needs physics body");
      return;
    }
    
    arrow.setDepth(15);
    arrow.setRotation(angle);
    arrow.setScale(0.8);
    
    // Set arrow velocity towards target
    const velocityX = Math.cos(angle) * this.arrowSpeed;
    const velocityY = Math.sin(angle) * this.arrowSpeed;
    arrow.body.setVelocity(velocityX, velocityY);
    
    // Add arrow properties
    arrow.damage = this.arrowAttackDamage;
    arrow.targetX = targetX;
    arrow.targetY = targetY;
    arrow.firedBy = this;
    
    // Create trail effect
    this.createArrowTrail(arrow);
    
    // Check for collision with player
    this.scene.physics.add.overlap(arrow, this.scene.player, this.handleArrowHit, null, this.scene);
    
    // Auto-destroy arrow after some time or when it reaches target area
    this.scene.time.delayedCall(3000, () => {
      if (arrow && arrow.active) {
        arrow.destroy();
      }
    });
    
    // Check if arrow reached target area
    const checkTarget = () => {
      if (!arrow || !arrow.active) return;
      
      const distanceToTarget = Phaser.Math.Distance.Between(
        arrow.x, arrow.y, targetX, targetY
      );
      
      if (distanceToTarget < 30) {
        arrow.destroy();
      } else {
        this.scene.time.delayedCall(100, checkTarget);
      }
    };
    
    this.scene.time.delayedCall(100, checkTarget);
  }

  handleArrowHit(arrow, player) {
    if (!player || player.isDead || !arrow.active) return;
    
    // Deal damage to player
    if (player.takeDamage) {
      player.takeDamage(arrow.damage);
      console.log(`Player hit by Hell General's ARROW for ${arrow.damage} damage!`);
    }
    
    // Apply knockback
    if (player.body) {
      const knockbackForce = 200;
      const angle = Phaser.Math.Angle.Between(arrow.firedBy.x, arrow.firedBy.y, player.x, player.y);
      player.body.setVelocity(
        Math.cos(angle) * knockbackForce,
        Math.sin(angle) * knockbackForce
      );
    }
    
    // Destroy arrow
    arrow.destroy();
  }

  createArrowTrail(arrow) {
    // Create a trail effect that follows the arrow
    const trail = this.scene.add.particles(arrow.x, arrow.y, 'pixel', {
      speed: { min: 10, max: 30 },
      lifespan: 200,
      quantity: 2,
      scale: { start: 0.3, end: 0 },
      tint: 0x00ff88,
      blendMode: 'ADD'
    });
    
    trail.setDepth(14);
    
    // Make trail follow arrow
    const followArrow = () => {
      if (arrow && arrow.active && trail && trail.active) {
        trail.setPosition(arrow.x, arrow.y);
        this.scene.time.delayedCall(16, followArrow); // ~60fps updates
      } else if (trail && trail.active) {
        // Stop emitting and destroy after particles fade
        trail.stop();
        this.scene.time.delayedCall(500, () => {
          if (trail && trail.active) trail.destroy();
        });
      }
    };
    
    this.scene.time.delayedCall(16, followArrow);
  }

  performSlamAttack(targetX, targetY) {
    if (this.isSlamAttacking) return;

    this.isSlamAttacking = true;
    this.isAttacking = true;
    this.lastSlamAttackTime = this.scene.time.now;
    
    // Stop movement
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    
    // Play slam animation
    this.play("hellGeneralSlam");
    
    // Create anticipation effect
    this.setTint(0xff8800);
    
    // Create slam effect after animation delay
    this.scene.time.delayedCall(400, () => {
      this.createSlamEffect(this.x, this.y);
    });
    
    // Listen for animation complete
    this.once("animationcomplete-hellGeneralSlam", () => {
      this.isSlamAttacking = false;
      this.isAttacking = false;
      this.clearTint();
    });
    
    console.log(`Hell General performs SLAM ATTACK for ${this.slamAttackDamage} damage!`);
  }

  performSpinAttack() {
    if (this.isSpinAttacking) return;

    this.isSpinAttacking = true;
    this.isAttacking = true;
    
    // Stop movement
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    
    // Play spin animation
    this.play("hellGeneralSpin");
    
    // Create anticipation effect
    this.setTint(0xff6600);
    
    console.log(`Hell General performs SPIN ATTACK for ${this.spinAttackDamage} damage!`);
    
    // Create spin effect after short delay
    this.scene.time.delayedCall(300, () => {
      this.createSpinEffect();
    });
    
    // Listen for animation complete
    this.once("animationcomplete-hellGeneralSpin", () => {
      this.isSpinAttacking = false;
      this.clearTint();
      
      // Now proceed to main attack
      this.scene.time.delayedCall(100, () => {
        this.performMainAttack();
      });
    });
  }

  createSpinEffect() {
    // Create spinning slash effect circles
    const slashEffect1 = this.scene.add.circle(this.x, this.y, this.spinAttackRange, 0xff4400, 0.2);
    slashEffect1.setDepth(15);
    
    const slashEffect2 = this.scene.add.circle(this.x, this.y, this.spinAttackRange * 0.7, 0xff6600, 0.3);
    slashEffect2.setDepth(16);
    
    // Create rotating slash lines
    const slashLines = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const line = this.scene.add.line(
        this.x, this.y,
        0, 0,
        Math.cos(angle) * this.spinAttackRange,
        Math.sin(angle) * this.spinAttackRange,
        0xffaa00
      );
      line.setLineWidth(4);
      line.setDepth(17);
      slashLines.push(line);
    }
    
    // Animate effects
    this.scene.tweens.add({
      targets: [slashEffect1, slashEffect2],
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        slashEffect1.destroy();
        slashEffect2.destroy();
      }
    });
    
    // Animate rotating slash lines
    this.scene.tweens.add({
      targets: slashLines,
      rotation: Math.PI * 2,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        slashLines.forEach(line => line.destroy());
      }
    });
    
    // Check for damage to all enemies in range
    this.checkSpinAttackDamage();
  }

  checkSpinAttackDamage() {
    const player = this.scene.player;
    
    // Damage player if in range
    if (player && !player.isDead) {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.x, this.y,
        player.x, player.y
      );
      
      if (distanceToPlayer <= this.spinAttackRange) {
        if (player.takeDamage) {
          player.takeDamage(this.spinAttackDamage);
          console.log(`Player hit by Hell General's SPIN ATTACK for ${this.spinAttackDamage} damage!`);
        }
        
        // Apply knockback
        if (player.body) {
          const knockbackForce = 250;
          const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
          player.body.setVelocity(
            Math.cos(angle) * knockbackForce,
            Math.sin(angle) * knockbackForce
          );
        }
      }
    }
    
    // Damage other enemies in range (friendly fire effect)
    if (this.scene.zombieGroup && this.scene.zombieGroup.children) {
      this.scene.zombieGroup.children.entries.forEach(enemy => {
        if (enemy !== this && !enemy.isDead) {
          const distanceToEnemy = Phaser.Math.Distance.Between(
            this.x, this.y,
            enemy.x, enemy.y
          );
          
          if (distanceToEnemy <= this.spinAttackRange) {
            if (enemy.takeDamage) {
              enemy.takeDamage(Math.floor(this.spinAttackDamage * 0.5)); // 50% damage to other enemies
            }
            
            // Apply knockback to other enemies
            if (enemy.body) {
              const knockbackForce = 200;
              const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
              enemy.body.setVelocity(
                Math.cos(angle) * knockbackForce,
                Math.sin(angle) * knockbackForce
              );
            }
          }
        }
      });
    }
  }

  performMainAttack() {
    const player = this.scene.player;
    if (!player || !player.takeDamage) {
      this.isAttacking = false;
      return;
    }

    // Play main attack animation
    this.play("HellGeneralMainAttack");
    
    this.once("animationcomplete-HellGeneralMainAttack", () => {
      this.isAttacking = false;
    });
    
    // Deal damage after animation delay
    this.scene.time.delayedCall(200, () => {
      if (player && player.takeDamage) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y,
          player.x, player.y
        );
        
        // Only damage if still in range
        if (distance <= this.attackRange) {
          player.takeDamage(this.damage);
          console.log(`Hell General's MAIN ATTACK hits for ${this.damage} damage!`);
        }
      }
    });

    // Enhanced attack effects for boss
    this.setTint(0xff4400);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
  }

  createSlamEffect(x, y) {
    // Create ground impact effect
    const slamEffect = this.scene.add.circle(x, y, this.slamAttackRange, 0xff4400, 0.4);
    slamEffect.setDepth(10);
    
    // Create shockwave rings
    const ring1 = this.scene.add.circle(x, y, 20, 0xff0000, 0);
    ring1.setStrokeStyle(4, 0xff0000);
    ring1.setDepth(11);
    
    const ring2 = this.scene.add.circle(x, y, 30, 0xff4400, 0);
    ring2.setStrokeStyle(3, 0xff4400);
    ring2.setDepth(11);
    
    // Animate slam effect
    this.scene.tweens.add({
      targets: slamEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => slamEffect.destroy()
    });
    
    // Animate shockwave rings
    this.scene.tweens.add({
      targets: [ring1, ring2],
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        ring1.destroy();
        ring2.destroy();
      }
    });

    
    // Check for player damage
    this.checkSlamDamage(x, y);
  }

  checkSlamDamage(slamX, slamY) {
    const player = this.scene.player;
    if (!player || player.isDead) return;
    
    const distanceToPlayer = Phaser.Math.Distance.Between(
      slamX, slamY,
      player.x, player.y
    );
    
    // Damage player if within slam range
    if (distanceToPlayer <= this.slamAttackRange) {
      if (player.takeDamage) {
        player.takeDamage(this.slamAttackDamage);
        console.log(`Player hit by Hell General's SLAM for ${this.slamAttackDamage} damage!`);
      }
      
      // Apply massive knockback
      if (player.body) {
        const knockbackForce = 400;
        const angle = Phaser.Math.Angle.Between(slamX, slamY, player.x, player.y);
        player.body.setVelocity(
          Math.cos(angle) * knockbackForce,
          Math.sin(angle) * knockbackForce
        );
      }
      
      // Player screen flash effect
      if (this.scene.cameras && this.scene.cameras.main) {
        this.scene.cameras.main.flash(200, 255, 100, 100, false);
      }
    }
    
    // Also damage other nearby enemies for dramatic effect
    if (this.scene.zombieGroup && this.scene.zombieGroup.children) {
      this.scene.zombieGroup.children.entries.forEach(enemy => {
        if (enemy !== this && !enemy.isDead) {
          const distanceToEnemy = Phaser.Math.Distance.Between(
            slamX, slamY,
            enemy.x, enemy.y
          );
          
          if (distanceToEnemy <= this.slamAttackRange * 0.8) {
            if (enemy.takeDamage) {
              enemy.takeDamage(Math.floor(this.slamAttackDamage * 0.3)); // 30% damage to other enemies
            }
          }
        }
      });
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
    if (this.isArrowAttacking) {
      // Arrow attack animation takes priority
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "hellGeneralArrow"
      ) {
        this.play("hellGeneralArrow");
      }
    } else if (this.isSlamAttacking) {
      // Slam attack animation takes priority
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "hellGeneralSlam"
      ) {
        this.play("hellGeneralSlam");
      }
    } else if (this.isSpinAttacking) {
      // Spin attack animation takes priority
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "hellGeneralSpin"
      ) {
        this.play("hellGeneralSpin");
      }
    } else if (this.isAttacking) {
      if (
        !this.anims.isPlaying ||
        this.anims.currentAnim.key !== "HellGeneralMainAttack"
      ) {
        this.play("HellGeneralMainAttack");
      }
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

    this.lastAttackTime = this.scene.time.now;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.performSpinAttack();
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