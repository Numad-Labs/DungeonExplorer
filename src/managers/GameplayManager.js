import GameManager from "./GameManager";
import MobManager from "./MobManager";
import ExpOrb from "../prefabs/ExpOrb";

export default class GameplayManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        this.player = null;
        this.mobManager = new MobManager(scene);
        this.expOrbs = null;
        this.enemies = null;
        this.orbSpawnTimer = null;
        this.difficultyTimer = null;
    }
    
    initialize(player) {
        this.player = player;
        this.mobManager.initialize(this.gameManager, player);
        this.expOrbs = this.scene.add.group();
        this.enemies = this.mobManager.mobGroup;
        this.scene.enemies = this.enemies;
        
        this.createTextures();
        this.setupCollisions();
        this.setupTimers();
        this.setupControls();

        this.scene.spawnExperienceOrb = (x, y, value) => this.spawnExperienceOrb(x, y, value);
    }
    
    createTextures() {
        const textureNames = [
            'zombierun', 'Zombie2RunAni', 'Police run', 
            'Dagger Bandit-Run', 'assassinTank', 'assassinArcher'
        ];
        
        textureNames.forEach(textureName => {
            if (!this.scene.textures.exists(textureName)) {
                this.createMobTexture(textureName);
            }
        });
        
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
    
    createMobTexture(textureName) {
        const graphics = this.scene.add.graphics();
        
        let color = 0x336633;
        if (textureName.includes('Police')) color = 0x333366;
        if (textureName.includes('Dagger') || textureName.includes('assassin')) color = 0x663333;
        if (textureName.includes('Tank')) color = 0x444444;
        if (textureName.includes('Archer')) color = 0x664433;
        if (textureName.includes('Zombie2')) color = 0x553355;
        
        graphics.fillStyle(color, 1);
        graphics.fillRect(8, 8, 16, 16);
        graphics.fillStyle(color, 1);
        graphics.fillRect(4, 12, 4, 8); // Arms
        graphics.fillRect(24, 12, 4, 8);
        graphics.generateTexture(textureName, 32, 32);
        graphics.destroy();
    }
    
    setupCollisions() {
        if (!this.player) return;
        
        this.scene.physics.add.overlap(
            this.player,
            this.enemies,
            (player, enemy) => {
                if (enemy.attackPlayer) {
                    enemy.attackPlayer(player);
                }
            }
        );
        
        this.scene.physics.add.overlap(
            this.player,
            this.expOrbs,
            (player, orb) => {
                this.collectExperienceOrb(orb);
            }
        );
    }
    
    setupTimers() {
        this.orbSpawnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.spawnRandomExperienceOrb(),
            loop: true
        });
        
        this.difficultyTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameManager.updateDifficulty(1000);
            },
            loop: true
        });
        
        this.scene.enemySpawnTimer = this.mobManager.spawnTimer;
        this.scene.orbSpawnTimer = this.orbSpawnTimer;
        this.scene.difficultyTimer = this.difficultyTimer;
    }
    
    spawnEnemy(x, y, enemyType = 'zombie') {
        return this.mobManager.spawnMob(enemyType, x, y);
    }
    
    spawnRandomEnemy() {
        return this.mobManager.spawnRandomMob();
    }
    
    spawnExperienceOrb(x, y, value = 1) {
        try {
            if (ExpOrb) {
                const expOrb = new ExpOrb(this.scene, x, y);
                this.scene.add.existing(expOrb);
                this.expOrbs.add(expOrb);
                expOrb.setExpValue(value);
                expOrb.setDepth(12);
                
                this.setupOrbMovement(expOrb);
                
                return expOrb;
            }
        } catch (error) {
            console.log("ExpOrb class not available, using fallback");
        }
        
        return this.createFallbackOrb(x, y, value);
    }
    
    createFallbackOrb(x, y, value) {
        const orb = this.scene.add.circle(x, y, 6, 0x00ffff);
        orb.expValue = value || 5;
        this.scene.physics.add.existing(orb);
        orb.body.setCircle(6);
        orb.setDepth(12);
        this.expOrbs.add(orb);
        
        orb.collect = () => {
            this.collectExperienceOrb(orb);
        };
        
        this.setupOrbMovement(orb);
        
        this.scene.time.delayedCall(30000, () => {
            if (orb && orb.active) {
                orb.destroy();
            }
        });
        
        return orb;
    }
    
    setupOrbMovement(orb) {
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
    
    collectExperienceOrb(orb) {
        try {
            const expValue = orb.expValue || 5;
            
            if (this.gameManager) {
                this.gameManager.addExperience(expValue);
            }
            
            const expText = this.scene.add.text(orb.x, orb.y - 20, `+${expValue} XP`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#88ff88',
                stroke: '#000000',
                strokeThickness: 1
            });
            expText.setOrigin(0.5);
            
            this.scene.tweens.add({
                targets: expText,
                y: expText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => expText.destroy()
            });
            
            orb.destroy();
        } catch (error) {
            console.error("Error collecting experience orb:", error);
        }
    }
    
    spawnWave() {
        const waveNumber = (this.scene.currentWave || 0) + 1;
        this.scene.currentWave = waveNumber;
        this.mobManager.startWave(waveNumber);
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
            this.spawnEnemy(world.x, world.y, 'zombieBig');
        });

        keyboard.on('keydown-V', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'policeDroid');
        });
        
        keyboard.on('keydown-B', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'assassin');
        });
        
        keyboard.on('keydown-N', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'assassinTank');
        });
        
        keyboard.on('keydown-M', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnEnemy(world.x, world.y, 'assassinArcher');
        });
        
        keyboard.on('keydown-E', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnExperienceOrb(world.x, world.y, 1);
        });
        
        keyboard.on('keydown-K', () => {
            this.mobManager.killAllMobs();
        });
        
        keyboard.on('keydown-O', () => {
            for (let i = 0; i < 10; i++) {
                this.spawnRandomExperienceOrb();
            }
        });
        
        keyboard.on('keydown-W', () => {
            this.spawnWave();
        });
        
        keyboard.on('keydown-L', () => {
            const stats = this.mobManager.getStatistics();
            console.log('Mob Statistics:', stats);
        });
        
        console.log("Debug controls: Z=Zombie, X=BigZombie, V=PoliceDroid, B=Assassin, N=Tank, M=Archer");
        console.log("E=Orb, K=KillAll, O=10Orbs, W=Wave, L=Stats");
    }
    
    checkEnemyBounds() {
        if (!this.player) return;
        
        const maxDistance = 600;
        const mobs = this.mobManager.getAllActiveMobs();
        
        mobs.forEach(mob => {
            if (!mob.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                mob.x, mob.y, this.player.x, this.player.y
            );
            
            if (distance > maxDistance) {
                this.teleportMobToPlayer(mob);
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
    
    teleportMobToPlayer(mob) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(300, 500);
        
        mob.x = this.player.x + Math.cos(angle) * distance;
        mob.y = this.player.y + Math.sin(angle) * distance;
        
        if (mob.body) {
            mob.body.velocity.setTo(0, 0);
        }
        
        const circle = this.scene.add.circle(mob.x, mob.y, 30, 0x33ff33, 0.7);
        circle.setDepth(20);
        this.scene.tweens.add({
            targets: circle,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }
    
    getEnemyCount() {
        return this.mobManager.getActiveMobCount();
    }
    
    getEnemiesByType(type) {
        return this.mobManager.getMobsByType(type);
    }
    
    getAllEnemies() {
        return this.mobManager.getAllActiveMobs();
    }
    
    getStatistics() {
        return this.mobManager.getStatistics();
    }
    
    update(time, delta) {
        this.mobManager.update(time, delta);
        
        this.checkEnemyBounds();
        this.checkOrbBounds();
        
        if (this.expOrbs) {
            this.expOrbs.getChildren().forEach(orb => {
                if (orb.depth < 10) {
                    orb.setDepth(12);
                }
            });
        }
    }
    
    shutdown() {
        [this.orbSpawnTimer, this.difficultyTimer].forEach(timer => {
            if (timer) timer.remove();
        });
        
        this.mobManager.shutdown();
        
        if (this.expOrbs) {
            this.expOrbs.clear(true, true);
        }
        
        if (this.scene.input?.keyboard) {
            ['keydown-E', 'keydown-Z', 'keydown-V', 'keydown-X', 'keydown-B', 
             'keydown-N', 'keydown-M', 'keydown-K', 'keydown-O', 'keydown-W', 'keydown-L'].forEach(event => {
                this.scene.input.keyboard.removeAllListeners(event);
            });
        }
    }
}