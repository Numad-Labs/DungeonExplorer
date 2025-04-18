// You can write more code here

/* START OF COMPILED CODE */

import PlayerPrefab from "../prefabs/PlayerPrefab";
/* START-USER-IMPORTS */
import ExpOrb from "../prefabs/ExpOrb";
import PlayerLevel from "../prefabs/PlayerLevel";
/* END-USER-IMPORTS */

export default class FirstArea extends Phaser.Scene {

	constructor() {
		super("FirstArea");

		/* START-USER-CTR-CODE */
		// Game parameters
		this.enemySpawnTimer = null;
		this.orbSpawnTimer = null;
		this.gameTime = 0;
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
		const playerPrefab = new PlayerPrefab(this, 447, 294);
		this.add.existing(playerPrefab);

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
			
			// Log whether the Exp texture is loaded
			console.log("Exp texture loaded:", this.textures.exists('Exp'));
			
			// Setup player level display in top left corner
			this.setupLevelSystem();
			
			// Setup timers for spawning orbs and enemies
			this.setupTimers();
			
			// Set up keyboard shortcuts for testing
			this.setupTestControls();
		} catch (error) {
			console.error("Error in FirstArea create:", error);
		}
	}

	update(time, delta) {
  // If already being collected, skip all logic
  if (this.isBeingCollected || !this.active) return;
  
  try {
    // Look for the player in the scene
    const player = this.scene.player;
    
    // Safety check - if no player is found, just return without doing anything
    if (!player) return;
    
    // Apply floating animation
    this.floatTime += delta / 1000;
    const floatY = this.initialY + Math.sin(this.floatTime * this.floatSpeed) * this.floatOffset;
    this.y = floatY;
    
    // Check if player is within magnetic range
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    if (distance <= this.magneticRange) {
      // Calculate direction vector to player
      const dirX = player.x - this.x;
      const dirY = player.y - this.y;
      
      // Calculate acceleration based on distance (stronger when closer)
      const acceleration = 1 - (distance / this.magneticRange);
      const force = this.magneticForce + (this.maxForce - this.magneticForce) * acceleration;
      
      // Apply direct force toward player
      const angle = Math.atan2(dirY, dirX);
      const speedX = Math.cos(angle) * force;
      const speedY = Math.sin(angle) * force;
      
      // Set final velocity - no boost needed, just direct movement
      this.body.velocity.x = speedX;
      this.body.velocity.y = speedY;
      
      // Check for collection when very close to player
      if (distance < 20) {
        this.collect();
      }
    } else {
      // Slow down if not in magnetic range
      this.body.velocity.x *= 0.95;
      this.body.velocity.y *= 0.95;
    }
  } catch (error) {
    console.error("Error in ExpOrb update:", error);
    this.destroy(); // Destroy on error to prevent ongoing issues
  }
}
	
	setupLevelSystem() {
		try {
			// Create the level display (now using Container instead of Text)
			this.playerLevel = new PlayerLevel(this, 10, 10);
			this.add.existing(this.playerLevel);
			
			// Position it in the top left and add progress bar
			this.playerLevel.setUIPosition(10, 30);
			this.playerLevel.createProgressBar(10, 50, 200, 20);
			
			// Register level up callback
			this.playerLevel.onLevelUp((newLevel) => {
				console.log(`Player reached level ${newLevel}!`);
				// Here you could trigger upgrades, new abilities, etc.
				this.showLevelUpOptions();
			});
		} catch (error) {
			console.error("Error setting up level system:", error);
		}
	}
	
	showLevelUpOptions() {
		try {
			// Pause the game for upgrade selection
			this.scene.pause();
			
			// Example: in a real game, you'd open an upgrade UI here
			console.log("Level up! Game paused for upgrade selection");
			
			// For now, just resume after 1 second
			this.time.delayedCall(1000, () => {
				this.scene.resume();
			});
		} catch (error) {
			console.error("Error showing level up options:", error);
			// Make sure we resume even if there's an error
			this.scene.resume();
		}
	}
	
	setupTimers() {
		try {
			// Set a timer to periodically spawn experience orbs (for testing)
			this.orbSpawnTimer = this.time.addEvent({
				delay: 2000,          // Every 2 seconds
				callback: this.spawnRandomExperienceOrb,
				callbackScope: this,
				loop: true
			});
		} catch (error) {
			console.error("Error setting up timers:", error);
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
	
	updateDifficulty() {
		try {
			// Example: increase spawn rate as game progresses
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
					console.log(`Adjusted spawn delay to ${newDelay.toFixed(0)}ms`);
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