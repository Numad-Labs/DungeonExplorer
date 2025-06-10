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
        
        this.damage = player.damage || 10;
        this.fireRate = player.fireRate || 1;
        this.attackRange = player.attackRange || 50;
        this.attackCooldown = 1000 / this.fireRate;
        this.lastAttackTime = 0;
        this.attacking = false;
        
        this.setupWeaponVisuals();
        this.createAttackAnimations();
        this.startAttackTimer();
        
        scene.playerAttack = this;
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    setupWeaponVisuals() {
        this.weaponVisual = this.scene.add.arc(0, 0, this.attackRange, 0, Math.PI / 2, false, 0x00ff00, 0.3);
        this.weaponVisual.setVisible(false);
        this.add(this.weaponVisual);
        
        this.attackSprite = this.scene.add.sprite(0, 0, 'AOE_Basic_Slash_Attack_V01');
        this.attackSprite.setVisible(false);
        this.attackSprite.setOrigin(0.5, 0.5);
        this.add(this.attackSprite);
    }
    
    createAttackAnimations() {
        if (!this.scene.anims.exists('slash_attack_v01')) {
            this.scene.anims.create({
                key: 'slash_attack_v01',
                frames: this.scene.anims.generateFrameNumbers('AOE_Basic_Slash_Attack_V01', { 
                    start: 0, 
                    end: -1
                }),
                frameRate: 15,
                repeat: 0
            });
        }
        
        if (this.scene.textures.exists('AOE_Basic_Slash_Attack_V02')) {
            if (!this.scene.anims.exists('slash_attack_v02')) {
                this.scene.anims.create({
                    key: 'slash_attack_v02',
                    frames: this.scene.anims.generateFrameNumbers('AOE_Basic_Slash_Attack_V02', { 
                        start: 0, 
                        end: -1
                    }),
                    frameRate: 15,
                    repeat: 0
                });
            }
        }
    }
    
    startAttackTimer() {
        this.attackTimer = this.scene.time.addEvent({
            delay: this.attackCooldown,
            callback: this.attemptAttack,
            callbackScope: this,
            loop: true
        });
    }
    
    attemptAttack() {
        const currentTime = this.scene.time.now;
        
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return;
        }
        
        const enemiesInRange = this.findEnemiesInRange();
        
        if (enemiesInRange.length > 0) {
            this.attackAOE(enemiesInRange);
        }
    }
    
    findEnemiesInRange() {
        if (!this.scene.enemies || !this.player) {
            return [];
        }
        
        const enemiesInRange = [];
        const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            if (distance <= this.attackRange) {
                enemiesInRange.push({
                    enemy: enemy,
                    distance: distance
                });
            }
        });
        
        enemiesInRange.sort((a, b) => a.distance - b.distance);
        
        return enemiesInRange;
    }
    
    attackAOE(enemiesInRange) {
        this.lastAttackTime = this.scene.time.now;
        this.attacking = true;
        
        this.x = this.player.x;
        this.y = this.player.y;
        
        this.attackSprite.setPosition(0, 0);
        this.attackSprite.setRotation(0);
        this.attackSprite.setVisible(true);
        this.attackSprite.setScale(1.2);
        
        const animKey = this.getAttackAnimation();
        this.attackSprite.play(animKey);
        
        this.attackSprite.once('animationcomplete', () => {
            this.attackSprite.setVisible(false);
            this.attackSprite.setScale(1);
            this.attacking = false;
        });

        enemiesInRange.forEach((enemyData) => {
            if (enemyData.enemy.takeDamage && enemyData.enemy.active && !enemyData.enemy.isDead) {
                enemyData.enemy.takeDamage(this.damage);
                this.createHitEffect(enemyData.enemy.x, enemyData.enemy.y);
            }
        });
        
        this.show360AOEIndicator();
        
        this.playAttackSound();
    }
    
    getAttackAnimation() {
        if (this.scene.anims.exists('slash_attack_v02')) {
            this.lastAttackAnim = this.lastAttackAnim === 'slash_attack_v01' ? 'slash_attack_v02' : 'slash_attack_v01';
            return this.lastAttackAnim;
        }
        return 'slash_attack_v01';
    }
    
    show360AOEIndicator() {
        this.weaponVisual.setVisible(true);
        this.weaponVisual.setAlpha(0.5);
        
        const ringEffect = this.scene.add.circle(this.player.x, this.player.y, 10, 0xff0000, 0);
        ringEffect.setStrokeStyle(1, 0xffff00, 0.4);
        
        this.scene.tweens.add({
            targets: ringEffect,
            radius: this.attackRange,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                ringEffect.destroy();
            }
        });
        
        this.scene.time.delayedCall(300, () => {
            this.weaponVisual.setVisible(false);
        });
    }
    
    createHitEffect(x, y) {
        try {
            const hitFlash = this.scene.add.circle(x, y, 20, 0x00ffff, 0.7);
            
            this.scene.tweens.add({
                targets: hitFlash,
                alpha: 0,
                scale: 2,
                duration: 200,
                onComplete: () => {
                    hitFlash.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating hit effect:", error);
        }
    }
    
    playAttackSound() {
        try {
            if (this.scene.sound && this.scene.cache.audio.exists('attack_sound')) {
                const sound = this.scene.sound.add('attack_sound');
                sound.play({ volume: 0.3 });
            }
        } catch (error) {
            console.warn("Could not play attack sound:", error);
        }
    }
    
    updateStats() {
        if (this.player) {
            this.damage = this.player.damage || 10;
            this.fireRate = this.player.fireRate || 1;
            this.attackRange = this.player.attackRange || 100;
            
            this.attackCooldown = 1000 / this.fireRate;
            
            if (this.attackTimer) {
                this.attackTimer.delay = this.attackCooldown;
            }
            
            if (this.weaponVisual) {
                this.weaponVisual.setRadius(this.attackRange);
            }
        }
    }
    
    destroy() {
        if (this.attackTimer) {
            this.attackTimer.destroy();
        }
        
        super.destroy();
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here