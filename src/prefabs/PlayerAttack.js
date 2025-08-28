// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { EventBus } from '../game/EventBus';
/* END-USER-IMPORTS */

export default class PlayerAttack extends Phaser.GameObjects.Container {

    constructor(scene, player) {
        super(scene, 0, 0);

        /* START-USER-CTR-CODE */
        if (!player) {
            console.error("PlayerAttack: No player provided to constructor!");
            return;
        }
        
        this.player = player;
        
        scene.add.existing(this);
        this.setDepth(18);
        
        // Slash attack (AOE melee)
        this.slashDamage = player.slashDamage || 10;
        this.slashFireRate = player.slashFireRate || 1;
        this.slashRange = player.slashRange || 70;
        this.slashCooldown = 2000 / this.slashFireRate; 
        
        // Fire bullet attack (piercing)
        this.fireBulletDamage = player.fireBulletDamage || 8;
        this.fireBulletFireRate = player.fireBulletFireRate || 1.2;
        this.fireBulletRange = player.fireBulletRange || 200;
        this.fireBulletCooldown = 2500 / this.fireBulletFireRate;
        this.fireBulletSpeed = 250;
        this.fireBulletDotDuration = 4000;
        
        // Fire bomb attack (AOE explosion)
        this.fireBombDamage = player.fireBombDamage || 18;
        this.fireBombFireRate = player.fireBombFireRate || 0.4;
        this.fireBombRange = player.fireBombRange || 80;
        this.fireBombCooldown = 3000 / this.fireBombFireRate;
        this.fireBombSpeed = 120;
        this.fireBombExplosionRadius = 50;
        this.fireBombDotDuration = 5000;
        
        // Ice projectile attack
        this.iceDamage = player.iceDamage || 12;
        this.iceFireRate = player.iceFireRate || 0.6;
        this.iceRange = player.iceRange || 180;
        this.iceCooldown = 2800 / this.iceFireRate;
        this.iceProjectileSpeed = 120;
        
        // Lightning chain attack
        this.lightningDamage = player.lightningDamage || 20;
        this.lightningFireRate = player.lightningFireRate || 0.5;
        this.lightningRange = player.lightningRange || 250;
        this.lightningCooldown = 4000 / this.lightningFireRate;
        this.lightningProjectileSpeed = 200;
        this.lightningChainCount = player.lightningChainCount || 10;
        this.lightningChainRange = 100;
        
        // Blinding Light attack
        this.blindingLightRange = player.blindingLightRange || 300;
        this.blindingLightFireRate = player.blindingLightFireRate || 0.15;
        this.blindingLightCooldown = 10000 / this.blindingLightFireRate;
        this.blindingLightDisableDuration = 4000;
        
        // Marksman attack
        this.marksmanDamage = player.marksmanDamage || 35;
        this.marksmanFireRate = player.marksmanFireRate || 0.3;
        this.marksmanRange = player.marksmanRange || 400;
        this.marksmanCooldown = 1500 / this.marksmanFireRate;
        this.marksmanSpeed = 400;
        
        // Attack types enabled
        this.attackTypes = {
            slash: true,
            fireBullet: false,
            fireBomb: false,
            ice: false,
            lightning: false,
            blindingLight: false,
            marksman: false
        };
        
        this.setupWeaponVisuals();
        this.createAttackAnimations();
        this.createProjectileGroups();
        this.startAttackTimers();
        
        scene.events.on('update', this.update, this);
        scene.playerAttack = this;
        
        this.connectToSkillSystem();
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    connectToSkillSystem() {
        try {
            this.scene.time.delayedCall(200, () => {
                if (this.scene.powerUpManager?.skillUpgradeManager) {
                    const skillManager = this.scene.powerUpManager.skillUpgradeManager;
                    
                    Object.keys(this.attackTypes).forEach(attackType => {
                        const skillKey = this.mapAttackTypeToSkill(attackType);
                        if (skillKey && skillManager.getSkillLevel(skillKey) > 0) {
                            this.attackTypes[attackType] = true;
                        }
                    });
                    
                    this.restartAttackTimers();
                    
                } else {
                    console.log('PlayerAttack: Skill upgrade system not available yet');
                }
            });
        } catch (error) {
            console.error('PlayerAttack: Error connecting to skill system:', error);
        }
    }
    
    mapAttackTypeToSkill(attackType) {
        const mapping = {
            'fireBullet': 'fireBullet',
            'fireBomb': 'fireBomb',
            'ice': 'ice',
            'lightning': 'lightning',
            'blindingLight': 'blindingLight',
            'marksman': 'marksman'
        };
        return mapping[attackType];
    }
    
    enableAttackType(attackType) {
        if (this.attackTypes.hasOwnProperty(attackType)) {
            this.attackTypes[attackType] = true;
            this.createTimerForAttackType(attackType, true);
        }
    }
    
    createTimerForAttackType(attackType, immediate = false) {
        const cooldown = this.getCooldownForAttackType(attackType);
        
        if (immediate) {
            this.scene.time.delayedCall(100, () => {
                this.triggerAttackByType(attackType);
                this.createNormalTimerForAttackType(attackType, cooldown);
            });
        } else {
            this.createNormalTimerForAttackType(attackType, cooldown);
        }
    }
    
    createNormalTimerForAttackType(attackType, cooldown) {
        switch(attackType) {
            case 'slash':
                if (this.slashTimer) this.slashTimer.destroy();
                this.slashTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptSlashAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'fireBullet':
                if (this.fireBulletTimer) this.fireBulletTimer.destroy();
                this.fireBulletTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptFireBulletAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'fireBomb':
                if (this.fireBombTimer) this.fireBombTimer.destroy();
                this.fireBombTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptFireBombAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'ice':
                if (this.iceTimer) this.iceTimer.destroy();
                this.iceTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptIceAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'lightning':
                if (this.lightningTimer) this.lightningTimer.destroy();
                this.lightningTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptLightningAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'blindingLight':
                if (this.blindingLightTimer) this.blindingLightTimer.destroy();
                this.blindingLightTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptBlindingLightAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
                
            case 'marksman':
                if (this.marksmanTimer) this.marksmanTimer.destroy();
                this.marksmanTimer = this.scene.time.addEvent({
                    delay: cooldown,
                    callback: this.attemptMarksmanAttack,
                    callbackScope: this,
                    loop: true
                });
                break;
        }
    }
    
    triggerAttackByType(attackType) {
        switch(attackType) {
            case 'slash':
                this.attemptSlashAttack();
                break;
            case 'fireBullet':
                this.attemptFireBulletAttack();
                break;
            case 'fireBomb':
                this.attemptFireBombAttack();
                break;
            case 'ice':
                this.attemptIceAttack();
                break;
            case 'lightning':
                this.attemptLightningAttack();
                break;
            case 'blindingLight':
                this.attemptBlindingLightAttack();
                break;
            case 'marksman':
                this.attemptMarksmanAttack();
                break;
        }
    }
    
    getCooldownForAttackType(attackType) {
        switch(attackType) {
            case 'slash': return this.slashCooldown;
            case 'fireBullet': return this.fireBulletCooldown;
            case 'fireBomb': return this.fireBombCooldown;
            case 'ice': return this.iceCooldown;
            case 'lightning': return this.lightningCooldown;
            case 'blindingLight': return this.blindingLightCooldown;
            case 'marksman': return this.marksmanCooldown;
            default: return 1000;
        }
    }
    
    restartAttackTimers() {
        if (this.fireBulletTimer) this.fireBulletTimer.destroy();
        if (this.fireBombTimer) this.fireBombTimer.destroy();
        if (this.iceTimer) this.iceTimer.destroy();
        if (this.lightningTimer) this.lightningTimer.destroy();
        if (this.blindingLightTimer) this.blindingLightTimer.destroy();
        if (this.marksmanTimer) this.marksmanTimer.destroy();
        this.startAttackTimers();
    }
    

    
    // MARKSMAN ATTACK
    attemptMarksmanAttack() {
        const target = this.findNearestEnemyInRange(this.marksmanRange);
        if (target) {
            this.marksmanAttack(target);
        }
    }
    
    marksmanAttack(target) {
        EventBus.emit('attack-used', {
            attackType: 'marksman',
            cooldown: this.marksmanCooldown
        });
        
        const marksmanProjectile = this.scene.add.circle(this.player.x, this.player.y, 4, 0xffffff);
        this.scene.physics.add.existing(marksmanProjectile);
        
        marksmanProjectile.setDepth(19);
        marksmanProjectile.setStrokeStyle(2, 0xcccccc, 0.9);
        
        const trail = this.scene.add.rectangle(this.player.x, this.player.y, 25, 3, 0xffffff, 0.7);
        this.scene.physics.add.existing(trail);
        trail.setDepth(18);
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        marksmanProjectile.setRotation(angle);
        trail.setRotation(angle);
        
        marksmanProjectile.body.setVelocity(
            Math.cos(angle) * this.marksmanSpeed,
            Math.sin(angle) * this.marksmanSpeed
        );
        
        trail.body.setVelocity(
            Math.cos(angle) * this.marksmanSpeed,
            Math.sin(angle) * this.marksmanSpeed
        );
        
        marksmanProjectile.damage = this.marksmanDamage;
        marksmanProjectile.startX = this.player.x;
        marksmanProjectile.startY = this.player.y;
        marksmanProjectile.maxRange = this.marksmanRange;
        marksmanProjectile.isMarksmanProjectile = true;
        marksmanProjectile.trail = trail;
        marksmanProjectile.hitEnemies = [];
        marksmanProjectile.maxPierceTargets = 3;
        marksmanProjectile.currentPierceCount = 0;
        
        this.marksmanProjectiles.add(marksmanProjectile);
        
        // Clean up after 3 seconds if still active
        this.scene.time.delayedCall(3000, () => {
            if (marksmanProjectile.active) {
                marksmanProjectile.destroy();
                if (trail && trail.active) trail.destroy();
            }
        });
    }
    
    setupWeaponVisuals() {
        this.slashVisual = this.scene.add.arc(0, 0, this.slashRange, 0, Math.PI / 2, false, 0x00ff00, 0.3);
        this.slashVisual.setVisible(false);
        this.slashVisual.setDepth(17);
        this.add(this.slashVisual);
        
        this.slashSprite = this.scene.add.sprite(0, 0, 'AOE_Basic_Slash_Attack_V01');
        this.slashSprite.setVisible(false);
        this.slashSprite.setOrigin(0.5, 0.5);
        this.slashSprite.setDepth(18);
        this.add(this.slashSprite);
        
        this.blindingLightVisual = this.scene.add.circle(0, 0, this.blindingLightRange, 0xffffff, 0);
        this.blindingLightVisual.setStrokeStyle(6, 0xffffff, 0.8);
        this.blindingLightVisual.setVisible(false);
        this.blindingLightVisual.setDepth(19);
        this.add(this.blindingLightVisual);
    }
    
    createProjectileGroups() {
        this.fireBulletProjectiles = this.scene.add.group();
        this.fireBombProjectiles = this.scene.add.group();
        this.iceProjectiles = this.scene.add.group();
        this.lightningProjectiles = this.scene.add.group();
        this.marksmanProjectiles = this.scene.add.group();
        
        this.scene.physics.world.enable(this.fireBulletProjectiles);
        this.scene.physics.world.enable(this.fireBombProjectiles);
        this.scene.physics.world.enable(this.iceProjectiles);
        this.scene.physics.world.enable(this.lightningProjectiles);
        this.scene.physics.world.enable(this.marksmanProjectiles);
    }
    
    createAttackAnimations() {
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
        if (!this.scene.anims.exists('fire_bullet')) {
            this.scene.anims.create({
                key: 'fire_bullet',
                frames: this.scene.anims.generateFrameNumbers('AOE_Fire_Ball_Projectile_VFX_V01', { 
                    start: 0, end: -1
                }),
                frameRate: 25,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('fire_bomb')) {
            this.scene.anims.create({
                key: 'fire_bomb',
                frames: this.scene.anims.generateFrameNumbers('AOE_Fire_Ball_Projectile_VFX_V01', { 
                    start: 0, end: -1
                }),
                frameRate: 15,
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
        
        // Lightning animations
        if (!this.scene.anims.exists('lightning_projectile')) {
            this.scene.anims.create({
                key: 'lightning_projectile',
                frames: this.scene.anims.generateFrameNumbers('lighting_chain_projectile_attack_VFX_128x32_v01', { 
                    start: 0, end: -1
                }),
                frameRate: 24,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('lightning_hit')) {
            this.scene.anims.create({
                key: 'lightning_hit',
                frames: this.scene.anims.generateFrameNumbers('lighting_chain_attack_hit_projectile_VFX_72x96_v01', { 
                    start: 0, end: -1
                }),
                frameRate: 30,
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
            console.log(`PlayerAttack: Slash timer created with ${this.slashCooldown}ms delay`);
        }
        
        if (this.attackTypes.fireBullet) {
            this.fireBulletTimer = this.scene.time.addEvent({
                delay: this.fireBulletCooldown,
                callback: this.attemptFireBulletAttack,
                callbackScope: this,
                loop: true
            });
        }
        
        if (this.attackTypes.fireBomb) {
            this.fireBombTimer = this.scene.time.addEvent({
                delay: this.fireBombCooldown,
                callback: this.attemptFireBombAttack,
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
        
        if (this.attackTypes.lightning) {
            this.lightningTimer = this.scene.time.addEvent({
                delay: this.lightningCooldown,
                callback: this.attemptLightningAttack,
                callbackScope: this,
                loop: true
            });
        }
        
        if (this.attackTypes.blindingLight) {
            this.blindingLightTimer = this.scene.time.addEvent({
                delay: this.blindingLightCooldown,
                callback: this.attemptBlindingLightAttack,
                callbackScope: this,
                loop: true
            });
        }
        
        if (this.attackTypes.marksman) {
            this.marksmanTimer = this.scene.time.addEvent({
                delay: this.marksmanCooldown,
                callback: this.attemptMarksmanAttack,
                callbackScope: this,
                loop: true
            });
        }
    }
    
    // SLASH ATTACK
    attemptSlashAttack() {
        const enemiesInRange = this.findEnemiesInSlashRange();
        if (enemiesInRange.length > 0) {
            this.slashAttack(enemiesInRange);
        }
    }
    
    findEnemiesInSlashRange() {
        if (!this.player) {
            return [];
        }
        
        if (this.player.x === undefined || this.player.y === undefined) {
            return [];
        }
    
        const enemiesInRange = [];
        
        if (this.scene.enemies && this.scene.enemies.children) {
            const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
            
            enemies.forEach(enemy => {
                if (!enemy || enemy.x === undefined || enemy.y === undefined) {
                    console.warn("PlayerAttack: Invalid enemy found:", enemy);
                    return;
                }
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                
                if (distance <= this.slashRange) {
                    enemiesInRange.push({ enemy: enemy, distance: distance });
                }
            });
        } else {
            console.log("PlayerAttack: No scene.enemies group found or it's empty");
        }
    
        if (this.scene.breakableVases && this.scene.breakableVases.children) {
            const vases = this.scene.breakableVases.getChildren().filter(vase => vase.active && !vase.isBroken);
            
            vases.forEach(vase => {
                if (!vase || vase.x === undefined || vase.y === undefined) {
                    console.warn("PlayerAttack: Invalid vase found:", vase);
                    return;
                }
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    vase.x, vase.y
                );
                
                if (distance <= this.slashRange) {
                    enemiesInRange.push({ enemy: vase, distance: distance, isVase: true });
                }
            });
        }
        
        if (this.scene.children && this.scene.children.list) {
            this.scene.children.list.forEach(child => {
                const isVase = child && 
                              child.active && 
                              !child.isBroken && 
                              child.canBeAttacked &&
                              (child.constructor.name === 'BreakableVase' || 
                               child.texture?.key === 'Vase' ||
                               child.onPlayerAttack ||
                               (child.takeDamage && child.dropLoot));
                               
                if (isVase && child.x !== undefined && child.y !== undefined) {
                    const distance = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y,
                        child.x, child.y
                    );
                    
                    if (distance <= this.slashRange) {
                        const alreadyFound = enemiesInRange.some(item => item.enemy === child);
                        if (!alreadyFound) {
                            enemiesInRange.push({ enemy: child, distance: distance, isVase: true });
                        }
                    }
                }
            });
        }
        return enemiesInRange;
    }
    
    slashAttack(enemiesInRange) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'slash',
            cooldown: this.slashCooldown
        });
        
        this.showSlashIndicator();
        this.x = this.player.x;
        this.y = this.player.y;
        
        this.slashSprite.setPosition(0, 0);
        this.slashSprite.setVisible(true);
        this.slashSprite.play('slash_attack_v01');
        
        enemiesInRange.forEach(({ enemy, distance, isVase }) => {
            if (isVase && enemy.onPlayerAttack) {
                enemy.onPlayerAttack(this.slashDamage);
            } else if (enemy.takeDamage) {
                enemy.takeDamage(this.slashDamage);
            } else {
                console.warn("PlayerAttack: Enemy has no takeDamage method!", enemy);
            }
        });
        
        this.scene.time.delayedCall(300, () => {
            this.slashSprite.setVisible(false);
        });
        this.slashSprite.setVisible(true);
        this.slashSprite.setScale(1.4);
        this.slashSprite.setDepth(18);
        this.slashSprite.play('slash_attack_v01');
        
        this.slashSprite.once('animationcomplete', () => {
            this.slashSprite.setVisible(false);
            this.slashSprite.setScale(1);
        });

        enemiesInRange.forEach((enemyData) => {
            if (enemyData.enemy.active && !enemyData.enemy.isDead) {
                if (enemyData.isVase) {
                    if (enemyData.enemy.onPlayerAttack) {
                        enemyData.enemy.onPlayerAttack(this.slashDamage);
                    }
                } else {
                    if (enemyData.enemy.takeDamage) {
                        enemyData.enemy.takeDamage(this.slashDamage);
                    }
                }
            }
        });
        
        this.showSlashIndicator();
    }
    
    attemptBlindingLightAttack() {
        const enemiesInRange = this.findEnemiesInBlindingLightRange();
        if (enemiesInRange.length > 0) {
            this.blindingLightAttack(enemiesInRange);
        }
    }
    
    findEnemiesInBlindingLightRange() {
    if (!this.scene.enemies || !this.player) return [];
    
    const enemiesInRange = [];
    
    // Check main enemies with safety check
    if (this.scene.enemies && this.scene.enemies.children) {
    const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
    
    enemies.forEach(enemy => {
     const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      enemy.x, enemy.y
    );
     
      if (distance <= this.blindingLightRange) {
       enemiesInRange.push({ enemy: enemy, distance: distance });
      }
    });
    }
    
    // Check zombie group with safety check
    if (this.scene.zombieGroup && this.scene.zombieGroup.children) {
    const zombies = this.scene.zombieGroup.getChildren().filter(zombie => zombie.active && !zombie.isDead);
    
    zombies.forEach(zombie => {
    const distance = Phaser.Math.Distance.Between(
    this.player.x, this.player.y,
     zombie.x, zombie.y
     );
      
      if (distance <= this.blindingLightRange) {
       enemiesInRange.push({ enemy: zombie, distance: distance });
       }
			});
		}
		
		return enemiesInRange;
	}
    
    blindingLightAttack(enemiesInRange) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'blindingLight',
            cooldown: this.blindingLightCooldown
        });
        
        this.x = this.player.x;
        this.y = this.player.y;
        
        this.applyPlayerInvincibility(3000);
        
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                this.createBlindingLightRing(i);
            });
        }
        
        enemiesInRange.forEach((enemyData) => {
            if (enemyData.enemy.active && !enemyData.enemy.isDead) {
                this.applyBlindEffect(enemyData.enemy, this.blindingLightDisableDuration);
            }
        });
        
        this.createScreenFlash();
    }
    
    createBlindingLightRing(ringIndex) {
        const ring = this.scene.add.circle(this.player.x, this.player.y, 20, 0xffffff, 0);
        ring.setStrokeStyle(4 - ringIndex, 0xffffff, 0.9 - ringIndex * 0.2);
        ring.setDepth(20);
        
        this.scene.tweens.add({
            targets: ring,
            radius: this.blindingLightRange + ringIndex * 50,
            alpha: 0,
            duration: 800 + ringIndex * 200,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });
    }
    
    createScreenFlash() {
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xffffff,
            0.8
        );
        flash.setDepth(100);
        flash.setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    applyBlindEffect(enemy, duration) {
        if (!enemy || enemy.isDead) return;
        
        if (enemy.blindTimer) enemy.blindTimer.destroy();
        
        if (enemy.originalTint === undefined) {
            enemy.originalTint = enemy.tint;
        }
        
        enemy.setTint(0xffffff);
        enemy.isBlinded = true;
        
        if (enemy.canAttack !== undefined) {
            enemy.originalCanAttack = enemy.canAttack;
            enemy.canAttack = false;
        }
        
        if (enemy.originalSpeed === undefined) {
            enemy.originalSpeed = enemy.speed || 50;
        }
        enemy.speed = enemy.originalSpeed * 0.3;
        
        enemy.blindTimer = this.scene.time.delayedCall(duration, () => {
            this.clearBlindEffect(enemy);
        });
    }
    
    clearBlindEffect(enemy) {
        if (!enemy) return;
        
        if (enemy.blindTimer) {
            enemy.blindTimer.destroy();
            enemy.blindTimer = null;
        }
        
        if (enemy.originalTint !== undefined) {
            enemy.setTint(enemy.originalTint);
        } else {
            enemy.clearTint();
        }
        
        if (enemy.originalCanAttack !== undefined) {
            enemy.canAttack = enemy.originalCanAttack;
        }
        
        if (enemy.originalSpeed !== undefined) {
            enemy.speed = enemy.originalSpeed;
        }
        
        enemy.isBlinded = false;
    }
    
    applyPlayerInvincibility(duration) {
        if (!this.player) return;
        
        if (this.player.invincibilityTimer) {
            this.player.invincibilityTimer.destroy();
        }
        
        if (this.player.originalTint === undefined) {
            this.player.originalTint = this.player.tint;
        }
        
        this.player.isInvincible = true;
        this.player.isInvulnerable = true;
        
        this.player.invincibilityTween = this.scene.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 200,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
        
        this.player.setTint(0xffd700);
        
        this.createProtectiveAura();
        
        this.player.invincibilityTimer = this.scene.time.delayedCall(duration, () => {
            this.clearPlayerInvincibility();
        });
    }
    
    createProtectiveAura() {
        if (!this.player) return;
        
        const aura = this.scene.add.circle(this.player.x, this.player.y, 40, 0xffd700, 0);
        aura.setStrokeStyle(3, 0xffd700, 0.6);
        aura.setDepth(this.player.depth - 1);
        
        this.player.protectiveAura = aura;
        
        this.scene.tweens.add({
            targets: aura,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.3,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    clearPlayerInvincibility() {
        if (!this.player) return;
        
        this.player.isInvincible = false;
        this.player.isInvulnerable = false;
        
        if (this.player.invincibilityTween) {
            this.player.invincibilityTween.stop();
            this.player.invincibilityTween = null;
        }
        
        this.player.setAlpha(1);
        if (this.player.originalTint !== undefined) {
            this.player.setTint(this.player.originalTint);
        } else {
            this.player.clearTint();
        }
        
        if (this.player.protectiveAura) {
            this.player.protectiveAura.destroy();
            this.player.protectiveAura = null;
        }
        
        if (this.player.invincibilityTimer) {
            this.player.invincibilityTimer.destroy();
            this.player.invincibilityTimer = null;
        }
    }
    
    // FIRE BULLET ATTACK (Fast piercing)
    attemptFireBulletAttack() {
        const target = this.findNearestEnemyInRange(this.fireBulletRange);
        if (target) {
            this.fireBulletAttack(target);
        }
    }
    
    fireBulletAttack(target) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'fireBullet',
            cooldown: this.fireBulletCooldown
        });
        
        const fireBullet = this.scene.add.sprite(this.player.x, this.player.y, 'AOE_Fire_Ball_Projectile_VFX_V01');
        this.scene.physics.add.existing(fireBullet);
        
        fireBullet.setScale(0.6);
        fireBullet.setDepth(18);
        fireBullet.play('fire_bullet');
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        
        fireBullet.body.setVelocity(
            Math.cos(angle) * this.fireBulletSpeed,
            Math.sin(angle) * this.fireBulletSpeed
        );
        
        fireBullet.damage = this.fireBulletDamage;
        fireBullet.startX = this.player.x;
        fireBullet.startY = this.player.y;
        fireBullet.maxRange = this.fireBulletRange;
        fireBullet.isFireBullet = true;
        fireBullet.hitEnemies = [];
        
        this.fireBulletProjectiles.add(fireBullet);
    }
    
    // FIRE BOMB ATTACK (Delayed AOE explosion)
    attemptFireBombAttack() {
        const target = this.findNearestEnemyInRange(this.fireBombRange);
        if (target) {
            this.fireBombAttack(target);
        }
    }
    
    fireBombAttack(target) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'fireBomb',
            cooldown: this.fireBombCooldown
        });
        
        const fireBomb = this.scene.add.sprite(this.player.x, this.player.y, 'AOE_Fire_Ball_Projectile_VFX_V01');
        this.scene.physics.add.existing(fireBomb);
        
        fireBomb.setScale(1.0);
        fireBomb.setDepth(18);
        fireBomb.play('fire_bomb');
        fireBomb.setTint(0xff6600);
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        
        fireBomb.body.setVelocity(
            Math.cos(angle) * this.fireBombSpeed,
            Math.sin(angle) * this.fireBombSpeed
        );
        
        fireBomb.damage = this.fireBombDamage;
        fireBomb.startX = this.player.x;
        fireBomb.startY = this.player.y;
        fireBomb.maxRange = this.fireBombRange;
        fireBomb.targetX = target.x;
        fireBomb.targetY = target.y;
        fireBomb.isFireBomb = true;
        fireBomb.hasExploded = false;
        
        this.fireBombProjectiles.add(fireBomb);
    }
    
    explodeFireBomb(bomb) {
        if (!bomb.active || bomb.hasExploded) return;
        
        bomb.hasExploded = true;
        bomb.body.setVelocity(0, 0);
        
        this.scene.time.delayedCall(500, () => {
            if (!bomb.active) return;
            
            if (this.scene.anims.exists('fire_explosion')) {
                const explosion = this.scene.add.sprite(bomb.x, bomb.y, 'AOE_Fire_Blast_Attack_VFX_V01');
                explosion.setScale(2);
                explosion.setDepth(19);
                explosion.play('fire_explosion');
                explosion.once('animationcomplete', () => explosion.destroy());
            }
            
            // Deal AOE damage
            if (this.scene.enemies) {
                const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
                enemies.forEach(enemy => {
                    const distance = Phaser.Math.Distance.Between(bomb.x, bomb.y, enemy.x, enemy.y);
                    
                    if (distance <= this.fireBombExplosionRadius) {
                        if (enemy.isVase && enemy.onPlayerAttack) {
                            enemy.onPlayerAttack(bomb.damage);
                        } else if (enemy.takeDamage) {
                            enemy.takeDamage(bomb.damage);
                            this.applyBurnEffect(enemy, bomb.damage * 0.4, this.fireBombDotDuration);
                        }
                    }
                });
            }
            
            bomb.destroy();
        });
    }
    
    // ICE PROJECTILE ATTACK
    attemptIceAttack() {
        const target = this.findNearestEnemyInRange(this.iceRange);
        if (target) {
            this.iceProjectileAttack(target);
        }
    }
    
    iceProjectileAttack(target) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'ice',
            cooldown: this.iceCooldown
        });
        
        const iceProjectile = this.scene.add.sprite(this.player.x, this.player.y, 'AOE_Ice_Shard_Projectile_VFX_V01');
        this.scene.physics.add.existing(iceProjectile);
        
        iceProjectile.setScale(0.8);
        iceProjectile.setDepth(18);
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
            iceExplosion.setDepth(19);
            iceExplosion.play('ice_explosion');
            iceExplosion.once('animationcomplete', () => iceExplosion.destroy());
        }
    }
    
    // LIGHTNING CHAIN ATTACK
    attemptLightningAttack() {
        const target = this.findNearestEnemyInRange(this.lightningRange);
        if (target) {
            this.lightningChainAttack(target);
        }
    }
    
    lightningChainAttack(initialTarget) {
        // Emit event for UI cooldown display
        EventBus.emit('attack-used', {
            attackType: 'lightning',
            cooldown: this.lightningCooldown
        });
        
        this.performLightningChain(this.player, initialTarget, 0, []);
    }
    
    performLightningChain(fromTarget, toTarget, chainDepth, hitTargets) {
        if (chainDepth >= this.lightningChainCount || !toTarget || hitTargets.includes(toTarget)) {
            return;
        }
        
        hitTargets.push(toTarget);
        
        const lightningProjectile = this.scene.add.sprite(fromTarget.x, fromTarget.y, 'lighting_chain_projectile_attack_VFX_128x32_v01');
        this.scene.physics.add.existing(lightningProjectile);
        
        lightningProjectile.setScale(0.7);
        lightningProjectile.setDepth(19);
        lightningProjectile.play('lightning_projectile');
        
        const angle = Phaser.Math.Angle.Between(fromTarget.x, fromTarget.y, toTarget.x, toTarget.y);
        lightningProjectile.setRotation(angle);
        
        lightningProjectile.body.setVelocity(
            Math.cos(angle) * this.lightningProjectileSpeed,
            Math.sin(angle) * this.lightningProjectileSpeed
        );
        
        lightningProjectile.damage = this.lightningDamage * (1 - chainDepth * 0.15);
        lightningProjectile.startX = fromTarget.x;
        lightningProjectile.startY = fromTarget.y;
        lightningProjectile.targetEnemy = toTarget;
        lightningProjectile.chainDepth = chainDepth;
        lightningProjectile.hitTargets = hitTargets;
        lightningProjectile.isLightningProjectile = true;
        
        this.lightningProjectiles.add(lightningProjectile);
    }
    
    hitLightningTarget(projectile) {
        if (!projectile.active || !projectile.targetEnemy) return;
        
        const target = projectile.targetEnemy;
        
        if (target.takeDamage && target.active && !target.isDead) {
            target.takeDamage(projectile.damage);
            this.applyStunEffect(target, 1000);
        }
        
        const hitEffect = this.scene.add.sprite(target.x, target.y, 'lighting_chain_attack_hit_projectile_VFX_72x96_v01');
        hitEffect.setScale(0.8);
        hitEffect.setDepth(20);
        hitEffect.play('lightning_hit');
        hitEffect.once('animationcomplete', () => hitEffect.destroy());
        
        if (projectile.chainDepth < this.lightningChainCount - 1) {
            const nextTarget = this.findNearestEnemyInChainRange(target, projectile.hitTargets);
            if (nextTarget) {
                this.scene.time.delayedCall(100, () => {
                    this.performLightningChain(target, nextTarget, projectile.chainDepth + 1, projectile.hitTargets);
                });
            }
        }
        
        projectile.destroy();
    }
    
    findNearestEnemyInChainRange(fromEnemy, excludeTargets) {
    if (!this.scene.enemies || !this.scene.enemies.children) return null;
    
    let nearestEnemy = null;
    let nearestDistance = this.lightningChainRange;
    
    const enemies = this.scene.enemies.getChildren().filter(enemy => 
    enemy.active && !enemy.isDead && !excludeTargets.includes(enemy)
    );
    
    enemies.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
    fromEnemy.x, fromEnemy.y, enemy.x, enemy.y
    );
    
    if (distance <= this.lightningChainRange && distance < nearestDistance) {
    nearestDistance = distance;
    nearestEnemy = enemy;
    }
    });
    
    return nearestEnemy;
    }
    
    // LIGHTNING STUN EFFECT
    applyStunEffect(enemy, duration) {
        if (!enemy || enemy.isDead) return;
        
        if (enemy.stunTimer) enemy.stunTimer.destroy();
        
        if (enemy.originalSpeed === undefined) {
            enemy.originalSpeed = enemy.speed || 50;
        }
        if (enemy.originalTint === undefined) {
            enemy.originalTint = enemy.tint;
        }
        
        enemy.speed = 0;
        enemy.setTint(0xffff00);
        enemy.isStunned = true;
        
        enemy.stunTimer = this.scene.time.delayedCall(duration, () => {
            this.clearStunEffect(enemy);
        });
    }
    
    clearStunEffect(enemy) {
        if (!enemy) return;
        
        if (enemy.originalSpeed !== undefined) {
            enemy.speed = enemy.originalSpeed;
        }
        
        if (enemy.stunTimer) {
            enemy.stunTimer.destroy();
            enemy.stunTimer = null;
        }
        
        if (enemy.originalTint !== undefined) {
            enemy.setTint(enemy.originalTint);
        } else {
            enemy.clearTint();
        }
        
        enemy.isStunned = false;
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
    
    findNearestEnemyInRange(range) {
    if (!this.player) return null;
    
    let nearestTarget = null;
    let nearestDistance = range;
    
    // Check enemies with safety check
    if (this.scene.enemies && this.scene.enemies.children) {
    const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
    
    enemies.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    
    if (distance <= range && distance < nearestDistance) {
    nearestDistance = distance;
    nearestTarget = enemy;
    }
    });
    }
    
    // Check breakable vases with safety check
    if (this.scene.breakableVases && this.scene.breakableVases.children) {
    const vases = this.scene.breakableVases.getChildren().filter(vase => vase.active && !vase.isBroken);
    
    vases.forEach(vase => {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, vase.x, vase.y);
    
    if (distance <= range && distance < nearestDistance) {
    nearestDistance = distance;
    nearestTarget = vase;
    nearestTarget.isVase = true;
    }
    });
    }
    
    if (this.scene.children && this.scene.children.list) {
        this.scene.children.list.forEach(child => {
            const isVase = child && 
                          child.active && 
                          !child.isBroken && 
                          child.canBeAttacked &&
                          (child.constructor.name === 'BreakableVase' || 
                           child.texture?.key === 'Vase' ||
                           child.onPlayerAttack ||
                           (child.takeDamage && child.dropLoot));
                           
            if (isVase) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    child.x, child.y
                );
                
                if (distance <= range && distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTarget = child;
                    nearestTarget.isVase = true;
                    console.log('Found vase target via fallback detection:', child);
                }
            }
        });
    }
    
    return nearestTarget;
    }
    
    showSlashIndicator() {
        this.slashVisual.setVisible(true);
        this.slashVisual.setAlpha(0.5);
        
        const ringEffect = this.scene.add.circle(this.player.x, this.player.y, 10, 0x00ff00, 0);
        ringEffect.setStrokeStyle(1, 0xffff00, 0.8);
        ringEffect.setDepth(17);
        
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
    
    update() {
    // Update protective aura position if it exists
    if (this.player && this.player.protectiveAura) {
    this.player.protectiveAura.setPosition(this.player.x, this.player.y);
    }
    
    // Safe projectile updates with null checks
    if (this.fireBulletProjectiles && this.fireBulletProjectiles.children && this.fireBulletProjectiles.children.entries) {
    this.fireBulletProjectiles.children.entries.forEach(projectile => {
     if (!projectile.active || !projectile.isFireBullet) return;
    
    const distance = Phaser.Math.Distance.Between(
      projectile.startX, projectile.startY,
      projectile.x, projectile.y
     );
    
    if (distance >= projectile.maxRange) {
      projectile.destroy();
      return;
     }
     
     const enemyGroups = [this.scene.enemies, this.scene.zombieGroup, this.scene.breakableVases].filter(group => group && group.children);
    
    enemyGroups.forEach(enemyGroup => {
    if (enemyGroup) {
    const enemies = enemyGroup.getChildren().filter(enemy => enemy.active && !enemy.isDead);
    enemies.forEach(enemy => {
     if (projectile.hitEnemies.includes(enemy)) return;
    
    const enemyDistance = Phaser.Math.Distance.Between(
      projectile.x, projectile.y,
      enemy.x, enemy.y
     );
    
    if (enemyDistance <= 20) {
    projectile.hitEnemies.push(enemy);
     if (enemy.isVase && enemy.onPlayerAttack) {
     enemy.onPlayerAttack(projectile.damage);
    } else if (enemy.takeDamage) {
      enemy.takeDamage(projectile.damage);
       this.applyBurnEffect(enemy, projectile.damage * 0.3, this.fireBulletDotDuration);
       }
       }
       });
       }
      });
     });
    }
    
    if (this.fireBombProjectiles && this.fireBombProjectiles.children && this.fireBombProjectiles.children.entries) {
    this.fireBombProjectiles.children.entries.forEach(projectile => {
    if (!projectile.active || !projectile.isFireBomb) return;
     
     const distance = Phaser.Math.Distance.Between(
      projectile.startX, projectile.startY,
     projectile.x, projectile.y
    );
     
     if (distance >= projectile.maxRange) {
      this.explodeFireBomb(projectile);
      return;
     }
    
    const enemyGroups = [this.scene.enemies, this.scene.zombieGroup, this.scene.breakableVases].filter(group => group && group.children);
    
    enemyGroups.forEach(enemyGroup => {
    if (enemyGroup) {
    const enemies = enemyGroup.getChildren().filter(enemy => enemy.active && !enemy.isDead);
    enemies.forEach(enemy => {
     const enemyDistance = Phaser.Math.Distance.Between(
      projectile.x, projectile.y,
     enemy.x, enemy.y
     );
      
       if (enemyDistance <= 25) {
         this.explodeFireBomb(projectile);
         }
        });
       }
     });
    });
    }
    
    if (this.iceProjectiles && this.iceProjectiles.children && this.iceProjectiles.children.entries) {
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
    
    if (this.scene.enemies && this.scene.enemies.children) {
    const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
    enemies.forEach(enemy => {
    const enemyDistance = Phaser.Math.Distance.Between(
    projectile.x, projectile.y,
    enemy.x, enemy.y
    );
    
    if (enemyDistance <= 20) {
    if (enemy.isVase && enemy.onPlayerAttack) {
      enemy.onPlayerAttack(projectile.damage);
      this.createIceExplosionEffect(projectile.x, projectile.y);
     } else if (enemy.takeDamage) {
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
    
    if (this.lightningProjectiles && this.lightningProjectiles.children && this.lightningProjectiles.children.entries) {
    this.lightningProjectiles.children.entries.forEach(projectile => {
    if (!projectile.active || !projectile.isLightningProjectile) return;
    
     if (!projectile.targetEnemy || !projectile.targetEnemy.active) {
      projectile.destroy();
      return;
    }
    
     const targetDistance = Phaser.Math.Distance.Between(
      projectile.x, projectile.y,
      projectile.targetEnemy.x, projectile.targetEnemy.y
    );
    
     if (targetDistance <= 25) {
       this.hitLightningTarget(projectile);
        return;
				}
				
				const distance = Phaser.Math.Distance.Between(
					projectile.startX, projectile.startY,
					projectile.x, projectile.y
				);
				
				if (distance >= this.lightningRange) {
					projectile.destroy();
					return;
				}
			});
		}

		if (this.marksmanProjectiles && this.marksmanProjectiles.children && this.marksmanProjectiles.children.entries) {
			this.marksmanProjectiles.children.entries.forEach(projectile => {
				if (!projectile.active || !projectile.isMarksmanProjectile) return;

				const distance = Phaser.Math.Distance.Between(
					projectile.startX, projectile.startY,
					projectile.x, projectile.y
				);

				if (distance >= projectile.maxRange) {
					if (projectile.trail && projectile.trail.active) projectile.trail.destroy();
					projectile.destroy();
					return;
				}

				if (projectile.currentPierceCount >= projectile.maxPierceTargets) {
					if (projectile.trail && projectile.trail.active) projectile.trail.destroy();
					projectile.destroy();
					return;
				}

				const enemyGroups = [this.scene.enemies, this.scene.zombieGroup, this.scene.breakableVases].filter(group => group && group.children);

				enemyGroups.forEach(enemyGroup => {
					if (enemyGroup) {
						const enemies = enemyGroup.getChildren().filter(enemy => enemy.active && !enemy.isDead);
						enemies.forEach(enemy => {
							if (projectile.hitEnemies.includes(enemy) || projectile.currentPierceCount >= projectile.maxPierceTargets) return;

							const enemyDistance = Phaser.Math.Distance.Between(
								projectile.x, projectile.y,
								enemy.x, enemy.y
							);

							if (enemyDistance <= 20) {
								projectile.hitEnemies.push(enemy);
								projectile.currentPierceCount++;

								if (enemy.isVase && enemy.onPlayerAttack) {
									enemy.onPlayerAttack(projectile.damage);
								} else if (enemy.takeDamage) {
									enemy.takeDamage(projectile.damage);
								}

								const hitEffect = this.scene.add.circle(enemy.x, enemy.y, 8, 0xffffff, 0.8);
								hitEffect.setDepth(20);
								this.scene.tweens.add({
									targets: hitEffect,
									scale: { from: 0.5, to: 1.5 },
									alpha: { from: 0.8, to: 0 },
									duration: 300,
									onComplete: () => hitEffect.destroy()
								});

								if (projectile.currentPierceCount >= projectile.maxPierceTargets) {
									this.scene.time.delayedCall(50, () => {
										if (projectile.active) {
											if (projectile.trail && projectile.trail.active) projectile.trail.destroy();
											projectile.destroy();
										}
									});
									return;
								}
							}
						});
					}
				});
			});
		}
    }
    updateStats() {
        if (!this.player || !this.scene || !this.scene.active) return;
        
        try {
        this.slashDamage = this.player.slashDamage || 10;
        this.slashFireRate = this.player.slashFireRate || 1;
        this.slashRange = this.player.slashRange || 70;
        this.slashCooldown = 2000 / this.slashFireRate;
        
        this.fireBulletDamage = this.player.fireBulletDamage || 8;
        this.fireBulletFireRate = this.player.fireBulletFireRate || 1.2;
        this.fireBulletRange = this.player.fireBulletRange || 300;
        this.fireBulletCooldown = 2500 / this.fireBulletFireRate;
        
        this.fireBombDamage = this.player.fireBombDamage || 18;
        this.fireBombFireRate = this.player.fireBombFireRate || 0.4;
        this.fireBombRange = this.player.fireBombRange || 220;
        this.fireBombCooldown = 3000 / this.fireBombFireRate;
        
        this.iceDamage = this.player.iceDamage || 12;
        this.iceFireRate = this.player.iceFireRate || 0.6;
        this.iceRange = this.player.iceRange || 180;
        this.iceCooldown = 2800 / this.iceFireRate;
        
        this.lightningDamage = this.player.lightningDamage || 20;
        this.lightningFireRate = this.player.lightningFireRate || 0.5;
        this.lightningRange = this.player.lightningRange || 250;
        this.lightningCooldown = 4000 / this.lightningFireRate;
        this.lightningChainCount = this.player.lightningChainCount || 10;
        
        this.blindingLightRange = this.player.blindingLightRange || 300;
        this.blindingLightFireRate = this.player.blindingLightFireRate || 0.15;
        this.blindingLightCooldown = 10000 / this.blindingLightFireRate;
        this.blindingLightDisableDuration = this.player.blindingLightDisableDuration || 4000;
        
        // Marksman attack
        this.marksmanDamage = this.player.marksmanDamage || 35;
        this.marksmanFireRate = this.player.marksmanFireRate || 0.3;
        this.marksmanRange = this.player.marksmanRange || 400;
        this.marksmanCooldown = 1500 / this.marksmanFireRate;
        
        if (this.slashTimer) this.slashTimer.delay = this.slashCooldown;
        if (this.fireBulletTimer) this.fireBulletTimer.delay = this.fireBulletCooldown;
        if (this.fireBombTimer) this.fireBombTimer.delay = this.fireBombCooldown;
        if (this.iceTimer) this.iceTimer.delay = this.iceCooldown;
        if (this.lightningTimer) this.lightningTimer.delay = this.lightningCooldown;
        if (this.blindingLightTimer) this.blindingLightTimer.delay = this.blindingLightCooldown;
        if (this.marksmanTimer) this.marksmanTimer.delay = this.marksmanCooldown;
        
        if (this.slashVisual && this.slashVisual.setRadius && typeof this.slashVisual.setRadius === 'function') {
            try {
                this.slashVisual.setRadius(this.slashRange);
            } catch (error) {
                console.warn('Error setting slash visual radius:', error);
            }
        }
        
        if (this.blindingLightVisual && this.blindingLightVisual.setRadius && typeof this.blindingLightVisual.setRadius === 'function') {
            try {
                this.blindingLightVisual.setRadius(this.blindingLightRange);
            } catch (error) {
                console.warn('Error setting blinding light visual radius:', error);
            }
        }
        } catch (error) {
            console.error('Error in PlayerAttack.updateStats:', error);
        }
    }
    
    destroy() {
        if (this.slashTimer) this.slashTimer.destroy();
        if (this.fireBulletTimer) this.fireBulletTimer.destroy();
        if (this.fireBombTimer) this.fireBombTimer.destroy();
        if (this.iceTimer) this.iceTimer.destroy();
        if (this.lightningTimer) this.lightningTimer.destroy();
        if (this.blindingLightTimer) this.blindingLightTimer.destroy();
        if (this.marksmanTimer) this.marksmanTimer.destroy();
        
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                this.clearBurnEffect(enemy);
                this.clearSlowEffect(enemy);
                this.clearStunEffect(enemy);
                this.clearBlindEffect(enemy);
            });
        }
        
        this.clearPlayerInvincibility();
        
        this.fireBulletProjectiles.destroy(true);
        this.fireBombProjectiles.destroy(true);
        this.iceProjectiles.destroy(true);
        this.lightningProjectiles.destroy(true);
        this.marksmanProjectiles.destroy(true);
        
        super.destroy();
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here