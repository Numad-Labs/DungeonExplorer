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
        this.attackRange = player.attackRange || 100;
        this.attackCooldown = 1000 / this.fireRate;
        this.lastAttackTime = 0;
        this.attacking = false;
        
        this.setupWeaponVisuals();
        this.startAttackTimer();
        
        scene.playerAttack = this;
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */
    
    setupWeaponVisuals() {
        this.weaponVisual = this.scene.add.arc(0, 0, this.attackRange, 0, Math.PI / 2, false, 0x00ff00, 0.3);
        this.weaponVisual.setVisible(false);
        this.add(this.weaponVisual);
        
        if (this.scene.particles) {
            this.attackEffect = this.scene.particles.createEmitter({
                x: 0,
                y: 0,
                speed: { min: 50, max: 100 },
                scale: { start: 0.5, end: 0 },
                lifespan: 300,
                blendMode: 'ADD',
                on: false
            });
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
        
        const target = this.findNearestEnemyInRange();
        
        if (target) {
            this.attack(target);
        }
    }
    
    findNearestEnemyInRange() {
        if (!this.scene.enemies || !this.player) {
            return null;
        }
        
        let nearestEnemy = null;
        let nearestDistance = this.attackRange;
        
        const enemies = this.scene.enemies.getChildren().filter(enemy => enemy.active && !enemy.isDead);
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            if (distance <= this.attackRange && distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }
    
    attack(target) {
        this.lastAttackTime = this.scene.time.now;
        this.attacking = true;
        
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            target.x, target.y
        );
        
        this.x = this.player.x;
        this.y = this.player.y;

        if (target.takeDamage) {
            target.takeDamage(this.damage);
            
            this.createHitEffect(target.x, target.y);
        }
        
        this.playAttackSound();
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