import GameManager from "./GameManager";
import MobManager from "./MobManager";
import ExpOrb from "../prefabs/ExpOrb";
import GoldPrefab from "../prefabs/GoldPrefab";

export default class GameplayManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        this.player = null;
        this.mobManager = new MobManager(scene);
        this.expOrbs = null;
        this.goldOrbs = null;
        this.enemies = null;
        this.orbSpawnTimer = null;
        this.goldSpawnTimer = null;
        this.difficultyTimer = null;
    }
    
    initialize(player) {
        this.player = player;
        this.mobManager.initialize(this.gameManager, player);
        this.expOrbs = this.scene.add.group();
        this.goldOrbs = this.scene.add.group();
        this.enemies = this.mobManager.mobGroup;
        this.scene.enemies = this.enemies;
        
        this.createTextures();
        this.setupCollisions();
        this.setupTimers();
        this.setupControls();

        this.scene.spawnExperienceOrb = (x, y, value) => this.spawnExperienceOrb(x, y, value);
        this.scene.spawnGoldOrb = (x, y, value) => this.spawnGoldOrb(x, y, value);
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
        
        // FIXED: Experience orb texture - CYAN/BLUE with white border
        if (!this.scene.textures.exists('Exp')) {
            const graphics = this.scene.add.graphics();
            
            // Main orb body - cyan/blue gradient effect
            graphics.fillGradientStyle(0x00FFFF, 0x00FFFF, 0x0088FF, 0x0088FF, 1);
            graphics.fillCircle(8, 8, 7);
            
            // Inner glow
            graphics.fillStyle(0x88FFFF, 0.6);
            graphics.fillCircle(8, 8, 5);
            
            // Bright center
            graphics.fillStyle(0xFFFFFF, 0.8);
            graphics.fillCircle(8, 8, 2);
            
            // White border
            graphics.lineStyle(1, 0xFFFFFF, 1);
            graphics.strokeCircle(8, 8, 7);
            
            graphics.generateTexture('Exp', 16, 16);
            graphics.destroy();
        }

        // FIXED: Gold orb texture - YELLOW/GOLD with golden border
        if (!this.scene.textures.exists('Gold')) {
            const graphics = this.scene.add.graphics();
            
            // Main orb body - gold gradient effect
            graphics.fillGradientStyle(0xFFD700, 0xFFD700, 0xFFA500, 0xFFA500, 1);
            graphics.fillCircle(10, 10, 9);
            
            // Inner glow
            graphics.fillStyle(0xFFFF88, 0.7);
            graphics.fillCircle(10, 10, 6);
            
            // Bright center
            graphics.fillStyle(0xFFFFFF, 0.9);
            graphics.fillCircle(10, 10, 3);
            
            // Golden border
            graphics.lineStyle(2, 0xFFE55C, 1);
            graphics.strokeCircle(10, 10, 9);
            
            // Outer shine effect
            graphics.lineStyle(1, 0xFFF68F, 0.8);
            graphics.strokeCircle(10, 10, 10);
            
            graphics.generateTexture('Gold', 20, 20);
            graphics.destroy();
        }

        // VFX textures remain the same
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
        
        // REMOVED: Don't handle experience orb collection here - let ExpOrb handle it
        // The ExpOrb prefab already has its own collection logic with magnetism
        
        // FIXED: Add gold orb collision with enhanced logging
        this.scene.physics.add.overlap(
            this.player,
            this.goldOrbs,
            (player, goldOrb) => {
                console.log("🟡 Gold orb collision detected in setupCollisions!");
                this.collectGoldOrb(goldOrb);
            }
        );
    }
    
    setupTimers() {
        this.orbSpawnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.spawnRandomExperienceOrb(),
            loop: true
        });
        
        this.goldSpawnTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => this.spawnRandomGoldOrb(),
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
        this.scene.goldSpawnTimer = this.goldSpawnTimer;
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
                
                // DON'T call setupOrbMovement - ExpOrb handles its own movement
                
                return expOrb;
            }
        } catch (error) {
            console.log("ExpOrb class not available, using fallback");
        }
        
        return this.createFallbackOrb(x, y, value);
    }
    
    // FIXED: Enhanced gold orb spawning with comprehensive logging
    spawnGoldOrb(x, y, value = 1) {
        console.log("🟡 GameplayManager.spawnGoldOrb() called:", { x, y, value });
        
        try {
            if (GoldPrefab) {
                console.log("🟡 Using GoldPrefab class");
                const goldOrb = new GoldPrefab(this.scene, x, y);
                this.scene.add.existing(goldOrb);
                this.goldOrbs.add(goldOrb);
                goldOrb.setGoldValue(value);
                goldOrb.setDepth(12);
                
                console.log("🟢 GoldPrefab orb created successfully");
                return goldOrb;
            }
        } catch (error) {
            console.log("🟠 GoldPrefab class not available, using fallback:", error);
        }
        
        console.log("🟡 Creating fallback gold orb");
        return this.createFallbackGoldOrb(x, y, value);
    }
    
    createFallbackOrb(x, y, value) {
        const orb = this.scene.add.circle(x, y, 6, 0x00ffff);
        orb.expValue = value || 5;
        this.scene.physics.add.existing(orb);
        orb.body.setCircle(6);
        orb.setDepth(12);
        this.expOrbs.add(orb);
        
        // For fallback orbs, we DO need collision detection
        this.scene.physics.add.overlap(this.player, orb, (player, orb) => {
            this.collectExperienceOrb(orb);
        });
        
        this.setupOrbMovement(orb);
        
        this.scene.time.delayedCall(30000, () => {
            if (orb && orb.active) {
                orb.destroy();
            }
        });
        
        return orb;
    }
    
    // FIXED: Enhanced fallback gold orb creation with comprehensive logging
    createFallbackGoldOrb(x, y, value) {
        console.log("🟡 Creating fallback gold orb:", { x, y, value });
        
        const goldOrb = this.scene.add.circle(x, y, 8, 0xFFD700);
        goldOrb.goldValue = value || 1;
        this.scene.physics.add.existing(goldOrb);
        goldOrb.body.setCircle(8);
        goldOrb.setDepth(12);
        this.goldOrbs.add(goldOrb);
        
        console.log("🟡 Setting up collision detection for fallback gold orb");
        
        // CRITICAL: For fallback gold orbs, we DO need collision detection
        this.scene.physics.add.overlap(this.player, goldOrb, (player, goldOrb) => {
            console.log("🟡 Fallback gold orb collision detected!");
            this.collectGoldOrb(goldOrb);
        });
        
        this.setupGoldOrbMovement(goldOrb);
        
        this.scene.time.delayedCall(45000, () => {
            if (goldOrb && goldOrb.active) {
                console.log("🟠 Gold orb timed out and destroyed");
                goldOrb.destroy();
            }
        });
        
        console.log("🟢 Fallback gold orb created successfully");
        return goldOrb;
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
    
    setupGoldOrbMovement(goldOrb) {
        const moveToPlayer = () => {
            if (!this.player || this.player.isDead || !goldOrb.body) return;
            
            const distance = Phaser.Math.Distance.Between(
                goldOrb.x, goldOrb.y, this.player.x, this.player.y
            );
            
            const pickupRange = (this.player.pickupRange || 50) + 20; // Gold has slightly larger pickup range
            
            if (distance < pickupRange) {
                const angle = Phaser.Math.Angle.Between(
                    goldOrb.x, goldOrb.y, this.player.x, this.player.y
                );
                
                const speed = 180;
                goldOrb.body.setVelocity(
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
        
        goldOrb.on('destroy', () => {
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
    
    spawnRandomGoldOrb() {
        if (!this.player) return;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(250, 600);
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        let value = 1;
        const roll = Math.random();
        if (roll > 0.98) value = 20;
        else if (roll > 0.9) value = 10;
        else if (roll > 0.7) value = 5;
        else if (roll > 0.4) value = 2;
        
        return this.spawnGoldOrb(x, y, value);
    }
    
    // KEEP this method for fallback orbs only
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
    
    // FIXED: Enhanced gold collection with comprehensive logging and event dispatching
    collectGoldOrb(goldOrb) {
        try {
            console.log("🟡 GameplayManager.collectGoldOrb() called");
            console.log("🟡 Gold orb details:", {
                x: goldOrb.x,
                y: goldOrb.y,
                goldValue: goldOrb.goldValue,
                active: goldOrb.active
            });
            
            const goldValue = goldOrb.goldValue || 1;
            console.log("🟡 Gold value to add:", goldValue);
            
            console.log("🟡 GameManager available:", !!this.gameManager);
            
            if (this.gameManager) {
                console.log("🟡 Calling gameManager.addGold()");
                this.gameManager.addGold(goldValue);
                console.log("🟢 gameManager.addGold() completed");
            } else {
                console.log("🔴 No GameManager available!");
            }
            
            const goldText = this.scene.add.text(goldOrb.x, goldOrb.y - 20, `+${goldValue} Gold`, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 1,
                fontWeight: 'bold'
            });
            goldText.setOrigin(0.5);
            
            this.scene.tweens.add({
                targets: goldText,
                y: goldText.y - 30,
                alpha: 0,
                duration: 1200,
                onComplete: () => goldText.destroy()
            });
            
            console.log("🟢 Gold orb destroyed and text animation started");
            goldOrb.destroy();
            
        } catch (error) {
            console.error("🔴 Error collecting gold orb:", error);
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
        
        // ENHANCED: Gold orb spawn control with logging
        keyboard.on('keydown-G', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            console.log("🟡 Manual gold orb spawn at:", world);
            this.spawnGoldOrb(world.x, world.y, 5);
        });
        
        keyboard.on('keydown-K', () => {
            this.mobManager.killAllMobs();
        });
        
        keyboard.on('keydown-O', () => {
            for (let i = 0; i < 10; i++) {
                this.spawnRandomExperienceOrb();
            }
        });
        
        // ENHANCED: Spawn multiple gold orbs with logging
        keyboard.on('keydown-P', () => {
            console.log("🟡 Spawning 10 random gold orbs");
            for (let i = 0; i < 10; i++) {
                this.spawnRandomGoldOrb();
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
        console.log("E=Orb, G=GoldOrb, K=KillAll, O=10Orbs, P=10GoldOrbs, W=Wave, L=Stats");
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
        
        // Check gold orb bounds
        if (this.goldOrbs) {
            this.goldOrbs.getChildren().forEach(goldOrb => {
                if (!goldOrb.active) return;
                
                const distance = Phaser.Math.Distance.Between(
                    goldOrb.x, goldOrb.y, this.player.x, this.player.y
                );
                
                if (distance > maxDistance) {
                    goldOrb.destroy();
                }
            });
        }
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
        
        if (this.goldOrbs) {
            this.goldOrbs.getChildren().forEach(goldOrb => {
                if (goldOrb.depth < 10) {
                    goldOrb.setDepth(12);
                }
            });
        }
    }
    
    shutdown() {
        [this.orbSpawnTimer, this.goldSpawnTimer, this.difficultyTimer].forEach(timer => {
            if (timer) timer.remove();
        });
        
        this.mobManager.shutdown();
        
        if (this.expOrbs) {
            this.expOrbs.clear(true, true);
        }
        
        if (this.goldOrbs) {
            this.goldOrbs.clear(true, true);
        }
        
        if (this.scene.input?.keyboard) {
            ['keydown-E', 'keydown-G', 'keydown-Z', 'keydown-V', 'keydown-X', 'keydown-B', 
             'keydown-N', 'keydown-M', 'keydown-K', 'keydown-O', 'keydown-P', 'keydown-W', 'keydown-L'].forEach(event => {
                this.scene.input.keyboard.removeAllListeners(event);
            });
        }
    }
}