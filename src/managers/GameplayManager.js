import GameManager from "./GameManager";
import ExpOrb from "../prefabs/ExpOrb";
import Zombie from "../prefabs/Enemies/Zombie1";
import Zombie2 from "../prefabs/Enemies/Zombie2";
import PoliceDroid from "../prefabs/Enemies/PoliceDroid";
import Assassin from "../prefabs/Enemies/Assassin";
import AssassinTank from "../prefabs/Enemies/AssassinTank";
import AssassinArcher from "../prefabs/Enemies/AssassinArcher";

export default class GameplayManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        
        this.player = null;
        this.enemies = null;
        this.expOrbs = null;
        
        this.enemySpawnTimer = null;
        this.orbSpawnTimer = null;
        this.difficultyTimer = null;
        
    }
    
    initialize(player) {
        this.player = player;
        
        this.enemies = this.scene.add.group();
        this.expOrbs = this.scene.add.group();
        this.scene.enemies = this.enemies;
        
        this.createTextures();
        this.setupCollisions();
        this.setupTimers();
        this.setupControls();
        
        this.scene.spawnExperienceOrb = (x, y, value) => this.spawnExperienceOrb(x, y, value);
    }
    
    createTextures() {
        if (!this.scene.textures.exists('zombierun')) {
            this.createZombieTexture('zombierun');
        }
        if (!this.scene.textures.exists('Zombie2RunAni')) {
            this.createZombieTexture('Zombie2RunAni');
        }
        if (!this.scene.textures.exists('Police run')){
            this.createZombieTexture('Police run')
        }
        if (!this.scene.textures.exists('assassin')){
            this.createZombieTexture('assassin')
        }
        if (!this.scene.textures.exists('assassinTank')){
            this.createZombieTexture('assassinTank')
        }
        if (!this.scene.textures.exists('assassinArcher')){
            this.createZombieTexture('assassinArcher')
        }
        
        if (!this.scene.textures.exists('Exp')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x00ffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.lineStyle(1, 0xffffff, 1);
            graphics.strokeCircle(8, 8, 8);
            graphics.generateTexture('Exp', 16, 16);
            graphics.destroy();
        }

        if (!this.scene.textures.exists('AOE_Fire_Ball_Projectile_VFX_V01')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xff4400, 1);
            graphics.fillCircle(16, 16, 16);
            graphics.generateTexture('AOE_Fire_Ball_Projectile_VFX_V01', 32, 32);
            graphics.destroy();
        }

        if (!this.scene.textures.exists('AOE_Fire_Blast_Attack_VFX_V01')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xff6600, 0.8);
            graphics.fillCircle(24, 24, 24);
            graphics.generateTexture('AOE_Fire_Blast_Attack_VFX_V01', 48, 48);
            graphics.destroy();
        }

        if (!this.scene.textures.exists('AOE_Ice_Shard_Projectile_VFX_V01')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x00aaff, 1);
            graphics.fillCircle(16, 16, 12);
            graphics.generateTexture('AOE_Ice_Shard_Projectile_VFX_V01', 32, 32);
            graphics.destroy();
        }
    }
    
    createZombieTexture(textureName) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x336633, 1);
        graphics.fillRect(8, 8, 16, 16);
        graphics.fillStyle(0x336633, 1);
        graphics.fillRect(4, 12, 4, 8);
        graphics.fillRect(24, 12, 4, 8);
        graphics.generateTexture(textureName, 32, 32);
        graphics.destroy();
    }
    
    setupCollisions() {
        if (!this.player) return;
        
        this.scene.physics.add.overlap(
            this.player,
            this.enemies,
            (player, enemy) => enemy.attackPlayer?.(player)
        );
        
        this.scene.physics.add.overlap(
            this.player,
            this.expOrbs,
            (player, orb) => orb.collect?.()
        );
    }
    
    setupTimers() {
        this.enemySpawnTimer = this.scene.time.addEvent({
            delay: this.gameManager.gameProgress.enemySpawnDelay,
            callback: () => this.spawnRandomEnemy(),
            loop: true
        });
        
        this.orbSpawnTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => this.spawnRandomExperienceOrb(),
            loop: true
        });
        
        this.difficultyTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameManager.updateDifficulty(1000);
                this.updateSpawnRates();
            },
            loop: true
        });
        
        this.scene.enemySpawnTimer = this.enemySpawnTimer;
        this.scene.orbSpawnTimer = this.orbSpawnTimer;
        this.scene.difficultyTimer = this.difficultyTimer;
    }
    
    updateSpawnRates() {
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.delay = this.gameManager.gameProgress.enemySpawnDelay;
        }
        
        if (this.orbSpawnTimer) {
            const gameTime = this.gameManager.gameProgress.gameTime;
            const newDelay = Math.max(500, 2000 - (gameTime / 300) * 1500);
            this.orbSpawnTimer.delay = newDelay;
        }
    }
    
    spawnRandomEnemy() {
        if (!this.player) return;
        
        const maxEnemies = this.gameManager.gameProgress.maxEnemies;
        if (this.enemies.getChildren().length >= maxEnemies) return;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 800;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;

        let enemyType;
        const roll = Math.random();
        
        if (roll < 0.5) {
          enemyType = 'zombie';        
        } else if (roll < 0.8) {
          enemyType = 'zombieBig';    
        }else if (roll < 0.8) {
          enemyType = 'assassinTank';    
        }else if (roll < 0.95) {
          enemyType = 'policeDroid';  
        }else if (roll < 0.95) {
          enemyType = 'assassinArcher';  
        }
         else {
          enemyType = 'assassin';     
    }
        return this.spawnEnemy(x, y, enemyType);
    }
    
    spawnEnemy(x, y, enemyType = 'zombie') {
        try {
            const difficulty = this.gameManager.gameProgress.currentDifficulty;
            let enemy;
            
            if (enemyType === 'zombieBig') {
                enemy = new Zombie2(this.scene, x, y);
                enemy.maxHealth = 50 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 20 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 40 * (1 + (difficulty - 1) * 0.05);
            } else if (enemyType === 'policeDroid') {
                enemy = new PoliceDroid(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            else if (enemyType === 'assassin') {
                enemy = new Assassin(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            else if (enemyType === 'assassinArcher') {
                enemy = new AssassinArcher(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            else if (enemyType === 'assassinTank') {
                enemy = new AssassinTank(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            else {
                enemy = new Zombie(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            
            enemy.health = enemy.maxHealth;
            enemy.enemyType = enemyType;
            
            enemy.safeDestroy = () => {
                try {
                    if (this.enemies && this.enemies.children) {
                        this.enemies.remove(enemy);
                    }
                    if (this.scene.removeZombie) {
                        this.scene.removeZombie(enemy);
                    }
                    if (enemy && enemy.active && enemy.destroy) {
                        enemy.destroy();
                    }
                } catch (error) {
                    console.error("Error in enemy safeDestroy:", error);
                }
            };
            
            this.scene.add.existing(enemy);
            this.enemies.add(enemy);
            
            enemy.setDepth(15);
            
            if (enemy.body) {
                enemy.body.setBounce(0.1, 0.1);
                enemy.body.setCollideWorldBounds(false);
            }
            
            if (this.scene.addZombie) {
                this.scene.addZombie(enemy);
            }
            
            return enemy;
            
        } catch (error) {
            console.error("Error spawning enemy:", error);
            return null;
        }
    }
    
    spawnExperienceOrb(x, y, value = 1) {
        try {
            const expOrb = new ExpOrb(this.scene, x, y);
            this.scene.add.existing(expOrb);
            this.expOrbs.add(expOrb);
            
            expOrb.setExpValue(value);
            
            expOrb.setDepth(12);
            
            if (expOrb.body) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Phaser.Math.Between(20, 50);
                expOrb.body.velocity.x = Math.cos(angle) * speed;
                expOrb.body.velocity.y = Math.sin(angle) * speed;
            }
            
            console.log(`Spawned exp orb at (${Math.round(x)}, ${Math.round(y)}) with depth ${expOrb.depth} and value ${value}`);
            return expOrb;
        } catch (error) {
            console.error("Error spawning experience orb:", error);
            try {
                const orb = this.scene.add.circle(x, y, 6, 0x00ffff);
                orb.expValue = value || 5;
                this.scene.physics.add.existing(orb);
                orb.body.setCircle(6);
                orb.setDepth(12);
                this.expOrbs.add(orb);
                
                orb.collect = () => {
                    if (this.gameManager) {
                        this.gameManager.addExperience(orb.expValue);
                    }
                    orb.destroy();
                };
                
                const moveToPlayer = () => {
                    if (!this.player || this.player.isDead || !orb.body) return;
                    
                    const distance = Phaser.Math.Distance.Between(
                        orb.x, orb.y, this.player.x, this.player.y
                    );
                    
                    if (distance < (this.player.pickupRange || 50)) {
                        const angle = Phaser.Math.Angle.Between(
                            orb.x, orb.y, this.player.x, this.player.y
                        );
                        
                        const speed = 200;
                        orb.body.setVelocity(
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed
                        );
                    }
                };
                
                const updateEvent = this.scene.time.addEvent({
                    delay: 50,
                    callback: moveToPlayer,
                    repeat: -1
                });
                
                orb.on('destroy', () => {
                    updateEvent.destroy();
                });
                
                this.scene.physics.add.overlap(this.player, orb, (player, orb) => {
                    orb.collect();
                });
                
                console.log(`Created fallback exp orb at (${Math.round(x)}, ${Math.round(y)})`);
                return orb;
            } catch (fallbackError) {
                console.error("Error creating fallback experience orb:", fallbackError);
                return null;
            }
        }
    }
    
    spawnRandomExperienceOrb() {
        if (!this.player) return;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(200, 800);
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        let value = 1;
        const roll = Math.random();
        if (roll > 0.95) value = 10;
        else if (roll > 0.8) value = 5;
        else if (roll > 0.5) value = 2;
        
        return this.spawnExperienceOrb(x, y, value);
    }
    
    checkEnemyBounds() {
        if (!this.enemies || !this.player) return;
        
        const maxDistance = 700;
        
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                enemy.x, enemy.y, this.player.x, this.player.y
            );
            
            if (distance > maxDistance) {
                this.teleportEnemyToPlayer(enemy);
            }
        });
    }
    
    checkOrbBounds() {
        if (!this.expOrbs || !this.player) return;
        
        const maxDistance = 2000;
        
        this.expOrbs.getChildren().forEach(orb => {
            if (!orb.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                orb.x, orb.y, this.player.x, this.player.y
            );
            
            if (distance > maxDistance) {
                orb.destroy();
            }
        });
    }
    
    teleportEnemyToPlayer(enemy) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(300, 500);
        
        enemy.x = this.player.x + Math.cos(angle) * distance;
        enemy.y = this.player.y + Math.sin(angle) * distance;
        
        if (enemy.body) {
            enemy.body.velocity.setTo(0, 0);
        }
        
        const circle = this.scene.add.circle(enemy.x, enemy.y, 30, 0x33ff33, 0.7);
        circle.setDepth(20);
        this.scene.tweens.add({
            targets: circle,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }
    
    setupControls() {
        const keyboard = this.scene.input.keyboard;
        
        keyboard.on('keydown-Z', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'zombie');
        });
        
        keyboard.on('keydown-X', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'assassinArcher');
        });

        keyboard.on('keydown-V', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'policeDroid');
        });
        
        keyboard.on('keydown-E', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnExperienceOrb(world.x, world.y, 1);
        });
        
        keyboard.on('keydown-K', () => {
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.takeDamage) enemy.takeDamage(1000);
            });
        });
        
        keyboard.on('keydown-O', () => {
            for (let i = 0; i < 10; i++) {
                this.spawnRandomExperienceOrb();
            }
        });
        
        keyboard.on('keydown-L', () => {
            const enemyList = this.enemies.getChildren();
            enemyList.forEach((enemy, i) => {
                console.log(`${i + 1}. ${enemy.enemyType} - Health: ${enemy.health} - Pos: (${Math.round(enemy.x)}, ${Math.round(enemy.y)}) - Depth: ${enemy.depth}`);
            });
        });
        
        console.log("Debug controls: Z=Zombie, X=BigZombie, V=PoliceDroid, E=Orb, K=KillAll, O=10Orbs, L=ListEnemies");
    }
    
    update(time, delta) {
        this.checkEnemyBounds();
        this.checkOrbBounds();
        
        if (this.enemies) {
            this.enemies.getChildren().forEach(enemy => {
                if (enemy.depth < 10) {
                    enemy.setDepth(15);
                }
            });
        }
        
        if (this.expOrbs) {
            this.expOrbs.getChildren().forEach(orb => {
                if (orb.depth < 10) {
                    orb.setDepth(12);
                }
            });
        }
    }
    
    shutdown() {
        [this.enemySpawnTimer, this.orbSpawnTimer, this.difficultyTimer].forEach(timer => {
            if (timer) timer.remove();
        });
        
        if (this.scene.input?.keyboard) {
            ['keydown-E', 'keydown-Z', 'keydown-V', 'keydown-X', 'keydown-K', 'keydown-O', 'keydown-L'].forEach(event => {
                this.scene.input.keyboard.removeAllListeners(event);
            });
        }
    }
}