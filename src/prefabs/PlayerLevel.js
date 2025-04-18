// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PlayerLevel extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		/* START-USER-CTR-CODE */
		// Create the level text display
		this.levelText = scene.add.text(0, 0, "Lvl: 1 | Exp: 0/100", {
			fontFamily: 'Arial',
			fontSize: '16px', 
			color: '#ffffff',
			stroke: '#000000',
			strokeThickness: 2,
			align: 'left'
		});
		this.add(this.levelText);
		
		// Set this container to be fixed on screen (UI element)
		this.setScrollFactor(0);
		this.setDepth(100);
		
		// Initialize level system
		this.level = 1;
		this.experience = 0;
		this.nextLevelExp = 100; // Experience needed for level 2
		
		// Store event callbacks
		this.onLevelUpCallbacks = [];
		
		// Make this accessible from the scene
		scene.playerLevelSystem = this;
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	
	// Add experience points
	addExperience(amount) {
		try {
			console.log(`Adding ${amount} experience points`);
			
			// Ensure amount is a valid number
			if (typeof amount !== 'number' || isNaN(amount)) {
				console.warn("Invalid experience amount:", amount);
				amount = 1; // Default to 1 if invalid
			}
			
			this.experience += amount;
			
			// Check for level up
			this.checkLevelUp();
			
			// Update display
			this.updateText();
			
			// Create floating text effect
			this.createFloatingText(`+${amount} EXP`);
			
			return this;
		} catch (error) {
			console.error("Error adding experience:", error);
			return this;
		}
	}
	
	// Check if player should level up
	checkLevelUp() {
		if (this.experience >= this.nextLevelExp) {
			// Level up
			this.level++;
			
			// Subtract current level requirement
			this.experience -= this.nextLevelExp;
			
			// Calculate new level requirement (exponential scaling)
			this.nextLevelExp = Math.floor(100 * Math.pow(1.2, this.level - 1));
			
			// Create level up effect
			this.levelUpEffect();
			
			// Trigger level up event
			try {
				this.onLevelUpCallbacks.forEach(callback => callback(this.level));
			} catch (error) {
				console.error("Error in level up callback:", error);
			}
			
			// Check for multiple level ups
			this.checkLevelUp();
		}
	}
	
	// Update the text display
	updateText() {
		this.levelText.setText(`Lvl: ${this.level} | Exp: ${this.experience}/${this.nextLevelExp}`);
	}
	
	// Create floating text effect when gaining exp
	createFloatingText(message) {
		try {
			// Find player position
			const player = this.scene.player;
			if (!player) {
				console.warn("Player not found for floating text");
				return;
			}
			
			// Create floating text
			const floatingText = this.scene.add.text(
				player.x,
				player.y - 20,
				message,
				{
					fontFamily: 'Arial',
					fontSize: '14px',
					color: '#FFD700',
					stroke: '#000000',
					strokeThickness: 2
				}
			);
			
			// Animate floating text
			this.scene.tweens.add({
				targets: floatingText,
				y: floatingText.y - 50,
				alpha: 0,
				duration: 1500,
				onComplete: () => {
					floatingText.destroy();
				}
			});
		} catch (error) {
			console.error("Error creating floating text:", error);
		}
	}
	
	// Create level up effect using circle animations instead of particles
	levelUpEffect() {
		try {
			// Find player position
			const player = this.scene.player;
			if (!player) {
				console.warn("Player not found for level up effect");
				return;
			}
			
			// Create level up text
			const levelUpText = this.scene.add.text(
				player.x,
				player.y - 40,
				'LEVEL UP!',
				{
					fontFamily: 'Arial',
					fontSize: '24px',
					color: '#00FF00',
					stroke: '#000000',
					strokeThickness: 4
				}
			);
			levelUpText.setOrigin(0.5);
			
			// Create visual effect without particles
			// Create several small circles that expand outward
			for (let i = 0; i < 20; i++) {
				const angle = Math.random() * Math.PI * 2;
				const distance = 20 + Math.random() * 30;
				const size = 4 + Math.random() * 8;
				
				const circle = this.scene.add.circle(
					player.x,
					player.y,
					size,
					0x00FF00, // Green color
					0.8 // Alpha
				);
				
				// Animate the circle
				this.scene.tweens.add({
					targets: circle,
					x: player.x + Math.cos(angle) * distance,
					y: player.y + Math.sin(angle) * distance,
					alpha: 0,
					scale: 0.5,
					duration: 1000,
					ease: 'Power1',
					onComplete: () => {
						circle.destroy();
					}
				});
			}
			
			// Animate level up text
			this.scene.tweens.add({
				targets: levelUpText,
				scaleX: 1.5,
				scaleY: 1.5,
				duration: 200,
				yoyo: true,
				repeat: 1,
				onComplete: () => {
					this.scene.tweens.add({
						targets: levelUpText,
						alpha: 0,
						y: levelUpText.y - 50,
						duration: 1000,
						onComplete: () => {
							levelUpText.destroy();
						}
					});
				}
			});
			
			// Log the level up
			console.log("Player reached level " + this.level + "!");
		} catch (error) {
			console.error("Error creating level up effect:", error);
		}
	}
	
	// Register callback for level up events
	onLevelUp(callback) {
		if (typeof callback === 'function') {
			this.onLevelUpCallbacks.push(callback);
		}
		return this;
	}
	
	// Get current level
	getLevel() {
		return this.level;
	}
	
	// Get experience progress (0-1) toward next level
	getLevelProgress() {
		return this.experience / this.nextLevelExp;
	}
	
	// Set position in UI
	setUIPosition(x, y) {
		this.setPosition(x, y);
		return this;
	}
	
	// Create experience progress bar
	createProgressBar(x, y, width, height) {
		try {
			if (!this.progressBarBg) {
				// Create background
				this.progressBarBg = this.scene.add.rectangle(
					x, y, width, height,
					0x000000, 0.7
				);
				this.progressBarBg.setScrollFactor(0);
				this.progressBarBg.setOrigin(0, 0.5);
				this.progressBarBg.setDepth(99);
				
				// Create fill
				this.progressBarFill = this.scene.add.rectangle(
					x + 2, y, 0, height - 4,
					0x00FF00, 1
				);
				this.progressBarFill.setScrollFactor(0);
				this.progressBarFill.setOrigin(0, 0.5);
				this.progressBarFill.setDepth(99);
				
				// Store dimensions for updates
				this.progressBarWidth = width - 4;
			}
			
			// Update progress bar
			this.updateProgressBar();
			
			return this;
		} catch (error) {
			console.error("Error creating progress bar:", error);
			return this;
		}
	}
	
	// Update progress bar
	updateProgressBar() {
		try {
			if (this.progressBarFill && this.progressBarWidth) {
				// Calculate width based on progress
				const progress = this.getLevelProgress();
				const width = this.progressBarWidth * progress;
				
				// Update width
				this.progressBarFill.width = width;
			}
		} catch (error) {
			console.error("Error updating progress bar:", error);
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here