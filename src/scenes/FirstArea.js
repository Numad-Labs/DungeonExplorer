// You can write more code here

/* START OF COMPILED CODE */

import PlayerPrefab from "../prefabs/PlayerPrefab";
import ExpOrb from "../prefabs/ExpOrb";
/* START-USER-IMPORTS */
import PlayerLevel from "../prefabs/PlayerLevel";
import PowerUpManager from "../components/PowerUpManager";
import HealthBar from "../prefabs/HealthBar";
import Zombie from "../prefabs/Enemies/Zombie1";
import PlayerAttack from "../prefabs/PlayerAttack";
/* END-USER-IMPORTS */

export default class FirstArea extends Phaser.Scene {

	constructor() {
		super("FirstArea");

		/* START-USER-CTR-CODE */
		// Game parameters
		this.enemySpawnTimer = null;
		this.orbSpawnTimer = null;
		this.gameTime = 0;
        this.orbMagnetRange = 50; // Default magnet range for orbs
        
        // Enemy containers
        this.enemies = null;
        
        // Difficulty settings
        this.difficultyLevel = 1;
        this.maxEnemies = 10; // Start with 10 max enemies
        this.enemySpawnDelay = 3000; // Start with 3 seconds between spawns
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// rectangle_1
		const rectangle_1 = this.add.rectangle(621, 363, 128, 128);
		rectangle_1.scaleX = 14.943331427545049;
		rectangle_1.scaleY = 6.893171431980892;
		rectangle_1.isFilled = true;

		// playerPrefab
		const playerPrefab = new PlayerPrefab(this, 486, 226);
		this.add.existing(playerPrefab);

		// expOrb
		const expOrb = new ExpOrb(this, 529, 303);
		this.add.existing(expOrb);

		this.playerPrefab = playerPrefab;

		this.events.emit("scene-awake");
	}

	/** @type {PlayerPrefab} */
	playerPrefab;

	/* START-USER-CODE */

	create() {
		try {
			// Create the base scene
			this.editorCreate();

			// Make player accessible to other game objects
			this.player = this.playerPrefab;

            // Set initial player stats
            this.setupPlayerStats();

			// Make sure main camera is properly set up
			const cam = this.cameras.main;
			console.log("Camera bounds:", cam.width, cam.height);

			// Setup HUD systems
			this.setupHUD();

            // Setup power-up manager
            this.setupPowerUpManager();

			// Setup enemy container
			this.setupEnemies();

			// Setup player attack system
			this.setupPlayerAttack();

			// Setup timers for spawning orbs and enemies
			this.setupTimers();

			// Set up keyboard shortcuts for testing
			this.setupTestControls();

            // Create particle manager for effects
            this.setupParticles();

			// Setup collision detection
			this.setupCollisions();
		} catch (error) {
			console.error("Error in FirstArea create:", error);
		}
	}

	update(time, delta) {
		try {
			// Update game time (in seconds)
			this.gameTime += delta / 1000;
			
			// Check player health for UI updates
			if (this.player && this.healthBar) {
				this.healthBar.updateHealth(this.player.health, this.player.maxHealth);
			}
			
			// Update player attack stats
			if (this.playerAttackSystem) {
				this.playerAttackSystem.updateStats();
			}
			
			// Check for enemies out of bounds
			if (this.enemies) {
				const bounds = {
					x: -500,
					y: -500,
					width: this.cameras.main.width + 1000,
					height: this.cameras.main.height + 1000
				};
				
				this.enemies.getChildren().forEach(enemy => {
					// If enemy is far outside the screen, teleport it closer to player
					if (enemy.x < bounds.x || enemy.x > bounds.x + bounds.width ||
						enemy.y < bounds.y || enemy.y > bounds.y + bounds.height) {
						
						// Only teleport active enemies
						if (enemy.active && !enemy.isDead) {
							this.teleportEnemyNearPlayer(enemy);
						}
					}
				});
			}
		} catch (error) {
			console.error("Error in FirstArea update:", error);
		}
	}

    setupPlayerStats() {
        // Set initial player stats if not already defined
        if (this.player) {
            // Movement speed
            if (typeof this.player.moveSpeed === 'undefined') {
                this.player.moveSpeed = 200;
            }

            // Health stats
            if (typeof this.player.maxHealth === 'undefined') {
                this.player.maxHealth = 100;
                this.player.health = 100;
            }

            // Attack stats
            if (typeof this.player.damage === 'undefined') {
                this.player.damage = 10;
            }

            if (typeof this.player.fireRate === 'undefined') {
                this.player.fireRate = 1; // Attacks per second
            }

            if (typeof this.player.attackRange === 'undefined') {
                this.player.attackRange = 100;
            }
            
            // Ensure player has takeDamage method
            if (typeof this.player.takeDamage !== 'function') {
                this.player.takeDamage = function(amount) {
                    // If player is invulnerable, ignore damage
                    if (this.isInvulnerable) return;
                    
                    // Apply damage
                    this.health -= amount;
                    
                    // Update health bar
                    if (this.scene.healthBar) {
                        this.scene.healthBar.updateHealth(this.health, this.maxHealth);
                        this.scene.healthBar.showDamageFlash();
                    }
                    
                    // Visual feedback - flash red
                    this.setTint(0xff0000);
                    
                    // Set temporary invulnerability
                    this.isInvulnerable = true;
                    
                    // Flash effect while invulnerable
                    this.scene.tweens.add({
                        targets: this,
                        alpha: 0.6,
                        duration: 100,
                        yoyo: true,
                        repeat: 4
                    });
                    
                    // Reset invulnerability after delay
                    this.scene.time.delayedCall(500, () => {
                        this.isInvulnerable = false;
                        this.clearTint();
                        this.alpha = 1;
                    });
                    
                    // Check if player died
                    if (this.health <= 0) {
                        this.die();
                    }
                };
            }
            
            // Ensure player has heal method
            if (typeof this.player.heal !== 'function') {
                this.player.heal = function(amount) {
                    this.health = Math.min(this.health + amount, this.maxHealth);
                    
                    // Update health bar
                    if (this.scene.healthBar) {
                        this.scene.healthBar.updateHealth(this.health, this.maxHealth);
                        this.scene.healthBar.showHealEffect();
                    }
                    
                    // Visual feedback - flash green
                    this.setTint(0x00ff00);
                    this.scene.time.delayedCall(200, () => {
                        this.clearTint();
                    });
                };
            }
            
            // Ensure player has die method
            if (typeof this.player.die !== 'function') {
                this.player.die = function() {
                    // Stop movement
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                    
                    // Disable input
                    this.scene.input.keyboard.enabled = false;
                    
                    // Play death animation
                    this.scene.tweens.add({
                        targets: this,
                        angle: 90,
                        alpha: 0,
                        duration: 1000
                    });
                    
                    // Show game over text
                    const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
                    const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
                    
                    const gameOverText = this.scene.add.text(
                        screenCenterX, 
                        screenCenterY, 
                        'GAME OVER', 
                        {
                            fontFamily: 'Arial',
                            fontSize: '48px',
                            color: '#ff0000',
                            stroke: '#000000',
                            strokeThickness: 6
                        }
                    );
                    gameOverText.setOrigin(0.5);
                    gameOverText.setScrollFactor(0);
                    gameOverText.setDepth(1000);
                    
                    // Add restart text
                    const restartText = this.scene.add.text(
                        screenCenterX,
                        screenCenterY + 60,
                        'Press R to restart',
                        {
                            fontFamily: 'Arial',
                            fontSize: '24px',
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 4
                        }
                    );
                    restartText.setOrigin(0.5);
                    restartText.setScrollFactor(0);
                    restartText.setDepth(1000);
                    
                    // Add restart key handler
                    this.scene.input.keyboard.once('keydown-R', () => {
                        this.scene.scene.restart();
                    });
                };
            }
            
            // Ensure player has updateHealthBar method
            if (typeof this.player.updateHealthBar !== 'function') {
                this.player.updateHealthBar = function() {
                    if (this.scene.healthBar) {
                        this.scene.healthBar.updateHealth(this.health, this.maxHealth);
                    }
                };
            }

            console.log("Player stats initialized:", {
                moveSpeed: this.player.moveSpeed,
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                damage: this.player.damage,
                fireRate: this.player.fireRate,
                attackRange: this.player.attackRange
            });
        }
    }

	setupHUD() {
		try {
			// Create health bar at top-left
			this.healthBar = new HealthBar(this, 324, 184, 200, 20);
			
			// Setup level system at top-center
			this.playerLevel = new PlayerLevel(this, 320, 30);
			this.add.existing(this.playerLevel);
			
			// Create progress bar for experience
			this.playerLevel.createProgressBar(0, 0, 300, 20);
			
			// Register level up callback
			this.playerLevel.onLevelUp((newLevel) => {
				console.log(`Player reached level ${newLevel}!`);
				this.showLevelUpOptions();
			});
			
			console.log("HUD elements created");
		} catch (error) {
			console.error("Error setting up HUD:", error);
		}
	}

    setupPowerUpManager() {
        try {
            // Create power-up manager
            this.powerUpManager = new PowerUpManager(this);
            console.log("Power-up manager created");

            // Check if needed textures exist, create them if not
            this.createPlaceholderTextures();
        } catch (error) {
            console.error("Error setting up power-up manager:", error);
        }
    }
	
	setupEnemies() {
		try {
			// Create a container for all enemies
			this.enemies = this.add.group();
			
			// Create zombie placeholder texture if needed
			if (!this.textures.exists('zombierun')) {
				this.createZombiePlaceholder();
			}
			
			console.log("Enemy system initialized");
		} catch (error) {
			console.error("Error setting up enemies:", error);
		}
	}
	
	createZombiePlaceholder() {
		try {
			// Create a simple zombie placeholder texture
			const zombieGraphics = this.add.graphics();
			
			// Body
			zombieGraphics.fillStyle(0x336633, 1);
			zombieGraphics.fillRect(8, 8, 16, 16);
			
			// Arms (different angles for different frames)
			// Frame 0 (down)
			zombieGraphics.fillStyle(0x336633, 1);
			zombieGraphics.fillRect(4, 12, 4, 8);
			zombieGraphics.fillRect(24, 12, 4, 8);
			
			// Generate the texture atlas with 4 frames
			zombieGraphics.generateTexture('zombierun', 32, 32);
			
			// Create additional frames (1:left, 2:right, 3:up)
			const frameConfig = {
				key: 'zombierun',
				frames: [
					{ key: 'zombierun', frame: 0 }, // down
					{ key: 'zombierun', frame: 1 }, // left
					{ key: 'zombierun', frame: 2 }, // right 
					{ key: 'zombierun', frame: 3 }  // up
				]
			};
			
			// Clean up
			zombieGraphics.destroy();
			
			console.log("Created zombie placeholder texture");
		} catch (error) {
			console.error("Error creating zombie placeholder:", error);
		}
	}

    setupParticles() {
        try {
            // Create a simple particle texture if it doesn't exist
            if (!this.textures.exists('particle')) {
                const graphics = this.add.graphics();
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(8, 8, 8);
                graphics.generateTexture('particle', 16, 16);
                graphics.destroy();
            }
        } catch (error) {
            console.error("Error setting up particles:", error);
        }
    }

    createPlaceholderTextures() {
        try {
            // Check if the card texture exists
            if (!this.textures.exists('blank cards7')) {
                // Create a placeholder card texture
                const cardGraphics = this.add.graphics();
                cardGraphics.fillStyle(0x333333, 1);
                cardGraphics.fillRoundedRect(0, 0, 200, 300, 16);
                cardGraphics.lineStyle(4, 0xffffff, 1);
                cardGraphics.strokeRoundedRect(0, 0, 200, 300, 16);
                cardGraphics.generateTexture('blank cards7', 200, 300);
                cardGraphics.destroy();
            }

            // Create power-up icon textures if they don't exist
            const powerUpTypes = ['speed', 'damage', 'health', 'fireRate', 'range', 'magnet'];
            const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];

            powerUpTypes.forEach((type, index) => {
                const textureName = `${type}_icon`;
                if (!this.textures.exists(textureName)) {
                    const graphics = this.add.graphics();
                    graphics.fillStyle(colors[index], 1);
                    graphics.fillCircle(32, 32, 32);

                    // Add a symbol based on power-up type
                    graphics.fillStyle(0xffffff, 1);

                    switch (type) {
                        case 'speed':
                            // Draw lightning bolt
                            graphics.fillTriangle(20, 15, 32, 30, 25, 32);
                            graphics.fillTriangle(25, 32, 44, 50, 32, 30);
                            break;
                        case 'damage':
                            // Draw sword
                            graphics.fillRect(20, 20, 24, 4);
                            graphics.fillTriangle(44, 20, 44, 24, 52, 22);
                            break;
                        case 'health':
                            // Draw plus symbol
                            graphics.fillRect(22, 30, 20, 4);
                            graphics.fillRect(30, 22, 4, 20);
                            break;
                        case 'fireRate':
                            // Draw flame
                            graphics.fillTriangle(25, 45, 32, 15, 39, 45);
                            break;
                        case 'range':
                            // Draw target
                            graphics.lineStyle(3, 0xffffff, 1);
                            graphics.strokeCircle(32, 32, 15);
                            graphics.fillCircle(32, 32, 5);
                            break;
                        case 'magnet':
                            // Draw magnet
                            graphics.fillRect(22, 20, 7, 24);
                            graphics.fillRect(35, 20, 7, 24);
                            graphics.fillRect(22, 20, 20, 7);
                            break;
                    }

                    graphics.generateTexture(textureName, 64, 64);
                    graphics.destroy();
                }
            });
        } catch (error) {
            console.error("Error creating placeholder textures:", error);
        }
    }

	showLevelUpOptions() {
		try {
			// Use the power-up manager to show options
			if (this.powerUpManager) {
				console.log("Showing level up options via power-up manager");
				this.powerUpManager.showPowerUpSelection();
			} else {
				console.warn("Power-up manager not found");

				// Fallback behavior - just resume after 1 second
				this.time.delayedCall(1000, () => {
					this.scene.resume();
				});
			}
		} catch (error) {
			console.error("Error showing level up options:", error);
			// Make sure we resume even if there's an error
			this.scene.resume();
		}
	}

	setupTimers() {
		try {
			// Set a timer to periodically spawn experience orbs
			this.orbSpawnTimer = this.time.addEvent({
				delay: 2000,          // Every 2 seconds
				callback: this.spawnRandomExperienceOrb,
				callbackScope: this,
				loop: true
			});
			
			// Set a timer to periodically spawn enemies
			this.enemySpawnTimer = this.time.addEvent({
				delay: this.enemySpawnDelay,  // Initial spawn delay
				callback: this.spawnRandomEnemy,
				callbackScope: this,
				loop: true
			});
			
			// Set a timer to update difficulty periodically
			this.difficultyTimer = this.time.addEvent({
				delay: 10000,  // Check every 10 seconds
				callback: this.updateDifficulty,
				callbackScope: this,
				loop: true
			});
		} catch (error) {
			console.error("Error setting up timers:", error);
		}
	}
	
	setupCollisions() {
		try {
			// Set up collision detection between player and enemies
			this.physics.add.overlap(
				this.player,
				this.enemies,
				this.handlePlayerEnemyCollision,
				null,
				this
			);
		} catch (error) {
			console.error("Error setting up collisions:", error);
		}
	}
	
	setupPlayerAttack() {
		try {
			// Create the player attack system
			this.playerAttackSystem = new PlayerAttack(this, this.player);
			console.log("Player attack system initialized");
		} catch (error) {
			console.error("Error setting up player attack:", error);
		}
	}
	
	handlePlayerEnemyCollision(player, enemy) {
		// Only process if enemy has an attack method
		if (enemy.attackPlayer) {
			enemy.attackPlayer(player);
		}
	}

	setupTestControls() {
		try {
			// Press E to spawn an orb at cursor position
			this.input.keyboard.on('keydown-E', () => {
				const pointer = this.input.activePointer;
				const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
				this.spawnExperienceOrb(worldPoint.x, worldPoint.y, 1);
			});

			// Press R to spawn a random experience orb
			this.input.keyboard.on('keydown-R', () => {
				this.spawnRandomExperienceOrb();
			});

			// Press L to add a level (for testing)
			this.input.keyboard.on('keydown-L', () => {
				if (this.playerLevel) {
					// Add enough XP to level up immediately
					this.playerLevel.addExperience(this.playerLevel.nextLevelExp);
				}
			});

            // Press P to show power-up selection (for testing)
            this.input.keyboard.on('keydown-P', () => {
                if (this.powerUpManager) {
                    this.powerUpManager.showPowerUpSelection();
                }
            });
            
            // Press Z to spawn a zombie at cursor position
            this.input.keyboard.on('keydown-Z', () => {
				const pointer = this.input.activePointer;
				const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
				this.spawnEnemy(worldPoint.x, worldPoint.y);
			});
            
            // Press H to heal player
            this.input.keyboard.on('keydown-H', () => {
				if (this.player && this.player.heal) {
					this.player.heal(10);
				}
			});
			
			// Press D to damage player
			this.input.keyboard.on('keydown-D', () => {
				if (this.player && this.player.takeDamage) {
					this.player.takeDamage(10);
				}
			});
			
			// Press K to kill all enemies (for testing)
			this.input.keyboard.on('keydown-K', () => {
				if (this.enemies) {
					this.enemies.getChildren().forEach(enemy => {
						if (enemy.takeDamage) {
							enemy.takeDamage(1000); // Deal lethal damage
						}
					});
				}
			});
			
			// Press 1-5 to add a specific power-up (for testing)
			const powerUpTypes = ['speed', 'damage', 'health', 'fireRate', 'range'];
			
			for (let i = 0; i < powerUpTypes.length; i++) {
				const keyCode = 49 + i; // 1 = 49, 2 = 50, etc.
				this.input.keyboard.on(`keydown-${keyCode}`, () => {
					if (this.powerUpManager) {
						const type = powerUpTypes[i];
						const level = this.powerUpManager.powerUps[type] + 1;
						console.log(`Adding power-up: ${type} level ${level}`);
						this.powerUpManager.applyPowerUp(type, level);
						this.powerUpManager.powerUps[type] = level;
					}
				});
			}
		} catch (error) {
			console.error("Error setting up test controls:", error);
		}
	}

	spawnExperienceOrb(x, y, value = 1) {
		try {
			// Create the orb
			const expOrb = new ExpOrb(this, x, y);
			this.add.existing(expOrb);

			// Set experience value (scale visually with value)
			expOrb.setExpValue(value);

            // Apply current magnet range from global setting
            if (this.orbMagnetRange) {
                expOrb.magneticRange = this.orbMagnetRange;
            }

			return expOrb;
		} catch (error) {
			console.error("Error spawning experience orb:", error);
			return null;
		}
	}

	spawnRandomExperienceOrb() {
		try {
			// Get random position within the game area
			const padding = 50;
			const x = Phaser.Math.Between(padding, this.cameras.main.width - padding);
			const y = Phaser.Math.Between(padding, this.cameras.main.height - padding);

			// Convert to world coordinates
			const worldPoint = this.cameras.main.getWorldPoint(x, y);

			// Random experience value, weighted toward lower values
			// Higher values are more rare
			let value = 1;
			const roll = Math.random();
			if (roll > 0.95) {
				value = 10; // 5% chance for 10 exp
			} else if (roll > 0.8) {
				value = 5;  // 15% chance for 5 exp
			} else if (roll > 0.5) {
				value = 2;  // 30% chance for 2 exp
			}

			// Spawn the orb
			return this.spawnExperienceOrb(worldPoint.x, worldPoint.y, value);
		} catch (error) {
			console.error("Error spawning random experience orb:", error);
			return null;
		}
	}
	
	spawnEnemy(x, y) {
		try {
			// Check if we've reached the max enemy count
			if (this.enemies && this.enemies.getChildren().length >= this.maxEnemies) {
				console.log("Max enemy count reached, not spawning new enemy");
				return null;
			}
			
			// Create the zombie
			const zombie = new Zombie(this, x, y);
			this.add.existing(zombie);
			
			// Add to enemy group
			this.enemies.add(zombie);
			
			// Scale enemy stats based on difficulty level
			zombie.maxHealth = 30 * (1 + (this.difficultyLevel - 1) * 0.2);
			zombie.health = zombie.maxHealth;
			zombie.damage = 10 * (1 + (this.difficultyLevel - 1) * 0.1);
			zombie.speed = 50 * (1 + (this.difficultyLevel - 1) * 0.05);
			
			return zombie;
		} catch (error) {
			console.error("Error spawning enemy:", error);
			return null;
		}
	}
	
	spawnRandomEnemy() {
		try {
			// Get random position around the edges of the screen
			let x, y;
			const padding = 50;
			const cameraWidth = this.cameras.main.width;
			const cameraHeight = this.cameras.main.height;
			
			// Choose a random edge (0=top, 1=right, 2=bottom, 3=left)
			const edge = Phaser.Math.Between(0, 3);
			
			switch (edge) {
				case 0: // Top
					x = Phaser.Math.Between(padding, cameraWidth - padding);
					y = -padding;
					break;
				case 1: // Right
					x = cameraWidth + padding;
					y = Phaser.Math.Between(padding, cameraHeight - padding);
					break;
				case 2: // Bottom
					x = Phaser.Math.Between(padding, cameraWidth - padding);
					y = cameraHeight + padding;
					break;
				case 3: // Left
					x = -padding;
					y = Phaser.Math.Between(padding, cameraHeight - padding);
					break;
			}
			
			// Convert to world coordinates
			const worldPoint = this.cameras.main.getWorldPoint(x, y);
			
			// Spawn the enemy
			return this.spawnEnemy(worldPoint.x, worldPoint.y);
		} catch (error) {
			console.error("Error spawning random enemy:", error);
			return null;
		}
	}
	
	teleportEnemyNearPlayer(enemy) {
		try {
			// Only teleport if we have a player
			if (!this.player) return;
			
			// Calculate random position around player
			const angle = Math.random() * Math.PI * 2;
			const distance = 300 + Math.random() * 200; // Between 300-500 pixels from player
			
			const newX = this.player.x + Math.cos(angle) * distance;
			const newY = this.player.y + Math.sin(angle) * distance;
			
			// Teleport the enemy
			enemy.x = newX;
			enemy.y = newY;
			
			// Reset velocity
			if (enemy.body) {
				enemy.body.velocity.x = 0;
				enemy.body.velocity.y = 0;
			}
			
			// Create teleport effect
			this.createTeleportEffect(newX, newY);
		} catch (error) {
			console.error("Error teleporting enemy:", error);
		}
	}
	
	createTeleportEffect(x, y) {
		try {
			// Create a simple teleport effect circle
			const circle = this.add.circle(x, y, 30, 0x33ff33, 0.7);
			
			// Animate it
			this.tweens.add({
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

	updateDifficulty() {
		try {
			// Increase difficulty level over time
			const initialDifficultyDuration = 60; // Time in seconds to reach difficulty level 2
			const newDifficultyLevel = 1 + Math.floor(this.gameTime / initialDifficultyDuration);
			
			// Only update if difficulty level has changed
			if (newDifficultyLevel !== this.difficultyLevel) {
				this.difficultyLevel = newDifficultyLevel;
				
				// Update max enemies (increase by 5 per difficulty level)
				this.maxEnemies = 10 + (this.difficultyLevel - 1) * 5;
				
				// Decrease spawn delay (faster spawns)
				const minSpawnDelay = 500; // Minimum 0.5 seconds between spawns
				this.enemySpawnDelay = Math.max(
					minSpawnDelay,
					3000 - (this.difficultyLevel - 1) * 300
				);
				
				// Update existing timer
				if (this.enemySpawnTimer) {
					this.enemySpawnTimer.delay = this.enemySpawnDelay;
				}
				
				console.log(`Difficulty increased to level ${this.difficultyLevel}`);
				console.log(`Max enemies: ${this.maxEnemies}, Spawn delay: ${this.enemySpawnDelay}ms`);
			}
			
			// Update experience orb spawn rate
			if (this.orbSpawnTimer) {
				const initialDelay = 2000;
				const minDelay = 500;
				const timeToReachMin = 300; // In seconds (5 minutes)

				// Calculate new delay
				if (this.gameTime < timeToReachMin) {
					const factor = 1 - (this.gameTime / timeToReachMin);
					const newDelay = minDelay + (initialDelay - minDelay) * factor;

					// Update timer if significantly different
					if (Math.abs(this.orbSpawnTimer.delay - newDelay) > 50) {
						this.orbSpawnTimer.delay = newDelay;
					}
				}
			}
		} catch (error) {
			console.error("Error updating difficulty:", error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here