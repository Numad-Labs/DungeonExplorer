import GameManager from "./GameManager";
import ExpOrb from "../prefabs/ExpOrb";
import Zombie from "../prefabs/Enemies/Zombie1";
import Zombie2 from "../prefabs/Enemies/Zombie2";

export default class GameplayManager {
    constructor(scene) {
        this.scene = scene;
        this.gameManager = GameManager.get();
        
        // Game objects
        this.player = null;
        this.enemies = null;
        this.expOrbs = null;
        
        // Timers
        this.enemySpawnTimer = null;
        this.orbSpawnTimer = null;
        this.difficultyTimer = null;
        
        console.log("GameplayManager initialized");
    }
    
    initialize(player) {
        this.player = player;
        
        // Create groups
        this.enemies = this.scene.add.group();
        this.expOrbs = this.scene.add.group();
        this.scene.enemies = this.enemies;
        
        // Setup systems
        this.createTextures();
        this.setupCollisions();
        this.setupTimers();
        this.setupControls();
        
        // Expose spawn method to scene
        this.scene.spawnExperienceOrb = (x, y, value) => this.spawnExperienceOrb(x, y, value);
        
        console.log("GameplayManager setup complete");
    }
    
    createTextures() {
        // Create zombie textures if missing
        if (!this.scene.textures.exists('zombierun')) {
            this.createZombieTexture('zombierun');
        }
        if (!this.scene.textures.exists('Zombie2RunAni')) {
            this.createZombieTexture('Zombie2RunAni');
        }
        
        // Create exp orb texture if missing
        if (!this.scene.textures.exists('Exp')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x00ffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.lineStyle(1, 0xffffff, 1);
            graphics.strokeCircle(8, 8, 8);
            graphics.generateTexture('Exp', 16, 16);
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
        
        // Player-enemy collision
        this.scene.physics.add.overlap(
            this.player,
            this.enemies,
            (player, enemy) => enemy.attackPlayer?.(player)
        );
        
        // Player-orb collision
        this.scene.physics.add.overlap(
            this.player,
            this.expOrbs,
            (player, orb) => orb.collect?.()
        );
    }
    
    setupTimers() {
        // Enemy spawning
        this.enemySpawnTimer = this.scene.time.addEvent({
            delay: this.gameManager.gameProgress.enemySpawnDelay,
            callback: () => this.spawnRandomEnemy(),
            loop: true
        });
        
        // Orb spawning
        this.orbSpawnTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => this.spawnRandomExperienceOrb(),
            loop: true
        });
        
        // Difficulty updates
        this.difficultyTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameManager.updateDifficulty(1000);
                this.updateSpawnRates();
            },
            loop: true
        });
        
        // Store timers on scene for external access
        this.scene.enemySpawnTimer = this.enemySpawnTimer;
        this.scene.orbSpawnTimer = this.orbSpawnTimer;
        this.scene.difficultyTimer = this.difficultyTimer;
    }
    
    updateSpawnRates() {
        // Update enemy spawn rate based on difficulty
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.delay = this.gameManager.gameProgress.enemySpawnDelay;
        }
        
        // Update orb spawn rate based on game time
        if (this.orbSpawnTimer) {
            const gameTime = this.gameManager.gameProgress.gameTime;
            const newDelay = Math.max(500, 2000 - (gameTime / 300) * 1500);
            this.orbSpawnTimer.delay = newDelay;
        }
    }
    
    // Enemy spawning
    spawnRandomEnemy() {
        if (!this.player) return;
        
        const maxEnemies = this.gameManager.gameProgress.maxEnemies;
        if (this.enemies.getChildren().length >= maxEnemies) return;
        
        // Random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = 800;
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        // Choose enemy type based on difficulty
        const enemyType = Math.random() < 0.7 ? 'zombie' : 'zombieBig';
        
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
            } else {
                enemy = new Zombie(this.scene, x, y);
                enemy.maxHealth = 30 * (1 + (difficulty - 1) * 0.2);
                enemy.damage = 10 * (1 + (difficulty - 1) * 0.1);
                enemy.speed = 50 * (1 + (difficulty - 1) * 0.05);
            }
            
            enemy.health = enemy.maxHealth;
            enemy.enemyType = enemyType;
            
            this.scene.add.existing(enemy);
            this.enemies.add(enemy);
            
            // Configure physics
            if (enemy.body) {
                enemy.body.setBounce(0.1, 0.1);
                enemy.body.setCollideWorldBounds(false);
            }
            
            console.log(`Spawned ${enemyType} at (${Math.round(x)}, ${Math.round(y)})`);
            return enemy;
            
        } catch (error) {
            console.error("Error spawning enemy:", error);
            return null;
        }
    }
    
    // Experience orb spawning
    spawnExperienceOrb(x, y, value = 1) {
        try {
            const expOrb = new ExpOrb(this.scene, x, y);
            this.scene.add.existing(expOrb);
            this.expOrbs.add(expOrb);
            
            expOrb.setExpValue(value);
            
            // Add initial velocity
            if (expOrb.body) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Phaser.Math.Between(20, 50);
                expOrb.body.velocity.x = Math.cos(angle) * speed;
                expOrb.body.velocity.y = Math.sin(angle) * speed;
            }
            
            return expOrb;
        } catch (error) {
            console.error("Error spawning experience orb:", error);
            return null;
        }
    }
    
    spawnRandomExperienceOrb() {
        if (!this.player) return;
        
        // Random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(200, 800);
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        // Random value with weighted distribution
        let value = 1;
        const roll = Math.random();
        if (roll > 0.95) value = 10;
        else if (roll > 0.8) value = 5;
        else if (roll > 0.5) value = 2;
        
        return this.spawnExperienceOrb(x, y, value);
    }
    
    // Cleanup methods
    checkEnemyBounds() {
        if (!this.enemies || !this.player) return;
        
        const maxDistance = 1500;
        
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
        
        // Visual effect
        const circle = this.scene.add.circle(enemy.x, enemy.y, 30, 0x33ff33, 0.7);
        this.scene.tweens.add({
            targets: circle,
            scale: 0,
            alpha: 0,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }
    
    // Debug controls - always available for testing
    setupControls() {
        const keyboard = this.scene.input.keyboard;
        
        // Spawn controls
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
        
        keyboard.on('keydown-E', () => {
            const pointer = this.scene.input.activePointer;
            const world = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.spawnExperienceOrb(world.x, world.y, 1);
        });
        
        // Utility controls
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
            console.log(`Enemies (${enemyList.length}):`);
            enemyList.forEach((enemy, i) => {
                console.log(`${i + 1}. ${enemy.enemyType} - Health: ${enemy.health} - Pos: (${Math.round(enemy.x)}, ${Math.round(enemy.y)})`);
            });
        });
        
        console.log("Debug controls: Z=Zombie, X=BigZombie, E=Orb, K=KillAll, O=10Orbs, L=ListEnemies");
    }
    
    update(time, delta) {
        this.checkEnemyBounds();
        this.checkOrbBounds();
    }
    
    shutdown() {
        // Clean up timers
        [this.enemySpawnTimer, this.orbSpawnTimer, this.difficultyTimer].forEach(timer => {
            if (timer) timer.remove();
        });
        
        // Clean up controls
        if (this.scene.input?.keyboard) {
            ['keydown-E', 'keydown-Z', 'keydown-X', 'keydown-K', 'keydown-O', 'keydown-L'].forEach(event => {
                this.scene.input.keyboard.removeAllListeners(event);
            });
        }
        
        console.log("GameplayManager shutdown complete");
    }
}