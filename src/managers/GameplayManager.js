import GameManager from "./GameManager";
import ExpOrb from "../prefabs/ExpOrb";
import Zombie from "../prefabs/Enemies/Zombie1";

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
        
        console.log("GameplayManager initialized");
    }
    
    initialize(player) {
        this.player = player;
        
        this.enemies = this.scene.add.group();
        this.expOrbs = this.scene.add.group();
        
        this.scene.enemies = this.enemies;

        this.createPlaceholderTextures();
        this.setupCollisions();
        this.setupEnemyCollisions();
        this.setupTimers();
        
        this.setupTestControls();
        this.scene.spawnExperienceOrb = this.spawnExperienceOrb.bind(this);
        
        console.log("GameplayManager setup complete");
    }
    
    setupTimers() {
        const { enemySpawnDelay } = this.gameManager.gameProgress;
        this.orbSpawnTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.spawnRandomExperienceOrb,
            callbackScope: this,
            loop: true
        });
        this.scene.orbSpawnTimer = this.orbSpawnTimer;
        this.enemySpawnTimer = this.scene.time.addEvent({
            delay: enemySpawnDelay,
            callback: this.spawnRandomEnemy,
            callbackScope: this,
            loop: true
        });
        
        this.scene.enemySpawnTimer = this.enemySpawnTimer;
        
        this.difficultyTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameManager.updateDifficulty(1000);
                this.updateSpawnTimers();
            },
            callbackScope: this,
            loop: true
        });
        
        this.scene.difficultyTimer = this.difficultyTimer;
    }
    
    updateSpawnTimers() {
        if (this.enemySpawnTimer && this.enemySpawnTimer.delay !== this.gameManager.gameProgress.enemySpawnDelay) {
            this.enemySpawnTimer.delay = this.gameManager.gameProgress.enemySpawnDelay;
        }
        
        if (this.orbSpawnTimer) {
            const gameTime = this.gameManager.gameProgress.gameTime;
            const initialDelay = 2000;
            const minDelay = 500;
            const timeToReachMin = 300;

            if (gameTime < timeToReachMin) {
                const factor = 1 - (gameTime / timeToReachMin);
                const newDelay = minDelay + (initialDelay - minDelay) * factor;

                if (Math.abs(this.orbSpawnTimer.delay - newDelay) > 50) {
                    this.orbSpawnTimer.delay = newDelay;
                }
            }
        }
    }
    
    setupCollisions() {
        if (!this.scene.physics || !this.player) return;
        
        this.scene.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );
        
        this.scene.physics.add.overlap(
            this.player,
            this.expOrbs,
            this.handlePlayerOrbCollision,
            null,
            this
        );
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        if (enemy.attackPlayer) {
            enemy.attackPlayer(player);
        }
    }
    
    handlePlayerOrbCollision(player, orb) {
        if (orb.collect) {
            orb.collect();
        }
    }
    
    spawnExperienceOrb(x, y, value = 1) {
        try {
            const expOrb = new ExpOrb(this.scene, x, y);
            this.scene.add.existing(expOrb);
            
            if (this.expOrbs) {
                this.expOrbs.add(expOrb);
            }

            expOrb.setExpValue(value);

            const magnetRange = this.gameManager.gameProgress.orbMagnetRange;
            if (magnetRange) {
                expOrb.magneticRange = magnetRange;
            }
            
            // Add some initial velocity
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
        try {
            if (!this.player) return;
            
            // Use the player as the center reference
            const playerX = this.player.x;
            const playerY = this.player.y;
            
            // Define a large spawn radius around the player
            const minSpawnDistance = 200;
            const maxSpawnDistance = 800;
            
            // Generate a random angle
            const angle = Math.random() * Math.PI * 2;
            
            // Random distance between min and max
            const distance = minSpawnDistance + Math.random() * (maxSpawnDistance - minSpawnDistance);
            
            // Calculate the spawn position
            const x = playerX + Math.cos(angle) * distance;
            const y = playerY + Math.sin(angle) * distance;
    
            // Determine orb value
            let value = 1;
            const roll = Math.random();
            if (roll > 0.95) {
                value = 10;
            } else if (roll > 0.8) {
                value = 5;
            } else if (roll > 0.5) {
                value = 2;
            }
    
            return this.spawnExperienceOrb(x, y, value);
        } catch (error) {
            console.error("Error spawning random experience orb:", error);
            return null;
        }
    }
    
    setupEnemyCollisions() {
        if (!this.scene || !this.enemies) return;
        
        const collidableLayers = [];
        
        if (this.scene.map_Col_1 && this.scene.map_Col_1.collisionWidth > 0) {
            collidableLayers.push(this.scene.map_Col_1);
        }
        
        if (this.scene.hG_1 && this.scene.hG_1.collisionWidth > 0) {
            collidableLayers.push(this.scene.hG_1);
        }
        
        if (this.scene.backGround && this.scene.backGround.collisionWidth > 0) {
            collidableLayers.push(this.scene.backGround);
        }
        
        if (this.scene.wall_Upper_1 && this.scene.wall_Upper_1.collisionWidth > 0) {
            collidableLayers.push(this.scene.wall_Upper_1);
        }
        
        if (this.scene.wall_down_1 && this.scene.wall_down_1.collisionWidth > 0) {
            collidableLayers.push(this.scene.wall_down_1);
        }
        
        collidableLayers.forEach(layer => {
            this.scene.physics.add.collider(this.enemies, layer);
            console.log(`Added enemy collision with layer: ${layer.layer?.name || 'unnamed layer'}`);
        });
        
        this.enemies.on('addchild', (enemy) => {
            if (enemy.body) {
                if (!enemy.bodyWidthSet) {
                    enemy.body.setSize(16, 16);
                    enemy.bodyWidthSet = true;
                }
                enemy.body.immovable = false;
                enemy.body.pushable = true;
            }
        });
    }
    
    spawnEnemy(x, y) {
        try {
            const maxEnemies = this.gameManager.gameProgress.maxEnemies;
            if (this.enemies && this.enemies.getChildren().length >= maxEnemies) {
                return null;
            }
            
            const difficultyLevel = this.gameManager.gameProgress.currentDifficulty;
            
            const zombie = new Zombie(this.scene, x, y);
            this.scene.add.existing(zombie);
            
            if (zombie.body) {
                zombie.body.setBounce(0.1, 0.1);
                zombie.body.setCollideWorldBounds(false); // Allow enemies to move beyond world bounds
                zombie.body.immovable = false;
                zombie.body.pushable = true;
            }
            this.enemies.add(zombie);
            
            zombie.maxHealth = 30 * (1 + (difficultyLevel - 1) * 0.2);
            zombie.health = zombie.maxHealth;
            zombie.damage = 10 * (1 + (difficultyLevel - 1) * 0.1);
            zombie.speed = 50 * (1 + (difficultyLevel - 1) * 0.05);
            
            return zombie;
        } catch (error) {
            console.error("Error spawning enemy:", error);
            return null;
        }
    }
    
    spawnRandomEnemy() {
        try {
            if (!this.player) return;
            
            // Use the player's position as a center reference
            const playerX = this.player.x;
            const playerY = this.player.y;
            
            // Spawn outside camera view but close enough to be relevant
            const spawnDistance = 800; // Distance from player
            
            // Random angle for spawn position
            const angle = Math.random() * Math.PI * 2;
            
            // Calculate spawn coordinates
            const x = playerX + Math.cos(angle) * spawnDistance;
            const y = playerY + Math.sin(angle) * spawnDistance;
            
            return this.spawnEnemy(x, y);
        } catch (error) {
            console.error("Error spawning random enemy:", error);
            return null;
        }
    }
    
    checkEnemyBounds() {
        if (!this.enemies || !this.player) return;
        
        // Define a larger boundary around the player, beyond which enemies should teleport
        const maxDistanceFromPlayer = 1500;
        
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || enemy.isDead) return;
            
            const distanceToPlayer = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );
            
            if (distanceToPlayer > maxDistanceFromPlayer) {
                this.teleportEnemyNearPlayer(enemy);
            }
        });
    }
    
    // Check and remove orbs that are too far from the player
    checkOrbBounds() {
        if (!this.expOrbs || !this.player) return;
        
        const maxOrbDistance = 2000; // Orbs further than this will be removed
        
        this.expOrbs.getChildren().forEach(orb => {
            if (!orb.active) return;
            
            const distanceToPlayer = Phaser.Math.Distance.Between(
                orb.x, orb.y,
                this.player.x, this.player.y
            );
            
            if (distanceToPlayer > maxOrbDistance) {
                orb.destroy(); // Remove orbs that are too far away
            }
        });
    }
    
    teleportEnemyNearPlayer(enemy) {
        try {
            if (!this.player) return;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            
            const newX = this.player.x + Math.cos(angle) * distance;
            const newY = this.player.y + Math.sin(angle) * distance;
            
            enemy.x = newX;
            enemy.y = newY;
            
            if (enemy.body) {
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
            }
            
            this.createTeleportEffect(newX, newY);
        } catch (error) {
            console.error("Error teleporting enemy:", error);
        }
    }
    
    createTeleportEffect(x, y) {
        try {
            const circle = this.scene.add.circle(x, y, 30, 0x33ff33, 0.7);
            
            this.scene.tweens.add({
                targets: circle,
                scale: 0,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    circle.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating teleport effect:", error);
        }
    }
    
    createPlaceholderTextures() {
        try {
            if (!this.scene.textures.exists('zombierun')) {
                this.createZombiePlaceholder();
            }
            
            if (!this.scene.textures.exists('particle')) {
                const graphics = this.scene.add.graphics();
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(8, 8, 8);
                graphics.generateTexture('particle', 16, 16);
                graphics.destroy();
            }
            
            // Create a placeholder texture for Exp orbs if needed
            if (!this.scene.textures.exists('Exp')) {
                const graphics = this.scene.add.graphics();
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(8, 8, 8);
                graphics.lineStyle(1, 0xffffff, 1);
                graphics.strokeCircle(8, 8, 8);
                graphics.generateTexture('Exp', 16, 16);
                graphics.destroy();
            }
        } catch (error) {
            console.error("Error creating placeholder textures:", error);
        }
    }
    
    createZombiePlaceholder() {
        try {
            const zombieGraphics = this.scene.add.graphics();
            
            zombieGraphics.fillStyle(0x336633, 1);
            zombieGraphics.fillRect(8, 8, 16, 16);
            
            zombieGraphics.fillStyle(0x336633, 1);
            zombieGraphics.fillRect(4, 12, 4, 8);
            zombieGraphics.fillRect(24, 12, 4, 8);
        
            zombieGraphics.generateTexture('zombierun', 32, 32);
            zombieGraphics.destroy();
            
            console.log("Created zombie placeholder texture");
        } catch (error) {
            console.error("Error creating zombie placeholder:", error);
        }
    }
    
    setupTestControls() {
        try {
            // Press E to spawn an orb at cursor position
            this.scene.input.keyboard.on('keydown-E', () => {
                const pointer = this.scene.input.activePointer;
                const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.spawnExperienceOrb(worldPoint.x, worldPoint.y, 1);
            });

            // Press Z to spawn a zombie at cursor position
            this.scene.input.keyboard.on('keydown-Z', () => {
                const pointer = this.scene.input.activePointer;
                const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.spawnEnemy(worldPoint.x, worldPoint.y);
            });
            
            // Press K to kill all enemies
            this.scene.input.keyboard.on('keydown-K', () => {
                if (this.enemies) {
                    this.enemies.getChildren().forEach(enemy => {
                        if (enemy.takeDamage) {
                            enemy.takeDamage(1000); 
                        }
                    });
                }
            });
            
            // Press O to spawn 10 orbs around the player
            this.scene.input.keyboard.on('keydown-O', () => {
                for (let i = 0; i < 10; i++) {
                    this.spawnRandomExperienceOrb();
                }
            });
        } catch (error) {
            console.error("Error setting up test controls:", error);
        }
    }
    
    update(time, delta) {
        this.checkEnemyBounds();
        this.checkOrbBounds();
    }
    
    shutdown() {
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.orbSpawnTimer) this.orbSpawnTimer.remove();
        if (this.difficultyTimer) this.difficultyTimer.remove();
        
        if (this.scene && this.scene.input) {
            this.scene.input.keyboard.removeAllListeners('keydown-E');
            this.scene.input.keyboard.removeAllListeners('keydown-Z');
            this.scene.input.keyboard.removeAllListeners('keydown-K');
            this.scene.input.keyboard.removeAllListeners('keydown-O');
        }
    }
}