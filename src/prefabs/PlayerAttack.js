// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayerAttack extends Phaser.GameObjects.Container {

    constructor(scene, player) {
        super(scene, 0, 0);

        /* START-USER-CTR-CODE */
        this.player = player;
        
        scene.add.existing(this);
        
        // Slash attack (AOE melee)
        this.slashDamage = player.slashDamage || 10;
        this.slashFireRate = player.slashFireRate || 1;
        this.slashRange = player.slashRange || 50;
        this.slashCooldown = 1000 / this.slashFireRate;
        this.lastSlashTime = 0;
        
        // Fire projectile attack
        this.fireDamage = player.fireDamage || 15;
        this.fireFireRate = player.fireFireRate || 0.8;
        this.fireRange = player.fireRange || 200;
        this.fireCooldown = 1000 / this.fireFireRate;
        this.lastFireTime = 0;
        this.fireProjectileSpeed = 150;
        
        // Ice projectile attack
        this.iceDamage = player.iceDamage || 12;
        this.iceFireRate = player.iceFireRate || 0.6;
        this.iceRange = player.iceRange || 180;
        this.iceCooldown = 1000 / this.iceFireRate;
        this.lastIceTime = 0;
        this.iceProjectileSpeed = 120;
        
        // Attack types enabled
        this.attackTypes = {
            slash: true,
            fire: true,
            ice: true
        };
        
        this.setupWeaponVisuals();
        this.createAttackAnimations();
        this.createProjectileGroups();
        this.startAttackTimers();
        
        scene.playerAttack = this;
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    setupWeaponVisuals() {
        // Slash range indicator
        this.slashVisual = this.scene.add.arc(0, 0, this.slashRange, 0, Math.PI / 2, false, 0x00ff00, 0.3);
        this.slashVisual.setVisible(false);
        this.add(this.slashVisual);
        
        // Slash attack sprite
        this.slashSprite = this.scene.add.sprite(0, 0, 'AOE_Basic_Slash_Attack_V01');
        this.slashSprite.setVisible(false);
        this.slashSprite.setOrigin(0.5, 0.5);
        this.add(this.slashSprite);
    }
    
    createProjectileGroups() {
        this.fireProjectiles = this.scene.add.group();
        this.iceProjectiles = this.scene.add.group();
        this.scene.physics.world.enable(this.fireProjectiles);
        this.scene.physics.world.enable(this.iceProjectiles);
    }
    
    createAttackAnimations() {
        // Slash animations
        if (!this.scene.anims.exists('slash_attack_v01')) {
            this.scene.anims.create({
                key: 'slash_attack_v01',
                frames: this.scene.anims.generateFrameNumbers('AOE_Basic_Slash_Attack_V01', { 
                    start: 0, end: -1
                }),
                frameRate: 15,
                repeat: 0
            });
        }
        
        // Fire projectile animations
        if (!this.scene.anims.exists('fire_projectile')) {
            this.scene.anims.create({
                key: 'fire_projectile',
                frames: this.scene.anims.generateFrameNumbers('AOE_Fire_Ball_Projectile_VFX_V01', { 
                    start: 0, end: -1
                }),
                frameRate: 20,
                repeat: -1
            });
        }
        
        if (this.scene.textures.exists('AOE_Fire_Blast_Attack_VFX_V01')) {
            if (!this.scene.anims.exists('fire_explosion')) {
                this.scene.anims.create({
                    key: 'fire_explosion',
                    frames: this.scene.anims.generateFrameNumbers('AOE_Fire_Blast_Attack_VFX_V01', { 
                        start: 0, end: -1
                    }),
                    frameRate: 25,
                    repeat: 0
                });
            }
        }
        
        // Ice projectile animations
        if (!this.scene.anims.exists('ice_projectile')) {
            this.scene.anims.create({
                key: 'ice_projectile',
                frames: this.scene.anims.generateFrameNumbers('AOE_Ice_Shard_Projectile_VFX_V01', { 
                    start: 0, end: -1
                }),
                frameRate: 16,
                repeat: -1
            });
        }
        
        // Ice explosion animation
        if (!this.scene.anims.exists('ice_explosion')) {
            this.scene.anims.create({
                key: 'ice_explosion',
                frames: this.scene.anims.generateFrameNumbers('AOE_Ice_Shard_v01', { 
                    start: 0, end: -1
                }),
                frameRate: 20,
                repeat: 0
            });
        }
    }
    
    startAttackTimers() {
        if (this.attackTypes.slash) {
            this.slashTimer = this.scene.time.addEvent({
                delay: this.slashCooldown,
                callback: this.attemptSlashAttack,
                callbackScope: this,
                loop: true
            });
        }
        
        if (this.attackTypes.fire) {
            this.fireTimer = this.scene.time.addEvent({
                delay: this.fireCooldown,
                callback: this.attemptFireAttack,
                callbackScope: this,
                loop: true
            });
        }
        
        if (this.attackTypes.ice) {
            this.iceTimer = this.scene.time.addEvent({
                delay: this.iceCooldown,
                callback: this.attemptIceAttack,
                callbackScope: this,
                loop: true
            });
        }
    }
    
    // SLASH ATTACK
    attemptSlashAttack() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastSlashTime < this.slashCooldown) return;
        
        const enemiesInRange = this.findEnemiesInSlashRange();
        if (enemiesInRange.length > 0) {
            this.slashAttack(enemiesInRange);
        }
    }
    
    findEnemiesInSlashRange() {
        if (!this.scene.enemies || !this.player) return [];
        
        const enemiesInRange = [];
        const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            if (distance <= this.slashRange) {
                enemiesInRange.push({ enemy: enemy, distance: distance });
            }
        });
        
        return enemiesInRange;
    }
    
    slashAttack(enemiesInRange) {
        this.lastSlashTime = this.scene.time.now;
        
        this.x = this.player.x;
        this.y = this.player.y;
        
        // Show slash animation
        this.slashSprite.setPosition(0, 0);
        this.slashSprite.setVisible(true);
        this.slashSprite.setScale(1.2);
        this.slashSprite.play('slash_attack_v01');
        
        this.slashSprite.once('animationcomplete', () => {
            this.slashSprite.setVisible(false);
            this.slashSprite.setScale(1);
        });

        // Damage all enemies in range
        enemiesInRange.forEach((enemyData) => {
            if (enemyData.enemy.takeDamage && enemyData.enemy.active && !enemyData.enemy.isDead) {
                enemyData.enemy.takeDamage(this.slashDamage);
            }
        });
        
        this.showSlashIndicator();
    }
    
    // FIRE PROJECTILE ATTACK
    attemptFireAttack() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastFireTime < this.fireCooldown) return;
        
        const target = this.findNearestEnemyInRange(this.fireRange);
        if (target) {
            this.fireProjectileAttack(target);
        }
    }
    
    fireProjectileAttack(target) {
        this.lastFireTime = this.scene.time.now;
        
        const fireProjectile = this.scene.add.sprite(this.player.x, this.player.y, 'AOE_Fire_Ball_Projectile_VFX_V01');
        this.scene.physics.add.existing(fireProjectile);
        
        fireProjectile.setScale(0.8);
        fireProjectile.play('fire_projectile');
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        
        fireProjectile.body.setVelocity(
            Math.cos(angle) * this.fireProjectileSpeed,
            Math.sin(angle) * this.fireProjectileSpeed
        );
        
        fireProjectile.damage = this.fireDamage;
        fireProjectile.startX = this.player.x;
        fireProjectile.startY = this.player.y;
        fireProjectile.maxRange = this.fireRange;
        fireProjectile.isFireProjectile = true;
        
        this.fireProjectiles.add(fireProjectile);
    }
    
    explodeFireProjectile(projectile) {
        if (!projectile.active) return;
        
        // Create explosion effect
        if (this.scene.anims.exists('fire_explosion')) {
            const explosion = this.scene.add.sprite(projectile.x, projectile.y, 'AOE_Fire_Blast_Attack_VFX_V01');
            explosion.setScale(1.2);
            explosion.play('fire_explosion');
            explosion.once('animationcomplete', () => explosion.destroy());
        }
        
        // Deal damage to nearby enemies
        if (this.scene.enemies) {
            const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
            enemies.forEach(enemy => {
                const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, enemy.x, enemy.y);
                
                if (distance <= 40) {
                    if (enemy.takeDamage) {
                        enemy.takeDamage(projectile.damage);
                        this.applyBurnEffect(enemy, projectile.damage * 0.3, 3000);
                    }
                }
            });
        }
        
        projectile.destroy();
    }
    
    // ICE PROJECTILE ATTACK
    attemptIceAttack() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastIceTime < this.iceCooldown) return;
        
        const target = this.findNearestEnemyInRange(this.iceRange);
        if (target) {
            this.iceProjectileAttack(target);
        }
    }
    
    iceProjectileAttack(target) {
        this.lastIceTime = this.scene.time.now;
        
        const iceProjectile = this.scene.add.sprite(this.player.x, this.player.y, 'AOE_Ice_Shard_Projectile_VFX_V01');
        this.scene.physics.add.existing(iceProjectile);
        
        iceProjectile.setScale(0.8);
        iceProjectile.play('ice_projectile');
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        iceProjectile.setRotation(angle);
        
        iceProjectile.body.setVelocity(
            Math.cos(angle) * this.iceProjectileSpeed,
            Math.sin(angle) * this.iceProjectileSpeed
        );
        
        iceProjectile.damage = this.iceDamage;
        iceProjectile.startX = this.player.x;
        iceProjectile.startY = this.player.y;
        iceProjectile.maxRange = this.iceRange;
        iceProjectile.isIceProjectile = true;
        
        this.iceProjectiles.add(iceProjectile);
    }
    
    createIceExplosionEffect(x, y) {
        if (this.scene.anims.exists('ice_explosion')) {
            const iceExplosion = this.scene.add.sprite(x, y, 'AOE_Ice_Shard_v01');
            iceExplosion.setScale(0.8);
            iceExplosion.setOrigin(0.5, 0.5);
            iceExplosion.play('ice_explosion');
            iceExplosion.once('animationcomplete', () => iceExplosion.destroy());
        }
    }
    
    // FIRE DOT EFFECT
    applyBurnEffect(enemy, dotDamage, duration) {
        if (!enemy || enemy.isDead) return;
        
        if (enemy.burnTimer) enemy.burnTimer.destroy();
        
        if (enemy.originalTint === undefined) {
            enemy.originalTint = enemy.tint;
        }
        
        enemy.setTint(0xff4400);
        
        const burnInterval = 500;
        const totalTicks = duration / burnInterval;
        const damagePerTick = dotDamage / totalTicks;
        let tickCount = 0;
        
        enemy.burnTimer = this.scene.time.addEvent({
            delay: burnInterval,
            callback: () => {
                if (!enemy || enemy.isDead || !enemy.active) {
                    this.clearBurnEffect(enemy);
                    return;
                }
                
                if (enemy.takeDamage) {
                    enemy.takeDamage(damagePerTick);
                }
                
                tickCount++;
                if (tickCount >= totalTicks) {
                    this.clearBurnEffect(enemy);
                }
            },
            repeat: totalTicks - 1
        });
    }
    
    clearBurnEffect(enemy) {
        if (!enemy) return;
        
        if (enemy.burnTimer) {
            enemy.burnTimer.destroy();
            enemy.burnTimer = null;
        }
        
        if (enemy.originalTint !== undefined) {
            enemy.setTint(enemy.originalTint);
        } else {
            enemy.clearTint();
        }
    }
    
    // ICE SLOW EFFECT
    applySlowEffect(enemy, slowPercentage, duration) {
        if (!enemy || enemy.isDead) return;
        
        if (enemy.slowTimer) enemy.slowTimer.destroy();
        
        if (enemy.originalSpeed === undefined) {
            enemy.originalSpeed = enemy.speed || 50;
        }
        if (enemy.originalTint === undefined) {
            enemy.originalTint = enemy.tint;
        }
        
        enemy.speed = enemy.originalSpeed * (1 - slowPercentage);
        enemy.setTint(0x88ddff);
        
        enemy.slowTimer = this.scene.time.delayedCall(duration, () => {
            this.clearSlowEffect(enemy);
        });
    }
    
    clearSlowEffect(enemy) {
        if (!enemy) return;
        
        if (enemy.originalSpeed !== undefined) {
            enemy.speed = enemy.originalSpeed;
        }
        
        if (enemy.slowTimer) {
            enemy.slowTimer.destroy();
            enemy.slowTimer = null;
        }
        
        if (enemy.originalTint !== undefined) {
            enemy.setTint(enemy.originalTint);
        } else {
            enemy.clearTint();
        }
    }
    
    // HELPER METHODS
    findNearestEnemyInRange(range) {
        if (!this.scene.enemies || !this.player) return null;
        
        let nearestEnemy = null;
        let nearestDistance = range;
        
        const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            
            if (distance <= range && distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }
    
    showSlashIndicator() {
        this.slashVisual.setVisible(true);
        this.slashVisual.setAlpha(0.5);
        
        const ringEffect = this.scene.add.circle(this.player.x, this.player.y, 10, 0x00ff00, 0);
        ringEffect.setStrokeStyle(3, 0x00ff00, 0.8);
        
        this.scene.tweens.add({
            targets: ringEffect,
            radius: this.slashRange,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => ringEffect.destroy()
        });
        
        this.scene.time.delayedCall(300, () => {
            this.slashVisual.setVisible(false);
        });
    }
    
    // UPDATE METHOD
    update() {
        // Update fire projectiles
        this.fireProjectiles.children.entries.forEach(projectile => {
            if (!projectile.active || !projectile.isFireProjectile) return;
            
            const distance = Phaser.Math.Distance.Between(
                projectile.startX, projectile.startY,
                projectile.x, projectile.y
            );
            
            if (distance >= projectile.maxRange) {
                this.explodeFireProjectile(projectile);
                return;
            }
            
            const enemyGroups = [this.scene.enemies, this.scene.zombieGroup].filter(group => group);
            
            enemyGroups.forEach(enemyGroup => {
                if (enemyGroup) {
                    const enemies = enemyGroup.getChildren().filter(enemy => enemy.active && !enemy.isDead);
                    enemies.forEach(enemy => {
                        const enemyDistance = Phaser.Math.Distance.Between(
                            projectile.x, projectile.y,
                            enemy.x, enemy.y
                        );
                        
                        if (enemyDistance <= 25) {
                            this.explodeFireProjectile(projectile);
                        }
                    });
                }
            });
        });
        
        // Update ice projectiles
        this.iceProjectiles.children.entries.forEach(projectile => {
            if (!projectile.active || !projectile.isIceProjectile) return;
            
            const distance = Phaser.Math.Distance.Between(
                projectile.startX, projectile.startY,
                projectile.x, projectile.y
            );
            
            if (distance >= projectile.maxRange) {
                this.createIceExplosionEffect(projectile.x, projectile.y);
                projectile.destroy();
                return;
            }
            
            if (this.scene.enemies) {
                const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
                enemies.forEach(enemy => {
                    const enemyDistance = Phaser.Math.Distance.Between(
                        projectile.x, projectile.y,
                        enemy.x, enemy.y
                    );
                    
                    if (enemyDistance <= 20) {
                        if (enemy.takeDamage) {
                            enemy.takeDamage(projectile.damage);
                            this.applySlowEffect(enemy, 0.5, 2000);
                            this.createIceExplosionEffect(projectile.x, projectile.y);
                        }
                        projectile.destroy();
                        return;
                    }
                });
            }
        });
    }
    
    updateStats() {
        if (this.player) {
            this.slashDamage = this.player.slashDamage || 10;
            this.slashFireRate = this.player.slashFireRate || 1;
            this.slashRange = this.player.slashRange || 50;
            this.slashCooldown = 1000 / this.slashFireRate;
            
            this.fireDamage = this.player.fireDamage || 15;
            this.fireFireRate = this.player.fireFireRate || 0.8;
            this.fireRange = this.player.fireRange || 200;
            this.fireCooldown = 1000 / this.fireFireRate;
            
            this.iceDamage = this.player.iceDamage || 12;
            this.iceFireRate = this.player.iceFireRate || 0.6;
            this.iceRange = this.player.iceRange || 180;
            this.iceCooldown = 1000 / this.iceFireRate;
            
            if (this.slashTimer) this.slashTimer.delay = this.slashCooldown;
            if (this.fireTimer) this.fireTimer.delay = this.fireCooldown;
            if (this.iceTimer) this.iceTimer.delay = this.iceCooldown;
            
            if (this.slashVisual) {
                this.slashVisual.setRadius(this.slashRange);
            }
        }
    }
    
    destroy() {
        if (this.slashTimer) this.slashTimer.destroy();
        if (this.fireTimer) this.fireTimer.destroy();
        if (this.iceTimer) this.iceTimer.destroy();
        
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                this.clearBurnEffect(enemy);
                this.clearSlowEffect(enemy);
            });
        }
        
        this.fireProjectiles.destroy(true);
        this.iceProjectiles.destroy(true);
        
        super.destroy();
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here